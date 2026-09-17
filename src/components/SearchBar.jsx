'use client';

import React from 'react';
import { Search, X, Sparkles } from 'lucide-react';

export default function SearchBar({ searchQuery, setSearchQuery, onSearchTagClick }) {
  const quickPills = ['Matki', 'Broccoli', 'Chhole', 'Paneer', 'Mushrooms', 'Onions'];

  return (
    <div style={{ padding: '4px 14px 10px', backgroundColor: '#ffffff' }}>
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        border: '1.5px solid #e2e8f0',
        padding: '0 12px',
        height: '42px',
        transition: 'all 0.2s ease'
      }}>
        <Search size={17} color="#059669" style={{ flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search Matki, Broccoli, Chhole, Pulses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            background: 'transparent',
            outline: 'none',
            padding: '0 8px',
            fontSize: '13px',
            color: '#0f172a',
            fontWeight: '500'
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{
              background: '#e2e8f0',
              border: 'none',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#475569'
            }}
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Quick Search Chips */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        overflowX: 'auto',
        marginTop: '8px',
        paddingBottom: '2px',
        scrollbarWidth: 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#94a3b8', flexShrink: 0 }}>
          <Sparkles size={11} color="#f59e0b" />
          <span>Quick:</span>
        </div>
        {quickPills.map((tag) => (
          <button
            key={tag}
            onClick={() => onSearchTagClick(tag)}
            style={{
              flexShrink: 0,
              padding: '3px 9px',
              borderRadius: '999px',
              backgroundColor: '#f1f5f9',
              border: '1px solid #e2e8f0',
              color: '#475569',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
