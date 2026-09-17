import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getPool, query } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const orders = await query(
      `SELECT o.id, o.order_number, o.store_id, s.store_name, o.account_type, o.status, o.payment_mode, o.payment_status, 
              CAST(o.subtotal AS DOUBLE) as subtotal, 
              CAST(o.delivery_fee AS DOUBLE) as delivery_fee, 
              CAST(o.tax_gst AS DOUBLE) as tax_gst, 
              CAST(o.total_amount AS DOUBLE) as total_amount, 
              o.delivery_address, o.delivery_notes, o.created_at 
       FROM orders o
       LEFT JOIN stores s ON o.store_id = s.id
       WHERE o.user_id = ? 
       ORDER BY o.id DESC`,
      [session.id]
    );

    if (orders.length === 0) {
      return NextResponse.json({ success: true, orders: [] });
    }

    // Fetch items for all orders
    const orderIds = orders.map(o => o.id);
    const placeholders = orderIds.map(() => '?').join(',');
    const items = await query(
      `SELECT id, order_id, product_id, tier_id, product_name_snapshot, unit_size_snapshot, 
              CAST(unit_price AS DOUBLE) as unit_price, quantity, 
              CAST(total_price AS DOUBLE) as total_price 
       FROM order_items 
       WHERE order_id IN (${placeholders})`,
      orderIds
    );

    const itemsByOrder = {};
    for (const item of items) {
      if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
      itemsByOrder[item.order_id].push(item);
    }

    const fullOrders = orders.map(order => ({
      ...order,
      items: itemsByOrder[order.id] || []
    }));

    return NextResponse.json({ success: true, orders: fullOrders });
  } catch (error) {
    console.error('Error fetching orders from MySQL:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Please login to place your order' }, { status: 401 });
    }

    const body = await request.json();
    const { items, delivery_address, delivery_notes, account_type } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, message: 'Cart items cannot be empty' }, { status: 400 });
    }

    if (!delivery_address || !delivery_address.trim()) {
      return NextResponse.json({ success: false, message: 'Delivery address is required' }, { status: 400 });
    }

    const pool = getPool();
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      let subtotal = 0;
      const verifiedItems = [];

      let orderStoreId = 1;
      for (const item of items) {
        // Query current tier and product from MySQL to enforce verified pricing
        const [tierRows] = await conn.query(
          `SELECT t.id, t.product_id, p.store_id, t.tier_type, t.unit_size, CAST(t.price AS DOUBLE) as price, 
                  t.stock_quantity, t.min_order_qty, p.name as product_name
           FROM product_tiers t
           JOIN products p ON t.product_id = p.id
           WHERE t.id = ? AND p.is_active = TRUE`,
          [item.tier_id]
        );

        if (tierRows.length === 0) {
          throw new Error(`Product tier ID ${item.tier_id} is unavailable or out of stock`);
        }

        const tier = tierRows[0];
        if (tier.store_id) {
          orderStoreId = tier.store_id;
        }
        const qty = parseInt(item.quantity, 10);
        if (qty <= 0) continue;

        if (qty < tier.min_order_qty) {
          throw new Error(`Minimum order quantity for ${tier.product_name} (${tier.unit_size}) is ${tier.min_order_qty}`);
        }

        const itemTotal = tier.price * qty;
        subtotal += itemTotal;

        verifiedItems.push({
          product_id: tier.product_id,
          tier_id: tier.id,
          product_name_snapshot: tier.product_name,
          unit_size_snapshot: tier.unit_size,
          unit_price: tier.price,
          quantity: qty,
          total_price: itemTotal
        });

        // Decrement inventory
        await conn.query(
          `UPDATE product_tiers SET stock_quantity = GREATEST(0, stock_quantity - ?) WHERE id = ?`,
          [qty, tier.id]
        );
      }

      if (verifiedItems.length === 0) {
        throw new Error('No valid items in cart');
      }

      const orderAccountType = account_type === 'HOTEL_WHOLESALE' ? 'HOTEL_WHOLESALE' : 'RETAIL';
      
      // Calculate fees
      let deliveryFee = 0;
      let taxGst = 0;

      if (orderAccountType === 'RETAIL') {
        deliveryFee = subtotal >= 199 ? 0 : 25;
      } else {
        // Wholesale: Free delivery above 2000, 5% GST for commercial billing
        deliveryFee = subtotal >= 2000 ? 0 : 120;
        taxGst = Math.round(subtotal * 0.05 * 100) / 100;
      }

      const totalAmount = subtotal + deliveryFee + taxGst;

      // Unique human-readable order number
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomPart = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `FD-${datePart}-${randomPart}`;

      // Insert Order
      const [orderRes] = await conn.query(
        `INSERT INTO orders 
         (order_number, store_id, user_id, account_type, status, payment_mode, payment_status, 
          subtotal, delivery_fee, tax_gst, total_amount, delivery_address, delivery_notes) 
         VALUES (?, ?, ?, ?, 'PLACED', 'COD', 'PENDING_ON_DELIVERY', ?, ?, ?, ?, ?, ?)`,
        [
          orderNumber,
          orderStoreId,
          session.id,
          orderAccountType,
          subtotal,
          deliveryFee,
          taxGst,
          totalAmount,
          delivery_address.trim(),
          delivery_notes ? delivery_notes.trim() : null
        ]
      );

      const orderId = orderRes.insertId;

      // Insert Order Items
      for (const it of verifiedItems) {
        await conn.query(
          `INSERT INTO order_items 
           (order_id, product_id, tier_id, product_name_snapshot, unit_size_snapshot, unit_price, quantity, total_price) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            it.product_id,
            it.tier_id,
            it.product_name_snapshot,
            it.unit_size_snapshot,
            it.unit_price,
            it.quantity,
            it.total_price
          ]
        );
      }

      await conn.commit();
      conn.release();

      return NextResponse.json({
        success: true,
        message: 'Order placed successfully via Cash on Delivery!',
        order: {
          id: orderId,
          order_number: orderNumber,
          account_type: orderAccountType,
          status: 'PLACED',
          payment_mode: 'COD',
          payment_status: 'PENDING_ON_DELIVERY',
          subtotal,
          delivery_fee: deliveryFee,
          tax_gst: taxGst,
          total_amount: totalAmount,
          delivery_address,
          delivery_notes,
          items: verifiedItems,
          created_at: new Date().toISOString()
        }
      });
    } catch (err) {
      await conn.rollback();
      conn.release();
      throw err;
    }
  } catch (error) {
    console.error('Error creating order in MySQL:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
