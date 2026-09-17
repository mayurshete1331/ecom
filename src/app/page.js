'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import BannerSlider from '@/components/BannerSlider';
import CategoryChips from '@/components/CategoryChips';
import ProductCard from '@/components/ProductCard';
import StickyCartBar from '@/components/StickyCartBar';
import BottomNav from '@/components/BottomNav';
import CartDrawer from '@/components/CartDrawer';
import AuthModal from '@/components/AuthModal';
import OrderTrackingModal from '@/components/OrderTrackingModal';
import OrdersModal from '@/components/OrdersModal';
import InstallPrompt from '@/components/InstallPrompt';
import { useCart } from '@/context/CartContext';
import { Sparkles, RefreshCw, AlertTriangle, Truck, Store } from 'lucide-react';

export default function HomePage() {
  const { mode } = useCart();
  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeStore, setActiveStore] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories and stores from MySQL
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [catRes, storeRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/stores')
        ]);
        const catData = await catRes.json();
        const storeData = await storeRes.json();

        if (catData.success && catData.categories) {
          setCategories(catData.categories);
        }
        if (storeData.success && storeData.stores) {
          setStores(storeData.stores);
        }
      } catch (err) {
        console.error('Failed to load initial metadata:', err);
      }
    }
    loadInitialData();
  }, []);

  // Fetch products from MySQL dynamically based on mode, category, store, search
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.append('mode', mode.toLowerCase());
      if (activeStore && activeStore !== 'all') {
        params.append('store', activeStore);
      }
      if (activeCategory && activeCategory !== 'all') {
        params.append('category', activeCategory);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.products) {
        setProducts(data.products);
      } else {
        setError(data.error || 'Unable to load products. Please refresh.');
      }
    } catch (err) {
      console.error('Products load error:', err);
      setError('Connection issue. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  }, [mode, activeStore, activeCategory, searchQuery]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearchTagClick = (tag) => {
    setSearchQuery(tag);
  };

  const isWholesale = mode === 'WHOLESALE';

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 0. Mobile PWA Download & Install Banner */}
      <InstallPrompt />

      {/* 1. Header with Mode Toggle & Location */}
      <Header />

      {/* 2. Instant Search Bar */}
      <SearchBar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchTagClick={handleSearchTagClick}
      />

      {/* 3. Promotional Carousel */}
      <BannerSlider />

      {/* 3.5 Farm Hub / Store Filter Pills */}
      {stores.length > 0 && (
        <div style={{
          padding: '0 14px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          scrollbarWidth: 'none'
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: '800',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            flexShrink: 0
          }}>
            <Store size={13} color="#059669" />
            <span>FARM HUB:</span>
          </div>

          <button
            onClick={() => setActiveStore('all')}
            style={{
              flexShrink: 0,
              padding: '5px 12px',
              borderRadius: '20px',
              border: '1px solid',
              borderColor: activeStore === 'all' ? '#059669' : '#e2e8f0',
              backgroundColor: activeStore === 'all' ? '#ecfdf5' : '#ffffff',
              color: activeStore === 'all' ? '#047857' : '#475569',
              fontSize: '11px',
              fontWeight: activeStore === 'all' ? '800' : '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: activeStore === 'all' ? '0 2px 5px rgba(5, 150, 105, 0.15)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <span>All Farm Hubs</span>
            <span style={{
              backgroundColor: activeStore === 'all' ? '#059669' : '#f1f5f9',
              color: activeStore === 'all' ? '#ffffff' : '#64748b',
              fontSize: '9px',
              padding: '1px 5px',
              borderRadius: '999px',
              fontWeight: '700'
            }}>
              {stores.reduce((acc, s) => acc + (s.products_count || 0), 0)}
            </span>
          </button>

          {stores.map((s) => {
            const isSelected = activeStore === s.slug;
            return (
              <button
                key={s.id}
                onClick={() => setActiveStore(s.slug)}
                style={{
                  flexShrink: 0,
                  padding: '5px 12px',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: isSelected ? '#059669' : '#e2e8f0',
                  backgroundColor: isSelected ? '#ecfdf5' : '#ffffff',
                  color: isSelected ? '#047857' : '#475569',
                  fontSize: '11px',
                  fontWeight: isSelected ? '800' : '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: isSelected ? '0 2px 5px rgba(5, 150, 105, 0.15)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>🚜 {s.store_name}</span>
                <span style={{
                  backgroundColor: isSelected ? '#059669' : '#f1f5f9',
                  color: isSelected ? '#ffffff' : '#64748b',
                  fontSize: '9px',
                  padding: '1px 5px',
                  borderRadius: '999px',
                  fontWeight: '700'
                }}>
                  {s.products_count || 0}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* 4. Category Filter Chips (from MySQL) */}
      <CategoryChips
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />

      {/* 5. Main Catalog Section */}
      <section style={{ padding: '0 14px 20px', flex: 1 }}>
        {/* Section Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <div>
            <h2 style={{
              fontSize: '16px',
              fontWeight: '800',
              color: '#0f172a',
              letterSpacing: '-0.3px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>{isWholesale ? '🏨 Commercial Bulk Crates' : '🌱 Fresh Produce Harvest'}</span>
            </h2>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              {isWholesale 
                ? 'Graded in 5kg-50kg bulk packs with GST tax invoicing' 
                : 'Cleaned, pre-portioned & delivered in 15-20 mins'}
            </span>
          </div>

          <span style={{
            fontSize: '11px',
            fontWeight: '700',
            color: isWholesale ? '#b45309' : '#047857',
            backgroundColor: isWholesale ? '#fef3c7' : '#ecfdf5',
            padding: '3px 8px',
            borderRadius: '999px',
            border: isWholesale ? '1px solid #fde68a' : '1px solid #a7f3d0'
          }}>
            {products.length} Items Available
          </span>
        </div>

        {/* Loading State */}
        {loading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            padding: '10px 0'
          }}>
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  height: '240px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  fontSize: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Loading fresh produce...</span>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            color: '#dc2626'
          }}>
            <AlertTriangle size={24} style={{ margin: '0 auto 8px' }} />
            <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>
              Unable to Load Produce
            </h4>
            <p style={{ fontSize: '12px', marginBottom: '12px' }}>{error}</p>
            <button
              onClick={loadProducts}
              className="btn-secondary"
              style={{ fontSize: '12px', padding: '6px 14px' }}
            >
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '40px 20px',
            textAlign: 'center',
            color: '#64748b'
          }}>
            <Truck size={36} style={{ margin: '0 auto 8px', color: '#94a3b8' }} />
            <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
              No produce matching your search
            </h4>
            <p style={{ fontSize: '12px', marginBottom: '16px' }}>
              Try searching for &quot;Matki&quot;, &quot;Broccoli&quot;, &quot;Chhole&quot;, or select &quot;All Items&quot;.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
              className="btn-primary"
              style={{ fontSize: '12px', padding: '8px 18px' }}
            >
              Show All Products
            </button>
          </div>
        ) : (
          /* Product Grid: 2 columns on mobile for optimal thumb reach */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px'
          }}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Floating Sticky Cart Summary Bar */}
      <StickyCartBar />

      {/* Mobile Sticky Bottom Nav */}
      <BottomNav onSelectCategory={setActiveCategory} />

      {/* Slide-up Sheets & Modals */}
      <CartDrawer />
      <AuthModal />
      <OrderTrackingModal />
      <OrdersModal />
    </main>
  );
}
