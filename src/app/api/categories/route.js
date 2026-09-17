import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const categories = await query(
      'SELECT id, name, slug, icon_name, display_order FROM categories ORDER BY display_order ASC'
    );
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error('Error fetching categories from MySQL:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
