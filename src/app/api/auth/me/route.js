import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, user: null }, { status: 200 });
    }

    const users = await query(
      'SELECT id, phone, full_name, account_type FROM users WHERE id = ?',
      [session.id]
    );

    if (users.length === 0) {
      return NextResponse.json({ success: false, user: null }, { status: 200 });
    }

    const user = users[0];

    let hotelProfile = null;
    if (user.account_type === 'HOTEL_WHOLESALE') {
      const hotels = await query(
        'SELECT hotel_name, manager_name, gstin, dock_receiving_notes FROM hotel_profiles WHERE user_id = ?',
        [user.id]
      );
      if (hotels.length > 0) {
        hotelProfile = hotels[0];
      }
    }

    let storeProfile = null;
    if (user.account_type === 'ADMIN') {
      const stores = await query(
        'SELECT id, store_name, slug, city, pincode FROM stores WHERE admin_user_id = ? LIMIT 1',
        [user.id]
      );
      if (stores.length > 0) {
        storeProfile = stores[0];
      }
    }

    const addresses = await query(
      'SELECT id, address_type, address_line, landmark, city, pincode, is_default FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC',
      [user.id]
    );

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        full_name: user.full_name,
        account_type: user.account_type,
        hotel_name: hotelProfile?.hotel_name || null,
        hotelProfile,
        store_id: storeProfile?.id || null,
        store_name: storeProfile?.store_name || null,
        store_slug: storeProfile?.slug || null,
        store: storeProfile,
        addresses,
        defaultAddress: addresses[0] || null
      }
    });
  } catch (error) {
    console.error('Session retrieval error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
