import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { signToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(request) {
  try {
    const { phone, password } = await request.json();

    if (!phone || !password) {
      return NextResponse.json(
        { success: false, message: 'Phone number and password are required' },
        { status: 400 }
      );
    }

    const users = await query(
      'SELECT id, phone, password_hash, full_name, account_type FROM users WHERE phone = ?',
      [phone]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No account found with this phone number' },
        { status: 401 }
      );
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, message: 'Incorrect password' },
        { status: 401 }
      );
    }

    // Fetch Hotel Profile if applicable
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

    // Fetch Store if ADMIN
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

    // Fetch addresses
    const addresses = await query(
      'SELECT id, address_type, address_line, landmark, city, pincode, is_default FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC',
      [user.id]
    );

    const userPayload = {
      id: user.id,
      phone: user.phone,
      full_name: user.full_name,
      account_type: user.account_type,
      hotel_name: hotelProfile?.hotel_name || null,
      store_id: storeProfile?.id || null,
      store_name: storeProfile?.store_name || null,
      store_slug: storeProfile?.slug || null
    };

    const token = signToken(userPayload);

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        ...userPayload,
        hotelProfile,
        store: storeProfile,
        addresses,
        defaultAddress: addresses[0] || null
      }
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error in MySQL:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
