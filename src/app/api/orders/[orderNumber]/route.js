import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { orderNumber } = await params;

    const orders = await query(
      `SELECT id, order_number, user_id, account_type, status, payment_mode, payment_status, 
              CAST(subtotal AS DOUBLE) as subtotal, 
              CAST(delivery_fee AS DOUBLE) as delivery_fee, 
              CAST(tax_gst AS DOUBLE) as tax_gst, 
              CAST(total_amount AS DOUBLE) as total_amount, 
              delivery_address, delivery_notes, created_at 
       FROM orders 
       WHERE order_number = ? AND user_id = ?`,
      [orderNumber, session.id]
    );

    if (orders.length === 0) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    const order = orders[0];

    // Fetch items
    const items = await query(
      `SELECT id, product_name_snapshot, unit_size_snapshot, 
              CAST(unit_price AS DOUBLE) as unit_price, quantity, 
              CAST(total_price AS DOUBLE) as total_price 
       FROM order_items 
       WHERE order_id = ?`,
      [order.id]
    );

    // Determine delivery partner based on account type
    const isWholesale = order.account_type === 'HOTEL_WHOLESALE';
    const deliveryPartner = isWholesale
      ? {
          name: 'Suresh More',
          vehicle: 'Tata Ace Commercial Cold Cargo (MH 12 QZ 4821)',
          phone: '+91 98221 04491',
          rating: '4.95',
          deliveries_count: '1,420+ bulk drops',
          eta_minutes: 35
        }
      : {
          name: 'Rohan Deshmukh',
          vehicle: 'Electric Delivery Scooter (MH 12 AB 9042)',
          phone: '+91 99702 38119',
          rating: '4.9',
          deliveries_count: '2,890+ quick drops',
          eta_minutes: 15
        };

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        items,
        deliveryPartner
      }
    });
  } catch (error) {
    console.error('Error fetching single order:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
