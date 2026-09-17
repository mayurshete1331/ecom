'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Home, Store, Building2, ShoppingBag, User, Layers } from 'lucide-react';

export default function BottomNav({ onSelectCategory }) {
  const { totalCount, setIsCartOpen, setIsOrdersOpen, mode, switchMode } = useCart();
  const { user, openAuth } = useAuth();

  return (
    <nav style={{
      position: 'sticky',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#ffffff',
      borderTop: '1px solid #e2e8f0',
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      padding: '8px 0 10px',
      zIndex: 45,
      boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.04)'
    }}>
      {/* 1. Home */}
      <button
        onClick={() => {
          onSelectCategory('all');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        style={{
          background: 'transparent',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          color: '#059669',
          cursor: 'pointer'
        }}
      >
        <Home size={19} />
        <span style={{ fontSize: '10px', fontWeight: '700' }}>Home</span>
      </button>

      {/* 2. Mode Switcher (Retail vs Wholesale) */}
      <button
        onClick={() => switchMode(mode === 'RETAIL' ? 'WHOLESALE' : 'RETAIL')}
        style={{
          background: 'transparent',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          color: mode === 'WHOLESALE' ? '#b45309' : '#64748b',
          cursor: 'pointer'
        }}
      >
        {mode === 'WHOLESALE' ? <Building2 size={19} color="#f59e0b" /> : <Store size={19} />}
        <span style={{ fontSize: '10px', fontWeight: '700' }}>
          {mode === 'WHOLESALE' ? 'Hotels' : 'Bulk'}
        </span>
      </button>

      {/* 3. Floating Cart */}
      <button
        onClick={() => setIsCartOpen(true)}
        style={{
          background: 'transparent',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          color: '#64748b',
          position: 'relative',
          cursor: 'pointer'
        }}
      >
        <div style={{ position: 'relative' }}>
          <ShoppingBag size={20} color={totalCount > 0 ? '#059669' : '#64748b'} />
          {totalCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-8px',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              borderRadius: '999px',
              fontSize: '10px',
              fontWeight: '800',
              padding: '1px 5px',
              minWidth: '16px',
              textAlign: 'center',
              boxShadow: '0 2px 4px rgba(239, 68, 68, 0.4)'
            }}>
              {totalCount}
            </span>
          )}
        </div>
        <span style={{ fontSize: '10px', fontWeight: totalCount > 0 ? '800' : '600', color: totalCount > 0 ? '#059669' : '#64748b' }}>
          Cart
        </span>
      </button>

      {/* 4. Orders */}
      <button
        onClick={() => {
          if (user) {
            setIsOrdersOpen(true);
          } else {
            openAuth(mode === 'WHOLESALE' ? 'HOTEL_WHOLESALE' : 'RETAIL', 'login');
          }
        }}
        style={{
          background: 'transparent',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          color: '#64748b',
          cursor: 'pointer'
        }}
      >
        <Layers size={19} />
        <span style={{ fontSize: '10px', fontWeight: '600' }}>Orders</span>
      </button>

      {/* 5. Account */}
      <button
        onClick={() => openAuth(mode === 'WHOLESALE' ? 'HOTEL_WHOLESALE' : 'RETAIL', 'login')}
        style={{
          background: 'transparent',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          color: user ? '#059669' : '#64748b',
          cursor: 'pointer'
        }}
      >
        <User size={19} color={user ? '#059669' : '#64748b'} />
        <span style={{ fontSize: '10px', fontWeight: user ? '700' : '600' }}>
          {user ? (user.full_name?.split(' ')[0] || 'Profile') : 'Login'}
        </span>
      </button>
    </nav>
  );
}
