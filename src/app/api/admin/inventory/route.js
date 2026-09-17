import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.account_type !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Resolve store for this admin
    let storeId = session.store_id;
    let storeName = session.store_name;
    if (!storeId) {
      const stores = await query('SELECT id, store_name FROM stores WHERE admin_user_id = ? LIMIT 1', [session.id]);
      if (stores.length > 0) {
        storeId = stores[0].id;
        storeName = stores[0].store_name;
      } else {
        storeId = 1;
      }
    }

    const rows = await query(`
      SELECT 
        p.id AS product_id,
        p.name AS product_name,
        p.image_url,
        p.is_active,
        p.badge,
        c.name AS category_name,
        t.id AS tier_id,
        t.tier_type,
        t.unit_size,
        CAST(t.price AS DOUBLE) AS price,
        CAST(t.mrp AS DOUBLE) AS mrp,
        t.stock_quantity,
        t.min_order_qty
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN product_tiers t ON p.id = t.product_id
      WHERE p.store_id = ?
      ORDER BY p.id ASC, t.tier_type ASC, t.id ASC
    `, [storeId]);

    // Group by product
    const productMap = new Map();
    for (const r of rows) {
      if (!productMap.has(r.product_id)) {
        productMap.set(r.product_id, {
          id: r.product_id,
          name: r.product_name,
          image_url: r.image_url,
          is_active: Boolean(r.is_active),
          badge: r.badge,
          category_name: r.category_name,
          tiers: []
        });
      }
      productMap.get(r.product_id).tiers.push({
        tier_id: r.tier_id,
        tier_type: r.tier_type,
        unit_size: r.unit_size,
        price: r.price,
        mrp: r.mrp,
        stock_quantity: r.stock_quantity,
        min_order_qty: r.min_order_qty
      });
    }

    return NextResponse.json({
      success: true,
      store_id: storeId,
      store_name: storeName,
      products: Array.from(productMap.values())
    });
  } catch (error) {
    console.error('Admin inventory query error:', error);
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
    const { tier_id, stock_quantity, price, mrp, stock_delta } = body;

    if (!tier_id) {
      return NextResponse.json({ success: false, message: 'Tier ID is required' }, { status: 400 });
    }

    // Verify ownership: tier must belong to this store
    const check = await query(`
      SELECT t.id 
      FROM product_tiers t
      JOIN products p ON t.product_id = p.id
      WHERE t.id = ? AND p.store_id = ?
    `, [tier_id, storeId]);

    if (check.length === 0) {
      return NextResponse.json({ success: false, message: 'Unauthorized to modify another store’s product' }, { status: 403 });
    }

    if (stock_delta !== undefined) {
      await query(
        'UPDATE product_tiers SET stock_quantity = GREATEST(0, stock_quantity + ?) WHERE id = ?',
        [stock_delta, tier_id]
      );
    } else if (stock_quantity !== undefined) {
      await query(
        'UPDATE product_tiers SET stock_quantity = ? WHERE id = ?',
        [stock_quantity, tier_id]
      );
    }

    if (price !== undefined) {
      await query(
        'UPDATE product_tiers SET price = ? WHERE id = ?',
        [price, tier_id]
      );
    }

    if (mrp !== undefined) {
      await query(
        'UPDATE product_tiers SET mrp = ? WHERE id = ?',
        [mrp, tier_id]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Inventory tier updated successfully'
    });
  } catch (error) {
    console.error('Admin inventory update error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
