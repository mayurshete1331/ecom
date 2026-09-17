'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  Phone, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  Sparkles,
  Store,
  CheckCircle2
} from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      // Check if user is actually an ADMIN
      if (data.user?.account_type !== 'ADMIN') {
        // Logout immediately to prevent unauthorized session
        await fetch('/api/auth/logout', { method: 'POST' });
        throw new Error('Access Denied: This account is not authorized as a Store Admin.');
      }

      // Successful Admin Login! Redirect to /admin
      router.push('/admin');
    } catch (err) {
      setErrorMsg(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdmin1 = () => {
    setPhone('9999999999');
    setPassword('admin123');
    setErrorMsg('');
  };

  const fillDemoAdmin2 = () => {
    setPhone('8888888888');
    setPassword('admin123');
    setErrorMsg('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0b0f19',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      color: '#ffffff',
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      {/* Back to storefront */}
      <div style={{ width: '100%', maxWidth: '420px', marginBottom: '16px' }}>
        <Link
          href="/"
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
          <span>Back to Storefront</span>
        </Link>
      </div>

      {/* Main Admin Login Card */}
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: '#111827',
        border: '1px solid #1f2937',
        borderRadius: '20px',
        padding: '28px 24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)'
      }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: '#064e3b',
            border: '1px solid #059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            boxShadow: '0 0 20px rgba(5, 150, 105, 0.3)'
          }}>
            <ShieldCheck size={28} color="#10b981" />
          </div>

          <h1 style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.3px', margin: '0 0 4px' }}>
            Store Operations Hub
          </h1>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
            Central Dark Store & Inventory Control System
          </p>
        </div>

        {/* Multi-Store Demo Quick Logins */}
        <div style={{
          backgroundColor: '#1f2937',
          border: '1px solid #374151',
          borderRadius: '12px',
          padding: '12px',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={13} />
            <span>Test Multi-Admin Accounts:</span>
          </div>

          {/* Store 1 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#111827',
            padding: '6px 10px',
            borderRadius: '8px',
            border: '1px solid #2d3748'
          }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#10b981' }}>Store 1: KisanDirect Central Farm</div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>Phone: <code>9999999999</code></div>
            </div>
            <button
              type="button"
              onClick={fillDemoAdmin1}
              style={{
                backgroundColor: '#059669',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Fill
            </button>
          </div>

          {/* Store 2 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#111827',
            padding: '6px 10px',
            borderRadius: '8px',
            border: '1px solid #2d3748'
          }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#38bdf8' }}>Store 2: Brothers Green Harvest</div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>Phone: <code>8888888888</code></div>
            </div>
            <button
              type="button"
              onClick={fillDemoAdmin2}
              style={{
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Fill
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            color: '#f87171',
            borderRadius: '10px',
            padding: '10px 12px',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
              Admin Mobile Number
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '10px',
              padding: '10px 12px'
            }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#cbd5e1', paddingRight: '8px', borderRight: '1px solid #4b5563' }}>
                +91
              </span>
              <input
                type="tel"
                placeholder="Enter 10-digit admin phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
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

          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
              Admin Password / Secret Key
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
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#ffffff',
                  width: '100%',
                  paddingLeft: '10px',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#059669',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '12px',
              fontSize: '14px',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              marginTop: '8px',
              boxShadow: '0 4px 14px rgba(5, 150, 105, 0.4)',
              transition: 'background-color 0.2s ease'
            }}
          >
            <span>{loading ? 'Verifying Admin Credentials...' : 'Authenticate & Enter Hub'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid #1f2937',
          textAlign: 'center',
          fontSize: '12px',
          color: '#94a3b8'
        }}>
          Are you a new partner or farm supplier?{' '}
          <Link href="/admin/signup" style={{ color: '#10b981', fontWeight: '700', textDecoration: 'none' }}>
            Register New Store & Admin
          </Link>
        </div>

        <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '11px', color: '#64748b' }}>
          Authorized Personnel Only • IP Address Logged
        </div>
      </div>
    </div>
  );
}
