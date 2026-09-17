import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getPool } from '@/lib/db';

export async function POST(request) {
  try {
    const session = await getSessionUser();
    if (!session || session.account_type !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      category_id,
      description,
      image_url,
      badge,
      is_featured = false,
      tiers = []
    } = body;

    if (!name || !category_id || !image_url) {
      return NextResponse.json(
        { success: false, message: 'Name, category, and image URL are required' },
        { status: 400 }
      );
    }

    let storeId = session.store_id;
    if (!storeId) {
      const [stores] = await getPool().query('SELECT id FROM stores WHERE admin_user_id = ? LIMIT 1', [session.id]);
      storeId = stores[0]?.id || 1;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();

    const pool = getPool();
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      const [pRes] = await conn.query(
        `INSERT INTO products (category_id, store_id, name, slug, description, image_url, badge, is_featured) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [category_id, storeId, name, slug, description || '', image_url, badge || null, Boolean(is_featured)]
      );

      const productId = pRes.insertId;

      // Insert tiers
      if (Array.isArray(tiers) && tiers.length > 0) {
        for (const t of tiers) {
          await conn.query(
            `INSERT INTO product_tiers (product_id, tier_type, unit_size, price, mrp, stock_quantity, min_order_qty) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              productId,
              t.tier_type, // 'RETAIL' or 'WHOLESALE'
              t.unit_size,
              t.price,
              t.mrp || t.price,
              t.stock_quantity || 100,
              t.min_order_qty || 1
            ]
          );
        }
      }

      await conn.commit();
      conn.release();

      return NextResponse.json({
        success: true,
        message: 'Product added successfully to database',
        product_id: productId
      });
    } catch (err) {
      await conn.rollback();
      conn.release();
      throw err;
    }
  } catch (error) {
    console.error('Admin create product error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
