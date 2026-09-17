'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Store, 
  ShieldCheck, 
  User, 
  Phone, 
  Lock, 
  MapPin, 
  FileText, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function AdminSignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    password: '',
    store_name: '',
    city: 'Pune',
    pincode: '411045',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'phone' || name === 'pincode' ? value.replace(/\D/g, '') : value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (formData.phone.length !== 10) {
      setErrorMsg('Please provide a valid 10-digit mobile number.');
      return;
    }
    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (!formData.store_name.trim()) {
      setErrorMsg('Store / Farm / Business name is required.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to create admin store account.');
      }

      // Successful registration! Cookie is set, redirect to admin dashboard
      router.push('/admin');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0b0f19',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '30px 20px',
      color: '#ffffff',
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      {/* Top Navigation */}
      <div style={{ width: '100%', maxWidth: '480px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link
          href="/admin/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: '#94a3b8',
            textDecoration: 'none',
            fontSize: '12px',
            fontWeight: '600'
          }}
        >
          <ArrowLeft size={14} />
          <span>Back to Admin Login</span>
        </Link>
        <Link
          href="/"
          style={{
            color: '#64748b',
            textDecoration: 'none',
            fontSize: '12px',
            fontWeight: '600'
          }}
        >
          Storefront
        </Link>
      </div>

      {/* Main Registration Card */}
      <div style={{
        width: '100%',
        maxWidth: '480px',
        backgroundColor: '#111827',
        border: '1px solid #1f2937',
        borderRadius: '24px',
        padding: '32px 26px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)'
      }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '18px',
            backgroundColor: 'rgba(5, 150, 105, 0.15)',
            border: '1px solid #059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 0 24px rgba(5, 150, 105, 0.25)'
          }}>
            <Store size={30} color="#10b981" />
          </div>

          <h1 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.4px', margin: '0 0 6px' }}>
            Register New Admin & Store
          </h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
            Create an independent store to manage your own produce catalog, live inventory, and dedicated buyers.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            color: '#f87171',
            borderRadius: '12px',
            padding: '12px 14px',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Section: Admin Info */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <ShieldCheck size={14} />
              <span>Admin Personnel Details</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                  Admin Full Name *
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '10px',
                  padding: '10px 12px'
                }}>
                  <User size={16} color="#94a3b8" />
                  <input
                    type="text"
                    name="full_name"
                    placeholder="e.g. Ramesh Patil / Harish Bro"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: '#ffffff',
                      width: '100%',
                      paddingLeft: '10px',
                      fontSize: '13px',
                      fontWeight: '600',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                    Mobile Phone *
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '10px',
                    padding: '10px 12px'
                  }}>
                    <Phone size={15} color="#94a3b8" />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="10-digit mobile"
                      maxLength={10}
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: '#ffffff',
                        width: '100%',
                        paddingLeft: '8px',
                        fontSize: '13px',
                        fontWeight: '600',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                    Password *
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '10px',
                    padding: '10px 12px'
                  }}>
                    <Lock size={15} color="#94a3b8" />
                    <input
                      type="password"
                      name="password"
                      placeholder="Min 6 chars"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: '#ffffff',
                        width: '100%',
                        paddingLeft: '8px',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Store Info */}
          <div style={{ marginTop: '6px' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Store size={14} />
              <span>Farm / Store Details</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                  Store / Supplier Business Name *
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '10px',
                  padding: '10px 12px'
                }}>
                  <Store size={16} color="#94a3b8" />
                  <input
                    type="text"
                    name="store_name"
                    placeholder="e.g. Patil Organic Farms / Pune Sprout Hub"
                    value={formData.store_name}
                    onChange={handleChange}
                    required
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: '#ffffff',
                      width: '100%',
                      paddingLeft: '10px',
                      fontSize: '13px',
                      fontWeight: '600',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                    Hub Operating City
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '10px',
                    padding: '10px 12px'
                  }}>
                    <MapPin size={15} color="#94a3b8" />
                    <input
                      type="text"
                      name="city"
                      placeholder="e.g. Pune"
                      value={formData.city}
                      onChange={handleChange}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: '#ffffff',
                        width: '100%',
                        paddingLeft: '8px',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    placeholder="411045"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={handleChange}
                    style={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      color: '#ffffff',
                      width: '100%',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                  Farm / Hub Description (Optional)
                </label>
                <textarea
                  name="description"
                  placeholder="e.g. Specializing in organic sprouts, hydroponics, and direct farm greens."
                  value={formData.description}
                  onChange={handleChange}
                  rows={2}
                  style={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    color: '#ffffff',
                    width: '100%',
                    fontSize: '12px',
                    outline: 'none',
                    resize: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#059669',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '14px',
              fontSize: '14px',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '10px',
              boxShadow: '0 4px 14px rgba(5, 150, 105, 0.4)',
              transition: 'background-color 0.2s ease',
              opacity: loading ? 0.7 : 1
            }}
          >
            <span>{loading ? 'Creating Store & Account...' : 'Create Admin Account & Launch Store'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Switch back to login */}
        <div style={{ marginTop: '22px', textAlign: 'center', fontSize: '13px', color: '#94a3b8' }}>
          Already have an admin account?{' '}
          <Link href="/admin/login" style={{ color: '#10b981', fontWeight: '700', textDecoration: 'none' }}>
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
}
