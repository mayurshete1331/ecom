'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { 
  X, 
  ShoppingBag, 
  Clock, 
  ChevronRight, 
  Truck, 
  CheckCircle2, 
  Package, 
  FileText 
} from 'lucide-react';

export default function OrdersModal() {
  const { isOrdersOpen, setIsOrdersOpen, setActiveOrder, setIsTrackingOpen } = useCart();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOrdersOpen || !user) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/orders');
        const data = await res.json();
        if (data.success && data.orders) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isOrdersOpen, user]);

  if (!isOrdersOpen) return null;

  const handleTrack = (order) => {
    setActiveOrder(order);
    setIsOrdersOpen(false);
    setIsTrackingOpen(true);
  };

  return (
    <div className="drawer-backdrop" onClick={() => setIsOrdersOpen(false)}>
      <div 
        className="bottom-sheet" 
        onClick={(e) => e.stopPropagation()}
        style={{ height: '88vh' }}
      >
        <div className="bottom-sheet-handle" />

        {/* Header */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={18} color="#059669" />
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
              Your Orders & Invoices
            </h3>
          </div>

          <button
            onClick={() => setIsOrdersOpen(false)}
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

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b', fontSize: '13px' }}>
              Loading your orders from MySQL...
            </div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                color: '#94a3b8'
              }}>
                <Package size={26} />
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                No orders placed yet
              </h4>
              <p style={{ fontSize: '12px', color: '#64748b' }}>
                Your completed and active Cash on Delivery orders will appear here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '14px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
                        {ord.order_number}
                      </span>
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                        {new Date(ord.created_at).toLocaleString()}
                      </div>
                    </div>

                    <span style={{
                      fontSize: '10px',
                      fontWeight: '800',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      backgroundColor: '#ecfdf5',
                      color: '#047857'
                    }}>
                      {ord.status}
                    </span>
                  </div>

                  {/* Items snapshot */}
                  <div style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    marginBottom: '10px',
                    fontSize: '11px',
                    color: '#475569'
                  }}>
                    {ord.items?.map((it, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span>
                          {it.product_name_snapshot} ({it.unit_size_snapshot}) x {it.quantity}
                        </span>
                        <span style={{ fontWeight: '600' }}>₹{it.total_price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer with total & track button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Total (Cash on Delivery): </span>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: '#059669' }}>
                        ₹{ord.total_amount.toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleTrack(ord)}
                      style={{
                        backgroundColor: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '11px',
                        fontWeight: '700',
                        color: '#0f172a',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <span>Track Order</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
