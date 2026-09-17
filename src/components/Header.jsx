'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { 
  Zap, 
  Truck, 
  MapPin, 
  User, 
  Store, 
  Building2, 
  ChevronDown, 
  LogOut,
  ShoppingBag,
  Shield
} from 'lucide-react';

export default function Header() {
  const { user, openAuth, logout } = useAuth();
  const { mode, switchMode, setIsOrdersOpen } = useCart();
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);

  const isWholesale = mode === 'WHOLESALE';

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    }}>
      {/* Top Banner / Delivery Speed Bar */}
      <div style={{
        backgroundColor: isWholesale ? '#0f172a' : '#059669',
        color: '#ffffff',
        padding: '6px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '11px',
        fontWeight: '700',
        transition: 'background-color 0.3s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isWholesale ? (
            <>
              <Truck size={14} color="#f59e0b" />
              <span>COMMERCIAL BULK • MORNING DOCK DELIVERY BY 7:30 AM</span>
            </>
          ) : (
            <>
              <Zap size={14} color="#fde047" fill="#fde047" />
              <span>INSTANT DELIVERY IN 15-20 MINS</span>
            </>
          )}
        </div>
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.2)',
          padding: '2px 8px',
          borderRadius: '999px',
          letterSpacing: '0.5px'
        }}>
          100% FARM FRESH
        </div>
      </div>

      {/* Main Header Row */}
      <div style={{
        padding: '12px 14px 8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        {/* Brand & Address */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              fontSize: '18px',
              fontWeight: '800',
              letterSpacing: '-0.5px',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span style={{ color: '#059669' }}>Kisan</span>Direct
            </span>
            <span style={{
              fontSize: '9px',
              fontWeight: '800',
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: isWholesale ? '#fef3c7' : '#d1fae5',
              color: isWholesale ? '#b45309' : '#047857',
              border: isWholesale ? '1px solid #fde68a' : '1px solid #a7f3d0'
            }}>
              {isWholesale ? 'HOTEL WHOLESALE' : 'RETAIL STORE'}
            </span>
          </div>

          {/* Delivery Location Selector */}
          <div 
            onClick={() => setShowAddressDropdown(!showAddressDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '2px',
              cursor: 'pointer'
            }}
          >
            <MapPin size={12} color="#059669" />
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#334155',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '180px'
            }}>
              {user ? (
                user.account_type === 'HOTEL_WHOLESALE' 
                  ? (user.hotelProfile?.hotel_name || 'Hotel Receiving Dock, Pune')
                  : (user.defaultAddress?.address_line?.split(',')[0] || 'Baner Road, Pune')
              ) : (
                'Baner, Pune - 411045'
              )}
            </span>
            <ChevronDown size={12} color="#64748b" />
          </div>
        </div>

        {/* User Account & Admin Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Link
            href="/admin"
            title="Store Operations & Inventory Admin"
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '9px',
              padding: '6px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              textDecoration: 'none',
              fontSize: '11px',
              fontWeight: '700',
              color: '#334155'
            }}
          >
            <Shield size={13} color="#059669" />
            <span>Admin</span>
          </Link>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => setIsOrdersOpen(true)}
                title="My Orders"
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '7px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#334155',
                  cursor: 'pointer'
                }}
              >
                <ShoppingBag size={14} color="#059669" />
                <span>Orders</span>
              </button>
              <button
                onClick={logout}
                title="Logout"
                style={{
                  background: '#fee2e2',
                  border: '1px solid #fecaca',
                  borderRadius: '10px',
                  padding: '7px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  color: '#dc2626'
                }}
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuth(isWholesale ? 'HOTEL_WHOLESALE' : 'RETAIL', 'login')}
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '7px 12px',
                fontSize: '12px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(5, 150, 105, 0.3)'
              }}
            >
              <User size={13} />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Dual Mode Switcher Bar */}
      <div style={{
        padding: '0 14px 10px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          backgroundColor: '#f1f5f9',
          padding: '3px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <button
            onClick={() => switchMode('RETAIL')}
            style={{
              padding: '7px 8px',
              borderRadius: '9px',
              border: 'none',
              fontSize: '12px',
              fontWeight: mode === 'RETAIL' ? '700' : '600',
              backgroundColor: mode === 'RETAIL' ? '#ffffff' : 'transparent',
              color: mode === 'RETAIL' ? '#047857' : '#64748b',
              boxShadow: mode === 'RETAIL' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <Store size={14} color={mode === 'RETAIL' ? '#059669' : '#64748b'} />
            <span>Retail (250g - 1kg)</span>
          </button>

          <button
            onClick={() => switchMode('WHOLESALE')}
            style={{
              padding: '7px 8px',
              borderRadius: '9px',
              border: 'none',
              fontSize: '12px',
              fontWeight: mode === 'WHOLESALE' ? '700' : '600',
              backgroundColor: mode === 'WHOLESALE' ? '#0f172a' : 'transparent',
              color: mode === 'WHOLESALE' ? '#fbbf24' : '#64748b',
              boxShadow: mode === 'WHOLESALE' ? '0 2px 6px rgba(15,23,42,0.2)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <Building2 size={14} color={mode === 'WHOLESALE' ? '#fbbf24' : '#64748b'} />
            <span>Hotel Bulk (5kg - 50kg)</span>
          </button>
        </div>
      </div>
    </header>
  );
}
