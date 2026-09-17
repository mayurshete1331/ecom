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

    const customers = await query(`
      SELECT 
        u.id AS customer_id,
        u.full_name,
        u.phone,
        u.account_type,
        hp.hotel_name,
        hp.gstin,
        hp.dock_receiving_notes,
        COUNT(o.id) AS total_orders,
        CAST(SUM(o.total_amount) AS DOUBLE) AS lifetime_spend,
        MAX(o.created_at) AS last_order_date,
        MAX(o.delivery_address) AS last_delivery_address
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN hotel_profiles hp ON u.id = hp.user_id
      WHERE o.store_id = ?
      GROUP BY u.id, u.full_name, u.phone, u.account_type, hp.hotel_name, hp.gstin, hp.dock_receiving_notes
      ORDER BY lifetime_spend DESC, total_orders DESC
    `, [storeId]);

    return NextResponse.json({ success: true, customers });
  } catch (error) {
    console.error('Admin customers query error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
