import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const stores = await query(`
      SELECT 
        s.id,
        s.store_name,
        s.slug,
        s.description,
        s.phone,
        s.city,
        s.pincode,
        COUNT(p.id) AS products_count
      FROM stores s
      LEFT JOIN products p ON s.id = p.store_id AND p.is_active = TRUE
      WHERE s.is_active = TRUE
      GROUP BY s.id
      ORDER BY s.id ASC
    `);

    return NextResponse.json({ success: true, stores });
  } catch (error) {
    console.error('Stores query error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
