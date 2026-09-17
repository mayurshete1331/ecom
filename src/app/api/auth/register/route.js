import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getPool } from '@/lib/db';
import { signToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      phone,
      password,
      full_name,
      account_type = 'RETAIL',
      hotel_name,
      gstin,
      dock_receiving_notes,
      address_line,
      landmark,
      city = 'Pune',
      pincode = '411045'
    } = body;

    if (!phone || !password || !full_name) {
      return NextResponse.json(
        { success: false, message: 'Phone, password, and full name are required' },
        { status: 400 }
      );
    }

    if (account_type === 'HOTEL_WHOLESALE' && !hotel_name) {
      return NextResponse.json(
        { success: false, message: 'Hotel/Business name is required for wholesale accounts' },
        { status: 400 }
      );
    }

    const pool = getPool();
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // Check if user already exists
      const [existing] = await conn.query('SELECT id FROM users WHERE phone = ?', [phone]);
      if (existing.length > 0) {
        await conn.rollback();
        conn.release();
        return NextResponse.json(
          { success: false, message: 'An account with this phone number already exists' },
          { status: 409 }
        );
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Insert User
      const [userRes] = await conn.query(
        'INSERT INTO users (phone, password_hash, full_name, account_type) VALUES (?, ?, ?, ?)',
        [phone, passwordHash, full_name, account_type]
      );
      const userId = userRes.insertId;

      // Insert Hotel Profile if applicable
      let hotelProfile = null;
      if (account_type === 'HOTEL_WHOLESALE') {
        await conn.query(
          'INSERT INTO hotel_profiles (user_id, hotel_name, manager_name, gstin, dock_receiving_notes) VALUES (?, ?, ?, ?, ?)',
          [userId, hotel_name, full_name, gstin || null, dock_receiving_notes || null]
        );
        hotelProfile = { hotel_name, manager_name: full_name, gstin, dock_receiving_notes };
      }

      // Insert Address if provided
      let addressRecord = null;
      if (address_line) {
        const addressType = account_type === 'HOTEL_WHOLESALE' ? 'HOTEL_DOCK' : 'HOME';
        const [addrRes] = await conn.query(
          'INSERT INTO addresses (user_id, address_type, address_line, landmark, city, pincode, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [userId, addressType, address_line, landmark || null, city, pincode, true]
        );
        addressRecord = {
          id: addrRes.insertId,
          address_type: addressType,
          address_line,
          landmark,
          city,
          pincode
        };
      }

      await conn.commit();
      conn.release();

      // Generate JWT Token
      const userPayload = {
        id: userId,
        phone,
        full_name,
        account_type,
        hotel_name: hotelProfile?.hotel_name || null
      };

      const token = signToken(userPayload);

      const response = NextResponse.json({
        success: true,
        message: 'Account registered successfully',
        user: {
          ...userPayload,
          hotelProfile,
          defaultAddress: addressRecord
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
    } catch (err) {
      await conn.rollback();
      conn.release();
      throw err;
    }
  } catch (error) {
    console.error('Registration error in MySQL:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
