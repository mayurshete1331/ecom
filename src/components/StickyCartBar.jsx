'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function StickyCartBar() {
  const { totalCount, subtotal, setIsCartOpen, isCartOpen, mode } = useCart();

  if (totalCount === 0 || isCartOpen) return null;

  const isWholesale = mode === 'WHOLESALE';

  return (
    <div className="sticky-bottom-cart-bar">
      <div 
        className="cart-bar-inner"
        onClick={() => setIsCartOpen(true)}
        style={{
          background: isWholesale 
            ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' 
            : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          boxShadow: isWholesale
            ? '0 10px 25px -4px rgba(15, 23, 42, 0.4)'
            : '0 10px 25px -4px rgba(5, 150, 105, 0.4)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShoppingBag size={18} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '800' }}>
              {totalCount} {totalCount === 1 ? 'Item' : 'Items'} • ₹{subtotal.toFixed(2)}
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.8)' }}>
              {isWholesale ? 'Hotel Commercial Rates Applied' : 'Instant 15-min delivery'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '800' }}>
          <span>View Cart</span>
          <ArrowRight size={16} />
        </div>
      </div>
    </div>
  );
}
