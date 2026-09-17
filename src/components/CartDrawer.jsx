'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  Banknote, 
  ShieldCheck, 
  Truck, 
  Zap, 
  MapPin, 
  FileText,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export default function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    deliveryFee,
    taxGst,
    totalAmount,
    totalSavings,
    mode,
    setActiveOrder,
    setIsTrackingOpen
  } = useCart();

  const { user, openAuth } = useAuth();

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Default address if user is logged in
  React.useEffect(() => {
    if (user?.defaultAddress?.address_line && !deliveryAddress) {
      setDeliveryAddress(user.defaultAddress.address_line);
    } else if (!deliveryAddress) {
      setDeliveryAddress(mode === 'WHOLESALE' ? 'Plot 45, Phase 1 Hinjewadi, Commercial Kitchen Dock B, Pune' : 'Flat 402, Green Meadows Apt, Baner, Pune');
    }
  }, [user, mode, deliveryAddress]);

  if (!isCartOpen) return null;

  const isWholesale = mode === 'WHOLESALE';
  const freeThreshold = isWholesale ? 2000 : 199;
  const neededForFreeDelivery = Math.max(0, freeThreshold - subtotal);

  const handleCheckout = async () => {
    setErrorMsg('');

    // If unauthenticated, gate checkout and open Auth modal
    if (!user) {
      openAuth(isWholesale ? 'HOTEL_WHOLESALE' : 'RETAIL', 'login');
      return;
    }

    if (cart.length === 0) return;

    if (!deliveryAddress.trim()) {
      setErrorMsg('Please specify a delivery address.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        items: cart.map((item) => ({
          tier_id: item.tier.id,
          quantity: item.quantity
        })),
        delivery_address: deliveryAddress.trim(),
        delivery_notes: deliveryNotes.trim() || null,
        account_type: mode
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to place order');
      }

      // Order successfully placed in MySQL!
      clearCart();
      setIsCartOpen(false);
      setActiveOrder(data.order);
      setIsTrackingOpen(true);
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong while placing order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="drawer-backdrop" onClick={() => setIsCartOpen(false)}>
      <div 
        className="bottom-sheet" 
        onClick={(e) => e.stopPropagation()}
        style={{ height: '88vh' }}
      >
        <div className="bottom-sheet-handle" />

        {/* Drawer Header */}
        <div style={{
          padding: '12px 18px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                Your Produce Basket
              </h3>
              <span style={{
                fontSize: '10px',
                fontWeight: '800',
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: isWholesale ? '#fef3c7' : '#d1fae5',
                color: isWholesale ? '#b45309' : '#047857'
              }}>
                {isWholesale ? 'HOTEL BULK' : 'RETAIL'}
              </span>
            </div>
            <p style={{ fontSize: '11px', color: '#64748b' }}>
              {isWholesale ? 'Direct farm crates for commercial kitchens' : '15-min farm delivery'}
            </p>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
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

        {/* Free Delivery Bar */}
        <div style={{
          backgroundColor: neededForFreeDelivery === 0 ? '#ecfdf5' : '#fffbeb',
          padding: '8px 18px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11px',
          fontWeight: '700',
          color: neededForFreeDelivery === 0 ? '#047857' : '#b45309'
        }}>
          {neededForFreeDelivery === 0 ? (
            <>
              <ShieldCheck size={14} color="#059669" />
              <span>Congratulations! You unlocked FREE Delivery on this order.</span>
            </>
          ) : (
            <>
              <Truck size={14} color="#f59e0b" />
              <span>Add ₹{neededForFreeDelivery} more to get FREE delivery!</span>
            </>
          )}
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px' }}>
          {cart.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 20px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
                color: '#94a3b8'
              }}>
                <Truck size={30} />
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                Your cart is empty
              </h4>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
                Add fresh sprouted Matki, crisp Broccoli, or Chhole to start your order.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="btn-primary"
                style={{ fontSize: '12px', padding: '8px 18px' }}
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Items List */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden'
              }}>
                {cart.map((item, idx) => (
                  <div
                    key={item.tier.id}
                    style={{
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      borderBottom: idx < cart.length - 1 ? '1px solid #f1f5f9' : 'none'
                    }}
                  >
                    {/* Thumbnail */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        backgroundColor: '#f1f5f9'
                      }}
                    />

                    {/* Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h5 style={{
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#0f172a',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {item.product.name}
                      </h5>
                      <span style={{
                        display: 'inline-block',
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#64748b',
                        backgroundColor: '#f1f5f9',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        marginTop: '2px'
                      }}>
                        {item.tier.unit_size}
                      </span>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', marginTop: '3px' }}>
                        ₹{item.tier.price * item.quantity}
                        <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '500', marginLeft: '4px' }}>
                          (₹{item.tier.price} ea)
                        </span>
                      </div>
                    </div>

                    {/* Stepper */}
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      backgroundColor: isWholesale ? '#0f172a' : '#059669',
                      borderRadius: '8px',
                      padding: '2px',
                      color: '#ffffff'
                    }}>
                      <button
                        onClick={() => updateQuantity(item.tier.id, -1)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#ffffff',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <Minus size={11} strokeWidth={3} />
                      </button>
                      <span style={{ fontSize: '11px', fontWeight: '800', minWidth: '18px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.tier.id, 1)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#ffffff',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <Plus size={11} strokeWidth={3} />
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeFromCart(item.tier.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Delivery Address & Notes */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <MapPin size={14} color="#059669" />
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>
                    Delivery Location
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="Enter detailed delivery address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: '12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    outline: 'none',
                    marginBottom: '8px'
                  }}
                />

                <input
                  type="text"
                  placeholder={isWholesale ? "Kitchen receiving dock notes (e.g. rear gate)" : "Delivery notes (e.g. ring bell)"}
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: '11px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Bill Details */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '14px'
              }}>
                <h5 style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>
                  Transparent Bill Summary
                </h5>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                    <span>Item Subtotal</span>
                    <span style={{ fontWeight: '600', color: '#0f172a' }}>₹{subtotal.toFixed(2)}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                    <span>Delivery Fee</span>
                    <span style={{ fontWeight: '600', color: deliveryFee === 0 ? '#059669' : '#0f172a' }}>
                      {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
                    </span>
                  </div>

                  {isWholesale && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                      <span>GST (5% Commercial Invoice)</span>
                      <span style={{ fontWeight: '600', color: '#0f172a' }}>₹{taxGst.toFixed(2)}</span>
                    </div>
                  )}

                  {totalSavings > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: '700' }}>
                      <span>Total Savings</span>
                      <span>-₹{totalSavings.toFixed(2)}</span>
                    </div>
                  )}

                  <div style={{
                    borderTop: '1px dashed #cbd5e1',
                    paddingTop: '8px',
                    marginTop: '4px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '14px',
                    fontWeight: '800',
                    color: '#0f172a'
                  }}>
                    <span>To Pay</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Cash On Delivery Assurance Box */}
              <div style={{
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '10px',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#d1fae5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#047857'
                }}>
                  <Banknote size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#047857' }}>
                    Payment Mode: Cash on Delivery (COD)
                  </div>
                  <div style={{ fontSize: '10px', color: '#065f46' }}>
                    Pay cash or via UPI QR scanner when the driver arrives.
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div style={{
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '11px',
                  color: '#dc2626',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <AlertCircle size={14} />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Checkout Footer Button */}
        {cart.length > 0 && (
          <div style={{
            padding: '14px 18px',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            boxShadow: '0 -4px 12px rgba(0,0,0,0.05)'
          }}>
            {!user ? (
              <button
                onClick={() => openAuth(isWholesale ? 'HOTEL_WHOLESALE' : 'RETAIL', 'login')}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '13px',
                  fontSize: '14px',
                  background: isWholesale ? '#0f172a' : '#059669'
                }}
              >
                <span>Login Account to Place COD Order</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleCheckout}
                disabled={submitting}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '13px',
                  fontSize: '14px',
                  background: isWholesale 
                    ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' 
                    : 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                }}
              >
                <span>
                  {submitting ? 'Placing Order...' : `Place COD Order • ₹${totalAmount.toFixed(2)}`}
                </span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
