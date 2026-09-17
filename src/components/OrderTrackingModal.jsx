'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  MessageSquare, 
  ShieldCheck, 
  Truck, 
  Bike, 
  Package, 
  Sparkles,
  ChevronRight,
  Download,
  FileText
} from 'lucide-react';

export default function OrderTrackingModal() {
  const { isTrackingOpen, setIsTrackingOpen, activeOrder } = useCart();
  const [currentStep, setCurrentStep] = useState(2); // 1: Placed, 2: Packing, 3: Dispatched, 4: Delivered
  const [driverProgress, setDriverProgress] = useState(35); // percentage along route

  // Simulate progress progression
  useEffect(() => {
    if (!isTrackingOpen || !activeOrder) return;

    const interval = setInterval(() => {
      setDriverProgress((prev) => {
        if (prev >= 85) return 85;
        return prev + 5;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isTrackingOpen, activeOrder]);

  if (!isTrackingOpen || !activeOrder) return null;

  const isWholesale = activeOrder.account_type === 'HOTEL_WHOLESALE';
  const partnerName = isWholesale ? 'Suresh More' : 'Rohan Deshmukh';
  const partnerVehicle = isWholesale ? 'Tata Ace Cold-Chain (MH 12 QZ 4821)' : 'Electric Fast Scooter (MH 12 AB 9042)';
  const partnerPhone = isWholesale ? '+91 98221 04491' : '+91 99702 38119';

  return (
    <div className="drawer-backdrop" onClick={() => setIsTrackingOpen(false)}>
      <div 
        className="bottom-sheet" 
        onClick={(e) => e.stopPropagation()}
        style={{ height: '92vh' }}
      >
        <div className="bottom-sheet-handle" />

        {/* Top Header */}
        <div style={{
          padding: '12px 18px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                fontSize: '10px',
                fontWeight: '800',
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: '#ecfdf5',
                color: '#047857'
              }}>
                LIVE TRACKING
              </span>
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
                {activeOrder.order_number}
              </span>
            </div>
            <p style={{ fontSize: '11px', color: '#64748b' }}>
              {isWholesale ? 'Hotel Commercial Bulk Delivery' : '15-min Farm Express Delivery'}
            </p>
          </div>

          <button
            onClick={() => setIsTrackingOpen(false)}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Tracking Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px' }}>
          {/* Estimated Arrival Hero Card */}
          <div style={{
            background: isWholesale 
              ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' 
              : 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
            color: '#ffffff',
            borderRadius: '16px',
            padding: '16px 18px',
            marginBottom: '16px',
            boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700' }}>
                <Clock size={15} color="#fbbf24" />
                <span>ESTIMATED ARRIVAL</span>
              </div>
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                padding: '2px 8px',
                borderRadius: '999px',
                fontSize: '10px',
                fontWeight: '700'
              }}>
                ON TIME
              </div>
            </div>

            <div style={{ fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px' }}>
              {isWholesale ? 'By 7:30 AM Tomorrow' : 'Arriving in 14 Mins'}
            </div>
            <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.85)', marginTop: '2px' }}>
              {isWholesale 
                ? 'Produce is reserved from today’s fresh harvest at Pune Dispatch Hub.'
                : 'Driver is picking up your graded produce from Baner Hub.'}
            </p>
          </div>

          {/* Simulated Live Route Map */}
          <div style={{
            height: '180px',
            backgroundColor: '#e2e8f0',
            borderRadius: '16px',
            border: '1px solid #cbd5e1',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '16px',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
          }}>
            {/* Map background grid pattern */}
            <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#cbd5e1" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="#f1f5f9" />
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Road Curve */}
              <path
                d="M 40 140 Q 140 40, 240 100 T 400 50"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M 40 140 Q 140 40, 240 100 T 400 50"
                fill="none"
                stroke="#059669"
                strokeWidth="4"
                strokeDasharray="6 6"
                strokeLinecap="round"
              />
            </svg>

            {/* Hub / Dark Store Marker */}
            <div style={{
              position: 'absolute',
              left: '30px',
              top: '120px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
              }}>
                <Package size={16} color="#ffffff" />
              </div>
              <span style={{ fontSize: '9px', fontWeight: '800', color: '#0f172a', backgroundColor: '#ffffff', padding: '1px 4px', borderRadius: '4px', marginTop: '2px', border: '1px solid #cbd5e1' }}>
                FARM HUB
              </span>
            </div>

            {/* Moving Driver Marker */}
            <div style={{
              position: 'absolute',
              left: `${driverProgress}%`,
              top: '70px',
              transform: 'translate(-50%, -50%)',
              transition: 'left 1s ease-in-out',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 10
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#059669',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.4)',
                border: '2px solid #ffffff'
              }}>
                {isWholesale ? <Truck size={18} /> : <Bike size={18} />}
              </div>
              <span style={{ fontSize: '9px', fontWeight: '800', color: '#047857', backgroundColor: '#ecfdf5', padding: '1px 6px', borderRadius: '4px', marginTop: '3px', border: '1px solid #a7f3d0' }}>
                ON THE WAY
              </span>
            </div>

            {/* Destination Pin */}
            <div style={{
              position: 'absolute',
              right: '30px',
              top: '35px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(220, 38, 38, 0.3)'
              }}>
                <MapPin size={18} />
              </div>
              <span style={{ fontSize: '9px', fontWeight: '800', color: '#991b1b', backgroundColor: '#fee2e2', padding: '1px 4px', borderRadius: '4px', marginTop: '2px', border: '1px solid #fecaca' }}>
                YOU
              </span>
            </div>
          </div>

          {/* Delivery Partner Profile Card */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: '#d1fae5',
                color: '#047857',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: '800'
              }}>
                {partnerName[0]}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
                    {partnerName}
                  </h4>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    backgroundColor: '#fef3c7',
                    color: '#b45309',
                    padding: '1px 5px',
                    borderRadius: '4px'
                  }}>
                    ⭐ 4.95
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  {partnerVehicle}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <a
                href={`tel:${partnerPhone}`}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  color: '#047857',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none'
                }}
              >
                <Phone size={16} />
              </a>
            </div>
          </div>

          {/* Stepper Status Timeline */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <h5 style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '14px' }}>
              Order Lifecycle
            </h5>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
              {/* Step 1 */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <CheckCircle2 size={14} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>
                    Order Placed via Cash on Delivery
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>
                    Order received and confirmed
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Package size={14} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>
                    Produce Graded, Weighed & Packaged
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>
                    Cleaned sprouts & premium veggies packed in fresh crates
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {isWholesale ? <Truck size={14} /> : <Bike size={14} />}
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>
                    Out for Delivery
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>
                    Driver is approaching your drop address
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Snapshot & Cash on Delivery Notice */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '14px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a' }}>
                Amount to Pay on Delivery:
              </span>
              <span style={{ fontSize: '16px', fontWeight: '800', color: '#059669' }}>
                ₹{activeOrder.total_amount?.toFixed(2)}
              </span>
            </div>

            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>
              <strong>Drop Address:</strong> {activeOrder.delivery_address}
            </div>

            {activeOrder.delivery_notes && (
              <div style={{ fontSize: '11px', color: '#b45309', backgroundColor: '#fffbeb', padding: '6px 8px', borderRadius: '6px' }}>
                <strong>Dock Instructions:</strong> {activeOrder.delivery_notes}
              </div>
            )}
          </div>
        </div>

        {/* Done / Close & Download Invoice Buttons */}
        <div style={{
          padding: '14px 18px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px'
        }}>
          <button
            onClick={() => {
              const printWindow = window.open('', '_blank');
              if (!printWindow) {
                alert('Please allow popups to view and download your invoice.');
                return;
              }
              const itemsHtml = (activeOrder.items || []).map((it) => `
                <tr>
                  <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0;">
                    <strong>${it.product_name_snapshot || it.name || 'Produce Item'}</strong>
                    <div style="font-size: 11px; color: #64748b;">${it.unit_size_snapshot || it.unit_size || ''}</div>
                  </td>
                  <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">${it.quantity}</td>
                  <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">₹${Number(it.unit_price).toFixed(2)}</td>
                  <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 700;">₹${Number(it.total_price).toFixed(2)}</td>
                </tr>
              `).join('');

              printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                  <head>
                    <title>Invoice - ${activeOrder.order_number}</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <style>
                      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #0f172a; max-width: 680px; margin: 0 auto; line-height: 1.5; }
                      .header { border-bottom: 3px solid #059669; padding-bottom: 14px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
                      .brand { font-size: 26px; font-weight: 900; color: #059669; letter-spacing: -0.5px; }
                      .doc-title { font-size: 13px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-top: 4px; }
                      .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; margin-bottom: 20px; font-size: 12px; }
                      table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px; }
                      th { background: #f1f5f9; padding: 10px 8px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; }
                      .totals { margin-top: 20px; float: right; width: 260px; font-size: 13px; }
                      .total-row { display: flex; justify-content: space-between; padding: 4px 0; }
                      .final-total { font-size: 16px; font-weight: 800; color: #059669; border-top: 2px solid #059669; margin-top: 8px; padding-top: 8px; }
                      .stamp { display: inline-block; padding: 4px 10px; background: #ecfdf5; border: 1px solid #a7f3d0; color: #047857; font-weight: 800; font-size: 11px; border-radius: 6px; margin-top: 20px; }
                      @media print { .no-print { display: none; } }
                    </style>
                  </head>
                  <body>
                    <div class="header">
                      <div>
                        <div class="brand">KisanDirect Fresh Produce</div>
                        <div class="doc-title">${isWholesale ? 'TAX INVOICE (HORECA COMMERCIAL)' : 'RETAIL CASH ON DELIVERY RECEIPT'}</div>
                      </div>
                      <div style="text-align: right; font-size: 12px; color: #64748b;">
                        <div><strong>Order:</strong> ${activeOrder.order_number}</div>
                        <div>${new Date(activeOrder.created_at || Date.now()).toLocaleDateString()}</div>
                      </div>
                    </div>

                    <div class="meta-grid">
                      <div>
                        <strong>Billed To / Delivery Address:</strong>
                        <div style="margin-top: 2px;">${activeOrder.delivery_address}</div>
                        ${activeOrder.delivery_notes ? `<div style="color: #b45309; margin-top: 4px;"><strong>Dock Notes:</strong> ${activeOrder.delivery_notes}</div>` : ''}
                      </div>
                      <div>
                        <strong>Payment Method:</strong> Cash on Delivery (COD)<br/>
                        <strong>Supply Hub:</strong> KisanDirect Central Hub, Pune<br/>
                        ${isWholesale ? '<strong>GST Rate:</strong> 5% CGST+SGST Inclusive' : ''}
                      </div>
                    </div>

                    <table>
                      <thead>
                        <tr>
                          <th>Item & Grade</th>
                          <th style="text-align: center;">Qty</th>
                          <th style="text-align: right;">Rate</th>
                          <th style="text-align: right;">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsHtml}
                      </tbody>
                    </table>

                    <div class="totals">
                      <div class="total-row">
                        <span>Subtotal:</span>
                        <span>₹${Number(activeOrder.subtotal).toFixed(2)}</span>
                      </div>
                      <div class="total-row">
                        <span>Delivery Fee:</span>
                        <span>${Number(activeOrder.delivery_fee) === 0 ? 'FREE' : '₹' + Number(activeOrder.delivery_fee).toFixed(2)}</span>
                      </div>
                      ${isWholesale ? `
                        <div class="total-row">
                          <span>GST (5% Tax):</span>
                          <span>₹${Number(activeOrder.tax_gst || 0).toFixed(2)}</span>
                        </div>
                      ` : ''}
                      <div class="total-row final-total">
                        <span>Total Due (COD):</span>
                        <span>₹${Number(activeOrder.total_amount).toFixed(2)}</span>
                      </div>
                    </div>

                    <div style="clear: both; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #64748b; text-align: center;">
                      Thank you for choosing KisanDirect Fresh Produce. For queries: support@kisandirect.com
                    </div>
                    <script>
                      window.onload = function() { window.print(); }
                    </script>
                  </body>
                </html>
              `);
              printWindow.document.close();
            }}
            className="btn-secondary"
            style={{ padding: '12px', fontSize: '12px', gap: '6px' }}
          >
            <Download size={14} />
            <span>Download Bill</span>
          </button>

          <button
            onClick={() => setIsTrackingOpen(false)}
            className="btn-primary"
            style={{ padding: '12px', fontSize: '12px' }}
          >
            Back to Catalog
          </button>
        </div>
      </div>
    </div>
  );
}
