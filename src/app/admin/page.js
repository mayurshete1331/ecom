'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  PlusCircle, 
  Truck, 
  Users, 
  ArrowLeft, 
  Check, 
  AlertCircle, 
  TrendingUp, 
  Banknote, 
  Store, 
  Building2, 
  Search, 
  RefreshCw, 
  Edit2, 
  FileText, 
  Clock,
  LogOut,
  ShieldCheck
} from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState(null);
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'orders' | 'customers' | 'add_product'
  const [inventory, setInventory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');

  // Add Product Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState('');
  const [newProdBadge, setNewProdBadge] = useState('🥦 Fresh Harvest');
  const [newProdRetailSize, setNewProdRetailSize] = useState('250g');
  const [newProdRetailPrice, setNewProdRetailPrice] = useState('40');
  const [newProdRetailMrp, setNewProdRetailMrp] = useState('55');
  const [newProdRetailStock, setNewProdRetailStock] = useState('200');
  const [newProdWholesaleSize, setNewProdWholesaleSize] = useState('5kg Crate');
  const [newProdWholesalePrice, setNewProdWholesalePrice] = useState('500');
  const [newProdWholesaleMrp, setNewProdWholesaleMrp] = useState('700');
  const [newProdWholesaleStock, setNewProdWholesaleStock] = useState('50');

  // Load inventory & categories
  const loadData = async () => {
    try {
      setLoading(true);

      // Verify active ADMIN session
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (!meData.success || meData.user?.account_type !== 'ADMIN') {
        router.push('/admin/login');
        return;
      }
      setAdminUser(meData.user);

      const [invRes, catRes, ordRes, custRes] = await Promise.all([
        fetch('/api/admin/inventory'),
        fetch('/api/categories'),
        fetch('/api/admin/orders'),
        fetch('/api/admin/customers')
      ]);

      const invData = await invRes.json();
      const catData = await catRes.json();
      const ordData = await ordRes.json();
      const custData = await custRes.json();

      if (invData.success) setInventory(invData.products || []);
      if (catData.success) {
        setCategories(catData.categories || []);
        if (catData.categories.length > 0 && !newProdCategory) {
          setNewProdCategory(catData.categories[0].id);
        }
      }
      if (ordData.success) setOrders(ordData.orders || []);
      if (custData.success) setCustomers(custData.customers || []);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load operations data');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (e) {
      router.push('/admin/login');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Quick stock update
  const handleStockDelta = async (tierId, delta) => {
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier_id: tierId, stock_delta: delta })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Stock updated (+${delta} units)`);
        setTimeout(() => setSuccessMsg(''), 2500);
        // Update local state
        setInventory((prev) =>
          prev.map((p) => ({
            ...p,
            tiers: p.tiers.map((t) =>
              t.tier_id === tierId
                ? { ...t, stock_quantity: Math.max(0, t.stock_quantity + delta) }
                : t
            )
          }))
        );
      }
    } catch (e) {
      setErrorMsg('Failed to update stock');
    }
  };

  // Update order status
  const handleOrderStatus = async (orderId, newStatus, newPaymentStatus) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          status: newStatus,
          payment_status: newPaymentStatus
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Order updated to ${newStatus}`);
        setTimeout(() => setSuccessMsg(''), 2500);
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: newStatus || o.status,
                  payment_status: newPaymentStatus || o.payment_status
                }
              : o
          )
        );
      }
    } catch (e) {
      setErrorMsg('Failed to update order');
    }
  };

  // Submit new product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        name: newProdName,
        category_id: parseInt(newProdCategory, 10),
        description: newProdDesc,
        image_url: newProdImage,
        badge: newProdBadge,
        is_featured: true,
        tiers: [
          {
            tier_type: 'RETAIL',
            unit_size: newProdRetailSize,
            price: parseFloat(newProdRetailPrice),
            mrp: parseFloat(newProdRetailMrp),
            stock_quantity: parseInt(newProdRetailStock, 10),
            min_order_qty: 1
          },
          {
            tier_type: 'WHOLESALE',
            unit_size: newProdWholesaleSize,
            price: parseFloat(newProdWholesalePrice),
            mrp: parseFloat(newProdWholesaleMrp),
            stock_quantity: parseInt(newProdWholesaleStock, 10),
            min_order_qty: 1
          }
        ]
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Product "${newProdName}" added to live database!`);
        // Reset form
        setNewProdName('');
        setNewProdDesc('');
        setNewProdImage('');
        await loadData();
        setActiveTab('inventory');
      } else {
        setErrorMsg(data.message || 'Failed to add product');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error creating product');
    } finally {
      setLoading(false);
    }
  };

  // Compute operational stats
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const pendingOrders = orders.filter((o) => o.status !== 'DELIVERED').length;
  const lowStockCount = inventory.reduce(
    (sum, p) => sum + p.tiers.filter((t) => t.stock_quantity < 25).length,
    0
  );

  const filteredInventory = inventory.filter((p) =>
    p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    p.category_name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredCustomers = customers.filter((c) =>
    (c.full_name || '').toLowerCase().includes(customerSearch.toLowerCase()) ||
    (c.phone || '').includes(customerSearch) ||
    (c.hotel_name || '').toLowerCase().includes(customerSearch.toLowerCase())
  );

  const hotelBuyerCount = customers.filter((c) => c.account_type === 'HOTEL_WHOLESALE').length;
  const retailBuyerCount = customers.filter((c) => c.account_type !== 'HOTEL_WHOLESALE').length;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      color: '#0f172a',
      paddingBottom: '40px'
    }}>
      {/* Top Navbar */}
      <header style={{
        backgroundColor: '#0f172a',
        color: '#ffffff',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            href="/"
            style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: '#ffffff',
              borderRadius: '8px',
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: '700'
            }}
          >
            <ArrowLeft size={14} />
            <span>Storefront</span>
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '17px', fontWeight: '800', letterSpacing: '-0.3px', margin: 0 }}>
                {adminUser?.store_name || 'Store Operations Hub'}
              </h1>
              {adminUser?.store_slug && (
                <span style={{
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '2px 6px',
                  borderRadius: '6px'
                }}>
                  Store #{adminUser.store_id}
                </span>
              )}
            </div>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
              Independent Farm Hub • Inventory, Dispatch & Pricing Scoped
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {adminUser && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              padding: '5px 10px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: '700',
              color: '#34d399'
            }}>
              <ShieldCheck size={13} />
              <span>{adminUser.full_name}</span>
            </div>
          )}

          <button
            onClick={loadData}
            style={{
              backgroundColor: '#059669',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '7px 12px',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <RefreshCw size={13} />
            <span>Sync</span>
          </button>

          <button
            onClick={handleAdminLogout}
            title="Logout Admin"
            style={{
              backgroundColor: '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '7px 10px',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <LogOut size={13} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Stats Summary Bar */}
      <div style={{
        padding: '14px 20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '12px 14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>Total Revenue (COD)</div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#059669', marginTop: '2px' }}>
            ₹{totalRevenue.toFixed(2)}
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '12px 14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>Pending Orders</div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#d97706', marginTop: '2px' }}>
            {pendingOrders} To Dispatch
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '12px 14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>Live Products</div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
            {inventory.length} In Catalog
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '12px 14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>Low Stock Alert</div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: lowStockCount > 0 ? '#dc2626' : '#059669', marginTop: '2px' }}>
            {lowStockCount} Tiers
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div style={{
          margin: '0 20px 14px',
          padding: '10px 16px',
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: '10px',
          color: '#047857',
          fontSize: '12px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Check size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{
          margin: '0 20px 14px',
          padding: '10px 16px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '10px',
          color: '#dc2626',
          fontSize: '12px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Admin Tabs */}
      <div style={{ padding: '0 20px 16px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          backgroundColor: '#e2e8f0',
          borderRadius: '12px',
          padding: '3px',
          maxWidth: '620px'
        }}>
          <button
            onClick={() => setActiveTab('inventory')}
            style={{
              padding: '9px 10px',
              borderRadius: '9px',
              border: 'none',
              fontSize: '12px',
              fontWeight: activeTab === 'inventory' ? '800' : '600',
              backgroundColor: activeTab === 'inventory' ? '#ffffff' : 'transparent',
              color: activeTab === 'inventory' ? '#0f172a' : '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Package size={14} />
            <span>Inventory</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            style={{
              padding: '9px 10px',
              borderRadius: '9px',
              border: 'none',
              fontSize: '12px',
              fontWeight: activeTab === 'orders' ? '800' : '600',
              backgroundColor: activeTab === 'orders' ? '#ffffff' : 'transparent',
              color: activeTab === 'orders' ? '#0f172a' : '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Truck size={14} />
            <span>Orders ({pendingOrders})</span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            style={{
              padding: '9px 10px',
              borderRadius: '9px',
              border: 'none',
              fontSize: '12px',
              fontWeight: activeTab === 'customers' ? '800' : '600',
              backgroundColor: activeTab === 'customers' ? '#ffffff' : 'transparent',
              color: activeTab === 'customers' ? '#0f172a' : '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Users size={14} />
            <span>Buyers ({customers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('add_product')}
            style={{
              padding: '9px 10px',
              borderRadius: '9px',
              border: 'none',
              fontSize: '12px',
              fontWeight: activeTab === 'add_product' ? '800' : '600',
              backgroundColor: activeTab === 'add_product' ? '#ffffff' : 'transparent',
              color: activeTab === 'add_product' ? '#0f172a' : '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <PlusCircle size={14} />
            <span>+ Add Produce</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ padding: '0 20px' }}>
        {/* =========================================================================
            TAB 1: INVENTORY & STOCK MANAGEMENT
            ========================================================================= */}
        {activeTab === 'inventory' && (
          <div>
            {/* Search filter */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
              maxWidth: '400px'
            }}>
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="Filter produce items..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  fontSize: '13px'
                }}
              />
            </div>

            {/* Products Inventory List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredInventory.map((prod) => (
                <div
                  key={prod.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    padding: '16px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={prod.image_url}
                      alt={prod.name}
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '10px',
                        objectFit: 'cover'
                      }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                          {prod.name}
                        </h3>
                        {prod.badge && (
                          <span style={{
                            fontSize: '10px',
                            fontWeight: '700',
                            backgroundColor: '#f1f5f9',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            {prod.badge}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        Category: {prod.category_name}
                      </div>
                    </div>
                  </div>

                  {/* Tiers / Pack sizes stock management */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '10px'
                  }}>
                    {prod.tiers.map((t) => {
                      const isWholesale = t.tier_type === 'WHOLESALE';
                      return (
                        <div
                          key={t.tier_id}
                          style={{
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            padding: '10px 12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{
                                fontSize: '10px',
                                fontWeight: '800',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: isWholesale ? '#fef3c7' : '#d1fae5',
                                color: isWholesale ? '#b45309' : '#047857'
                              }}>
                                {isWholesale ? 'WHOLESALE' : 'RETAIL'}
                              </span>
                              <strong style={{ fontSize: '12px' }}>{t.unit_size}</strong>
                            </div>

                            <div style={{ fontSize: '12px', fontWeight: '700' }}>
                              ₹{t.price} <span style={{ fontSize: '10px', color: '#94a3b8', textDecoration: 'line-through' }}>₹{t.mrp}</span>
                            </div>
                          </div>

                          {/* Current Stock & Quick Adjusters */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '6px 10px'
                          }}>
                            <div>
                              <span style={{ fontSize: '11px', color: '#64748b' }}>Available Stock: </span>
                              <strong style={{
                                fontSize: '13px',
                                color: t.stock_quantity < 20 ? '#dc2626' : '#059669'
                              }}>
                                {t.stock_quantity} {isWholesale ? 'Crates' : 'Packs'}
                              </strong>
                            </div>

                            {/* Quick Add Buttons */}
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                onClick={() => handleStockDelta(t.tier_id, 10)}
                                style={{
                                  backgroundColor: '#ecfdf5',
                                  border: '1px solid #a7f3d0',
                                  color: '#047857',
                                  borderRadius: '6px',
                                  padding: '3px 8px',
                                  fontSize: '11px',
                                  fontWeight: '800',
                                  cursor: 'pointer'
                                }}
                              >
                                +10
                              </button>
                              <button
                                onClick={() => handleStockDelta(t.tier_id, 50)}
                                style={{
                                  backgroundColor: '#ecfdf5',
                                  border: '1px solid #a7f3d0',
                                  color: '#047857',
                                  borderRadius: '6px',
                                  padding: '3px 8px',
                                  fontSize: '11px',
                                  fontWeight: '800',
                                  cursor: 'pointer'
                                }}
                              >
                                +50
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: LIVE ORDERS & DISPATCH OPERATIONS
            ========================================================================= */}
        {activeTab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {orders.length === 0 ? (
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '40px',
                textAlign: 'center',
                color: '#64748b'
              }}>
                No orders in the database yet.
              </div>
            ) : (
              orders.map((ord) => (
                <div
                  key={ord.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    padding: '16px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                          {ord.order_number}
                        </span>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: '800',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: ord.account_type === 'HOTEL_WHOLESALE' ? '#fef3c7' : '#d1fae5',
                          color: ord.account_type === 'HOTEL_WHOLESALE' ? '#b45309' : '#047857'
                        }}>
                          {ord.account_type === 'HOTEL_WHOLESALE' ? 'HOTEL WHOLESALE' : 'RETAIL'}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        Customer: <strong>{ord.customer_name}</strong> ({ord.customer_phone})
                        {ord.hotel_name && ` • Hotel: ${ord.hotel_name}`}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: '#059669' }}>
                        ₹{ord.total_amount.toFixed(2)}
                      </div>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: '700',
                        color: ord.payment_status === 'PAID_CASH' ? '#047857' : '#b45309',
                        backgroundColor: ord.payment_status === 'PAID_CASH' ? '#ecfdf5' : '#fffbeb',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {ord.payment_status}
                      </span>
                    </div>
                  </div>

                  {/* Delivery Location & Notes */}
                  <div style={{
                    fontSize: '11px',
                    color: '#475569',
                    backgroundColor: '#f8fafc',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    marginBottom: '10px'
                  }}>
                    <div><strong>Drop:</strong> {ord.delivery_address}</div>
                    {ord.delivery_notes && (
                      <div style={{ color: '#b45309', marginTop: '2px' }}>
                        <strong>Dock Notes:</strong> {ord.delivery_notes}
                      </div>
                    )}
                  </div>

                  {/* Items snapshot */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    marginBottom: '14px',
                    fontSize: '11px',
                    color: '#334155'
                  }}>
                    {ord.items?.map((it, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>• {it.product_name_snapshot} ({it.unit_size_snapshot}) x {it.quantity}</span>
                        <span style={{ fontWeight: '600' }}>₹{it.total_price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Operational Status Actions */}
                  <div style={{
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>
                        Status: <strong>{ord.status}</strong>
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      {ord.status === 'PLACED' && (
                        <button
                          onClick={() => handleOrderStatus(ord.id, 'PACKING')}
                          style={{
                            backgroundColor: '#0284c7',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          Mark Packing
                        </button>
                      )}

                      {(ord.status === 'PLACED' || ord.status === 'PACKING') && (
                        <button
                          onClick={() => handleOrderStatus(ord.id, 'DISPATCHED')}
                          style={{
                            backgroundColor: '#059669',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          Dispatch with Driver
                        </button>
                      )}

                      {ord.status !== 'DELIVERED' && (
                        <button
                          onClick={() => handleOrderStatus(ord.id, 'DELIVERED', 'PAID_CASH')}
                          style={{
                            backgroundColor: '#0f172a',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          Mark Delivered & Cash Received
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* =========================================================================
            TAB: MY BUYERS / CUSTOMER BASE (STORE-SCOPED)
            ========================================================================= */}
        {activeTab === 'customers' && (
          <div>
            {/* Customer Summary Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '12px',
              marginBottom: '18px'
            }}>
              <div style={{
                backgroundColor: '#ffffff',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>Total Buyers</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>
                  {customers.length}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Scoped to this store</div>
              </div>

              <div style={{
                backgroundColor: '#ffffff',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#b45309' }}>🏨 Hotel / HoReCa</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#d97706', marginTop: '4px' }}>
                  {hotelBuyerCount}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Commercial Bulk Buyers</div>
              </div>

              <div style={{
                backgroundColor: '#ffffff',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#047857' }}>🥬 Retail Households</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#059669', marginTop: '4px' }}>
                  {retailBuyerCount}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Daily Consumer Orders</div>
              </div>

              <div style={{
                backgroundColor: '#ffffff',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>Customer Lifetime Value</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#059669', marginTop: '4px' }}>
                  ₹{customers.reduce((sum, c) => sum + (c.lifetime_spend || 0), 0).toFixed(2)}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Total COD Realized</div>
              </div>
            </div>

            {/* Filter Input */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
              maxWidth: '420px'
            }}>
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search buyers by name, phone, or hotel..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  fontSize: '13px'
                }}
              />
            </div>

            {/* Buyers Directory List */}
            {filteredCustomers.length === 0 ? (
              <div style={{
                backgroundColor: '#ffffff',
                padding: '40px 20px',
                borderRadius: '16px',
                textAlign: 'center',
                border: '1px dashed #cbd5e1'
              }}>
                <Users size={36} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#334155' }}>
                  {customers.length === 0 ? 'No Buyers in This Store Yet' : 'No matching buyers found'}
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', maxWidth: '360px', margin: '6px auto 0' }}>
                  {customers.length === 0
                    ? 'Customers who place orders for products sold by this store will be listed here with their order history and contact details.'
                    : 'Try clearing your search query to see all store buyers.'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '14px' }}>
                {filteredCustomers.map((cust) => (
                  <div
                    key={cust.customer_id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '14px',
                      border: '1px solid #e2e8f0',
                      padding: '16px',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      {/* Top Row: Name and Type Badge */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                            {cust.full_name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>📞 +91 {cust.phone}</span>
                          </div>
                        </div>

                        <span style={{
                          fontSize: '10px',
                          fontWeight: '800',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: cust.account_type === 'HOTEL_WHOLESALE' ? '#fef3c7' : '#d1fae5',
                          color: cust.account_type === 'HOTEL_WHOLESALE' ? '#b45309' : '#047857'
                        }}>
                          {cust.account_type === 'HOTEL_WHOLESALE' ? '🏨 HOTEL WHOLESALE' : '🥬 RETAIL'}
                        </span>
                      </div>

                      {/* Hotel Specific Information */}
                      {cust.account_type === 'HOTEL_WHOLESALE' && (
                        <div style={{
                          backgroundColor: '#fffbeb',
                          border: '1px solid #fde68a',
                          borderRadius: '8px',
                          padding: '8px 10px',
                          marginBottom: '10px',
                          fontSize: '11px',
                          color: '#78350f'
                        }}>
                          {cust.hotel_name && <div><strong>Business:</strong> {cust.hotel_name}</div>}
                          {cust.gstin && <div><strong>GSTIN:</strong> <code>{cust.gstin}</code></div>}
                          {cust.dock_receiving_notes && (
                            <div style={{ marginTop: '2px', color: '#92400e' }}>
                              <strong>Dock Instructions:</strong> {cust.dock_receiving_notes}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Address preview */}
                      {cust.last_delivery_address && (
                        <div style={{
                          fontSize: '11px',
                          color: '#475569',
                          backgroundColor: '#f8fafc',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          marginBottom: '10px'
                        }}>
                          <strong>Last Delivery Drop:</strong> {cust.last_delivery_address}
                        </div>
                      )}
                    </div>

                    {/* Bottom Stat Row */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '10px',
                      borderTop: '1px solid #f1f5f9',
                      fontSize: '11px'
                    }}>
                      <div>
                        <span style={{ color: '#64748b' }}>Orders Placed: </span>
                        <strong style={{ color: '#0f172a' }}>{cust.total_orders}</strong>
                      </div>

                      <div>
                        <span style={{ color: '#64748b' }}>Total Spend: </span>
                        <strong style={{ color: '#059669', fontSize: '13px' }}>
                          ₹{(cust.lifetime_spend || 0).toFixed(2)}
                        </strong>
                      </div>

                      {cust.last_order_date && (
                        <div style={{ color: '#94a3b8', fontSize: '10px' }}>
                          {new Date(cust.last_order_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 4: ADD NEW PRODUCE PRODUCT
            ========================================================================= */}
        {activeTab === 'add_product' && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '24px',
            maxWidth: '640px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <h2 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '6px' }}>
              Add New Produce to MySQL
            </h2>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '18px' }}>
              Specify produce details, retail pack pricing, and wholesale bulk crate rates.
            </p>

            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fresh Baby Spinach / Palak"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                    Category *
                  </label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                    Badge Tag
                  </label>
                  <input
                    type="text"
                    value={newProdBadge}
                    onChange={(e) => setNewProdBadge(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                  Image URL (Unsplash or direct image link) *
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={newProdImage}
                  onChange={(e) => setNewProdImage(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                  Description
                </label>
                <textarea
                  placeholder="Tender leaves, ozone washed and pre-chilled for high culinary freshness."
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Retail Tier Configuration */}
              <div style={{
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '10px',
                padding: '12px'
              }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#047857', marginBottom: '8px' }}>
                  🛒 Retail Consumer Pack (Household)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: '700', color: '#065f46' }}>Unit Size</label>
                    <input
                      type="text"
                      value={newProdRetailSize}
                      onChange={(e) => setNewProdRetailSize(e.target.value)}
                      style={{ width: '100%', padding: '6px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: '700', color: '#065f46' }}>Sell Price (₹)</label>
                    <input
                      type="number"
                      value={newProdRetailPrice}
                      onChange={(e) => setNewProdRetailPrice(e.target.value)}
                      style={{ width: '100%', padding: '6px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: '700', color: '#065f46' }}>MRP (₹)</label>
                    <input
                      type="number"
                      value={newProdRetailMrp}
                      onChange={(e) => setNewProdRetailMrp(e.target.value)}
                      style={{ width: '100%', padding: '6px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: '700', color: '#065f46' }}>Initial Stock</label>
                    <input
                      type="number"
                      value={newProdRetailStock}
                      onChange={(e) => setNewProdRetailStock(e.target.value)}
                      style={{ width: '100%', padding: '6px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
              </div>

              {/* Wholesale Tier Configuration */}
              <div style={{
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '10px',
                padding: '12px'
              }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#b45309', marginBottom: '8px' }}>
                  🏨 Hotel Wholesale Bulk Crate (Commercial)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: '700', color: '#78350f' }}>Bulk Unit</label>
                    <input
                      type="text"
                      value={newProdWholesaleSize}
                      onChange={(e) => setNewProdWholesaleSize(e.target.value)}
                      style={{ width: '100%', padding: '6px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: '700', color: '#78350f' }}>Bulk Price (₹)</label>
                    <input
                      type="number"
                      value={newProdWholesalePrice}
                      onChange={(e) => setNewProdWholesalePrice(e.target.value)}
                      style={{ width: '100%', padding: '6px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: '700', color: '#78350f' }}>MRP (₹)</label>
                    <input
                      type="number"
                      value={newProdWholesaleMrp}
                      onChange={(e) => setNewProdWholesaleMrp(e.target.value)}
                      style={{ width: '100%', padding: '6px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: '700', color: '#78350f' }}>Initial Crates</label>
                    <input
                      type="number"
                      value={newProdWholesaleStock}
                      onChange={(e) => setNewProdWholesaleStock(e.target.value)}
                      style={{ width: '100%', padding: '6px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', padding: '12px', marginTop: '6px' }}
              >
                {loading ? 'Saving to Database...' : 'Add Produce to MySQL Catalog'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
