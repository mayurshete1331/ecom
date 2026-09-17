import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = (searchParams.get('mode') || 'retail').toUpperCase(); // 'RETAIL' or 'WHOLESALE'
    const categorySlug = searchParams.get('category');
    const search = searchParams.get('search');
    const storeFilter = searchParams.get('store');

    const tierType = mode === 'WHOLESALE' ? 'WHOLESALE' : 'RETAIL';

    let sql = `
      SELECT 
        p.id AS product_id,
        p.name AS product_name,
        p.slug AS product_slug,
        p.description,
        p.image_url,
        p.badge,
        p.is_featured,
        p.store_id,
        s.store_name,
        s.slug AS store_slug,
        c.id AS category_id,
        c.name AS category_name,
        c.slug AS category_slug,
        t.id AS tier_id,
        t.tier_type,
        t.unit_size,
        CAST(t.price AS DOUBLE) AS price,
        CAST(t.mrp AS DOUBLE) AS mrp,
        t.stock_quantity,
        t.min_order_qty
      FROM products p
      JOIN stores s ON p.store_id = s.id
      JOIN categories c ON p.category_id = c.id
      JOIN product_tiers t ON p.id = t.product_id
      WHERE p.is_active = TRUE AND s.is_active = TRUE AND t.tier_type = ?
    `;

    const params = [tierType];

    if (storeFilter && storeFilter !== 'all') {
      sql += ` AND (s.slug = ? OR s.id = ?)`;
      params.push(storeFilter, storeFilter);
    }

    if (categorySlug && categorySlug !== 'all') {
      sql += ` AND c.slug = ?`;
      params.push(categorySlug);
    }

    if (search && search.trim()) {
      sql += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    sql += ` ORDER BY p.is_featured DESC, c.display_order ASC, p.id ASC, t.price ASC`;

    const rows = await query(sql, params);

    // Group rows by product_id
    const productMap = new Map();
    for (const row of rows) {
      if (!productMap.has(row.product_id)) {
        productMap.set(row.product_id, {
          id: row.product_id,
          name: row.product_name,
          slug: row.product_slug,
          description: row.description,
          image_url: row.image_url,
          badge: row.badge,
          is_featured: Boolean(row.is_featured),
          store_id: row.store_id,
          store_name: row.store_name,
          store_slug: row.store_slug,
          store: {
            id: row.store_id,
            name: row.store_name,
            slug: row.store_slug
          },
          category: {
            id: row.category_id,
            name: row.category_name,
            slug: row.category_slug
          },
          tiers: []
        });
      }

      const prod = productMap.get(row.product_id);
      prod.tiers.push({
        id: row.tier_id,
        tier_type: row.tier_type,
        unit_size: row.unit_size,
        price: row.price,
        mrp: row.mrp,
        stock_quantity: row.stock_quantity,
        min_order_qty: row.min_order_qty,
        discount_percent: row.mrp > row.price ? Math.round(((row.mrp - row.price) / row.mrp) * 100) : 0
      });
    }

    const products = Array.from(productMap.values()).map(p => {
      // default tier is the first one
      const defaultTier = p.tiers[0] || null;
      return {
        ...p,
        default_tier: defaultTier
      };
    });

    return NextResponse.json({
      success: true,
      mode: tierType,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Error querying products from MySQL:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
