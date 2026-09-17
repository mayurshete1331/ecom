'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Plus, Minus, Check, Sparkles } from 'lucide-react';

export default function ProductCard({ product }) {
  const { addToCart, updateQuantity, getItemQuantity, mode } = useCart();
  const [selectedTierIndex, setSelectedTierIndex] = useState(0);

  const isWholesale = mode === 'WHOLESALE';
  const tiers = product.tiers || [];
  const currentTier = tiers[selectedTierIndex] || product.default_tier;

  if (!currentTier) return null;

  const currentQty = getItemQuantity(currentTier.id);

  const handleAdd = () => {
    addToCart(product, currentTier);
  };

  const handleIncrement = () => {
    updateQuantity(currentTier.id, 1);
  };

  const handleDecrement = () => {
    updateQuantity(currentTier.id, -1);
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
      position: 'relative',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    }}>
      {/* Product Image Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '145px',
        backgroundColor: '#f1f5f9',
        overflow: 'hidden'
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image_url}
          alt={product.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease'
          }}
          loading="lazy"
        />

        {/* Badge */}
        {product.badge && (
          <div style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(4px)',
            color: '#ffffff',
            fontSize: '10px',
            fontWeight: '700',
            padding: '2px 8px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '3px'
          }}>
            <span>{product.badge}</span>
          </div>
        )}

        {/* Wholesale Crate Indicator */}
        {isWholesale && (
          <div style={{
            position: 'absolute',
            bottom: '6px',
            right: '8px',
            backgroundColor: '#fef3c7',
            border: '1px solid #fde68a',
            color: '#b45309',
            fontSize: '9px',
            fontWeight: '800',
            padding: '2px 6px',
            borderRadius: '4px'
          }}>
            COMMERCIAL CRATE
          </div>
        )}
      </div>

      {/* Content Body */}
      <div style={{
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        flex: 1
      }}>
        {/* Store / Supplier Attribution Badge */}
        {(product.store_name || product.store?.name) && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '9px',
            fontWeight: '700',
            color: '#047857',
            backgroundColor: '#ecfdf5',
            padding: '2px 6px',
            borderRadius: '4px',
            marginBottom: '4px',
            alignSelf: 'flex-start',
            border: '1px solid #d1fae5'
          }}>
            <span>🚜 {product.store_name || product.store?.name}</span>
          </div>
        )}

        <h4 style={{
          fontSize: '13px',
          fontWeight: '700',
          color: '#0f172a',
          marginBottom: '3px',
          lineHeight: 1.3
        }}>
          {product.name}
        </h4>

        <p style={{
          fontSize: '11px',
          color: '#64748b',
          marginBottom: '8px',
          lineHeight: 1.35,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '28px'
        }}>
          {product.description}
        </p>

        {/* Pack Size / Weight Selector Pills */}
        <div style={{
          display: 'flex',
          gap: '4px',
          overflowX: 'auto',
          marginBottom: '10px',
          scrollbarWidth: 'none'
        }}>
          {tiers.map((t, idx) => {
            const isSelected = idx === selectedTierIndex;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTierIndex(idx)}
                style={{
                  flexShrink: 0,
                  fontSize: '10px',
                  fontWeight: isSelected ? '700' : '600',
                  padding: '3px 7px',
                  borderRadius: '6px',
                  border: isSelected 
                    ? (isWholesale ? '1.5px solid #0f172a' : '1.5px solid #059669')
                    : '1px solid #e2e8f0',
                  backgroundColor: isSelected
                    ? (isWholesale ? '#0f172a' : '#ecfdf5')
                    : '#f8fafc',
                  color: isSelected
                    ? (isWholesale ? '#fbbf24' : '#047857')
                    : '#64748b',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {t.unit_size}
              </button>
            );
          })}
        </div>

        {/* Price & Add Stepper Row */}
        <div style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px'
        }}>
          {/* Price details */}
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{
                fontSize: '15px',
                fontWeight: '800',
                color: '#0f172a'
              }}>
                ₹{currentTier.price}
              </span>
              {currentTier.mrp > currentTier.price && (
                <span style={{
                  fontSize: '11px',
                  color: '#94a3b8',
                  textDecoration: 'line-through'
                }}>
                  ₹{currentTier.mrp}
                </span>
              )}
            </div>

            {currentTier.discount_percent > 0 && (
              <span style={{
                fontSize: '10px',
                fontWeight: '700',
                color: '#059669'
              }}>
                {currentTier.discount_percent}% OFF
              </span>
            )}
          </div>

          {/* Morphing Stepper / ADD Button */}
          {currentQty === 0 ? (
            <button
              onClick={handleAdd}
              style={{
                backgroundColor: '#ffffff',
                border: isWholesale ? '1.5px solid #0f172a' : '1.5px solid #059669',
                color: isWholesale ? '#0f172a' : '#059669',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.15s ease',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)'
              }}
            >
              <Plus size={13} strokeWidth={3} />
              <span>ADD</span>
            </button>
          ) : (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: isWholesale ? '#0f172a' : '#059669',
              borderRadius: '8px',
              padding: '2px',
              color: '#ffffff'
            }}>
              <button
                onClick={handleDecrement}
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
                <Minus size={12} strokeWidth={3} />
              </button>
              <span style={{
                fontSize: '12px',
                fontWeight: '800',
                minWidth: '20px',
                textAlign: 'center'
              }}>
                {currentQty}
              </span>
              <button
                onClick={handleIncrement}
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
                <Plus size={12} strokeWidth={3} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
