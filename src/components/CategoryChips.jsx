'use client';

import React from 'react';
import { Sprout, Salad, Milk, Package, Layers } from 'lucide-react';

export default function CategoryChips({ categories, activeCategory, onSelectCategory }) {
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'Sprout':
        return <Sprout size={14} />;
      case 'Salad':
        return <Salad size={14} />;
      case 'Milk':
        return <Milk size={14} />;
      case 'Package':
        return <Package size={14} />;
      default:
        return <Layers size={14} />;
    }
  };

  return (
    <div style={{ padding: '0 14px 12px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '4px',
        scrollbarWidth: 'none'
      }}>
        {/* All Products Tab */}
        <button
          onClick={() => onSelectCategory('all')}
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '999px',
            border: activeCategory === 'all' ? '1.5px solid #059669' : '1px solid #e2e8f0',
            backgroundColor: activeCategory === 'all' ? '#ecfdf5' : '#ffffff',
            color: activeCategory === 'all' ? '#047857' : '#475569',
            fontSize: '12px',
            fontWeight: activeCategory === 'all' ? '700' : '600',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: activeCategory === 'all' ? '0 2px 6px rgba(5, 150, 105, 0.15)' : 'none'
          }}
        >
          <Layers size={14} color={activeCategory === 'all' ? '#059669' : '#64748b'} />
          <span>All Items</span>
        </button>

        {/* Database Fetched Categories */}
        {categories.map((cat) => {
          const isActive = activeCategory === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '999px',
                border: isActive ? '1.5px solid #059669' : '1px solid #e2e8f0',
                backgroundColor: isActive ? '#ecfdf5' : '#ffffff',
                color: isActive ? '#047857' : '#475569',
                fontSize: '12px',
                fontWeight: isActive ? '700' : '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 2px 6px rgba(5, 150, 105, 0.15)' : 'none'
              }}
            >
              <span style={{ color: isActive ? '#059669' : '#64748b' }}>
                {getIcon(cat.icon_name)}
              </span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
