import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getPool } from '@/lib/db';
import { signToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      full_name,
      phone,
      password,
      store_name,
      city = 'Pune',
      pincode = '411045',
      description
    } = body;

    if (!full_name || !phone || !password || !store_name) {
      return NextResponse.json(
        { success: false, message: 'Name, mobile phone, password, and Store Name are required.' },
        { status: 400 }
      );
    }

    const pool = getPool();
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // Check if user already exists
      const [existingUser] = await conn.query('SELECT id FROM users WHERE phone = ?', [phone]);
      if (existingUser.length > 0) {
        await conn.rollback();
        conn.release();
        return NextResponse.json(
          { success: false, message: 'An account with this phone number already exists.' },
          { status: 409 }
        );
      }

      // Generate unique store slug
      const baseSlug = store_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // 1. Insert User as ADMIN
      const [userRes] = await conn.query(
        'INSERT INTO users (phone, password_hash, full_name, account_type) VALUES (?, ?, ?, ?)',
        [phone, passwordHash, full_name, 'ADMIN']
      );
      const userId = userRes.insertId;

      // 2. Insert Store
      const [storeRes] = await conn.query(
        `INSERT INTO stores (admin_user_id, store_name, slug, description, phone, city, pincode) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          store_name.trim(),
          uniqueSlug,
          description ? description.trim() : `${store_name} farm fresh produce and daily harvest hub.`,
          phone,
          city.trim(),
          pincode.trim()
        ]
      );
      const storeId = storeRes.insertId;

      await conn.commit();
      conn.release();

      const userPayload = {
        id: userId,
        phone,
        full_name,
        account_type: 'ADMIN',
        store_id: storeId,
        store_name: store_name.trim(),
        store_slug: uniqueSlug
      };

      const token = signToken(userPayload);

      const response = NextResponse.json({
        success: true,
        message: 'Admin store registered successfully!',
        user: userPayload,
        store: {
          id: storeId,
          store_name: store_name.trim(),
          slug: uniqueSlug,
          city,
          pincode
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
    console.error('Admin registration error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
