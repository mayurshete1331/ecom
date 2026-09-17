import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.account_type !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
    }

    let storeId = session.store_id;
    if (!storeId) {
      const stores = await query('SELECT id FROM stores WHERE admin_user_id = ? LIMIT 1', [session.id]);
      storeId = stores[0]?.id || 1;
    }

    const orders = await query(`
      SELECT 
        o.id,
        o.order_number,
        o.store_id,
        o.account_type,
        o.status,
        o.payment_mode,
        o.payment_status,
        CAST(o.subtotal AS DOUBLE) as subtotal,
        CAST(o.delivery_fee AS DOUBLE) as delivery_fee,
        CAST(o.tax_gst AS DOUBLE) as tax_gst,
        CAST(o.total_amount AS DOUBLE) as total_amount,
        o.delivery_address,
        o.delivery_notes,
        o.created_at,
        u.full_name as customer_name,
        u.phone as customer_phone,
        hp.hotel_name,
        hp.gstin
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN hotel_profiles hp ON u.id = hp.user_id
      WHERE o.store_id = ?
      ORDER BY o.id DESC
    `, [storeId]);

    if (orders.length === 0) {
      return NextResponse.json({ success: true, orders: [] });
    }

    const orderIds = orders.map(o => o.id);
    const placeholders = orderIds.map(() => '?').join(',');
    const items = await query(
      `SELECT id, order_id, product_name_snapshot, unit_size_snapshot, 
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
    console.error('Admin orders query error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await getSessionUser();
    if (!session || session.account_type !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
    }

    let storeId = session.store_id;
    if (!storeId) {
      const stores = await query('SELECT id FROM stores WHERE admin_user_id = ? LIMIT 1', [session.id]);
      storeId = stores[0]?.id || 1;
    }

    const body = await request.json();
    const { order_id, status, payment_status } = body;

    if (!order_id) {
      return NextResponse.json({ success: false, message: 'Order ID is required' }, { status: 400 });
    }

    if (status) {
      await query('UPDATE orders SET status = ? WHERE id = ? AND store_id = ?', [status, order_id, storeId]);
    }

    if (payment_status) {
      await query('UPDATE orders SET payment_status = ? WHERE id = ? AND store_id = ?', [payment_status, order_id, storeId]);
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully'
    });
  } catch (error) {
    console.error('Admin order update error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
