'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  X, 
  Phone, 
  Lock, 
  User, 
  Building2, 
  FileText, 
  MapPin, 
  CheckCircle2
} from 'lucide-react';

export default function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuth,
    login,
    register,
    authModalRole,
    setAuthModalRole,
    authModalTab,
    setAuthModalTab
  } = useAuth();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [hotelName, setHotelName] = useState('');
  const [gstin, setGstin] = useState('');
  const [dockNotes, setDockNotes] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [pincode, setPincode] = useState('411045');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (authModalTab === 'login') {
        await login(phone, password);
      } else {
        await register({
          phone,
          password,
          full_name: fullName,
          account_type: authModalRole,
          hotel_name: hotelName,
          gstin,
          dock_receiving_notes: dockNotes,
          address_line: addressLine,
          pincode
        });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="drawer-backdrop" onClick={closeAuth}>
      <div 
        className="bottom-sheet" 
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '16px 20px 24px', overflowY: 'auto' }}
      >
        <div className="bottom-sheet-handle" />

        {/* Header Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '6px',
          marginBottom: '14px'
        }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
              {authModalTab === 'login' ? 'Welcome to KisanDirect' : 'Create Account'}
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b' }}>
              {authModalTab === 'login' 
                ? 'Direct login to place cash-on-delivery orders' 
                : 'Sign up in 30 seconds (Zero OTP hassle)'}
            </p>
          </div>
          <button
            onClick={closeAuth}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Selector: Login vs Register */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          backgroundColor: '#f1f5f9',
          borderRadius: '10px',
          padding: '3px',
          marginBottom: '14px'
        }}>
          <button
            type="button"
            onClick={() => { setAuthModalTab('login'); setErrorMsg(''); }}
            style={{
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '13px',
              fontWeight: authModalTab === 'login' ? '700' : '600',
              backgroundColor: authModalTab === 'login' ? '#ffffff' : 'transparent',
              color: authModalTab === 'login' ? '#0f172a' : '#64748b',
              cursor: 'pointer',
              boxShadow: authModalTab === 'login' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setAuthModalTab('register'); setErrorMsg(''); }}
            style={{
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '13px',
              fontWeight: authModalTab === 'register' ? '700' : '600',
              backgroundColor: authModalTab === 'register' ? '#ffffff' : 'transparent',
              color: authModalTab === 'register' ? '#0f172a' : '#64748b',
              cursor: 'pointer',
              boxShadow: authModalTab === 'register' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            Create Account
          </button>
        </div>

        {/* Role Selector (Household vs Hotel) */}
        {authModalTab === 'register' && (
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '6px', display: 'block' }}>
              Select Account Category:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div
                onClick={() => setAuthModalRole('RETAIL')}
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  border: authModalRole === 'RETAIL' ? '2px solid #059669' : '1px solid #e2e8f0',
                  backgroundColor: authModalRole === 'RETAIL' ? '#ecfdf5' : '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700', fontSize: '12px', color: '#047857' }}>
                  <User size={13} />
                  <span>Household Retail</span>
                </div>
                <span style={{ fontSize: '10px', color: '#64748b' }}>For daily home cooking</span>
              </div>

              <div
                onClick={() => setAuthModalRole('HOTEL_WHOLESALE')}
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  border: authModalRole === 'HOTEL_WHOLESALE' ? '2px solid #0f172a' : '1px solid #e2e8f0',
                  backgroundColor: authModalRole === 'HOTEL_WHOLESALE' ? '#f8fafc' : '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700', fontSize: '12px', color: '#0f172a' }}>
                  <Building2 size={13} />
                  <span>Hotel / HoReCa</span>
                </div>
                <span style={{ fontSize: '10px', color: '#64748b' }}>Bulk crates & GST bill</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {errorMsg && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '12px'
          }}>
            {errorMsg}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {authModalTab === 'register' && (
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px', display: 'block' }}>
                Full Name *
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '8px 12px'
              }}>
                <User size={15} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="e.g. Pooja Sharma or Chef Rajesh"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  style={{
                    border: 'none',
                    background: 'transparent',
                    width: '100%',
                    paddingLeft: '8px',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          )}

          {/* Hotel Specific Fields */}
          {authModalTab === 'register' && authModalRole === 'HOTEL_WHOLESALE' && (
            <>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px', display: 'block' }}>
                  Hotel / Restaurant / Cloud Kitchen Name *
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}>
                  <Building2 size={15} color="#94a3b8" />
                  <input
                    type="text"
                    placeholder="e.g. Royal Grand Palace Restaurant"
                    value={hotelName}
                    onChange={(e) => setHotelName(e.target.value)}
                    required
                    style={{
                      border: 'none',
                      background: 'transparent',
                      width: '100%',
                      paddingLeft: '8px',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px', display: 'block' }}>
                  GSTIN Number (Optional for Tax Invoice)
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}>
                  <FileText size={15} color="#94a3b8" />
                  <input
                    type="text"
                    placeholder="e.g. 27AABCR1234F1Z5"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      width: '100%',
                      paddingLeft: '8px',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Phone Number */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px', display: 'block' }}>
              Mobile Phone Number *
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '8px 12px'
            }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', paddingRight: '6px', borderRight: '1px solid #e2e8f0' }}>
                +91
              </span>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                required
                style={{
                  border: 'none',
                  background: 'transparent',
                  width: '100%',
                  paddingLeft: '8px',
                  fontSize: '13px',
                  outline: 'none',
                  fontWeight: '600'
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px', display: 'block' }}>
              Password / Secret PIN *
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '8px 12px'
            }}>
              <Lock size={15} color="#94a3b8" />
              <input
                type="password"
                placeholder="Enter password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  border: 'none',
                  background: 'transparent',
                  width: '100%',
                  paddingLeft: '8px',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Address for Registration */}
          {authModalTab === 'register' && (
            <>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px', display: 'block' }}>
                  {authModalRole === 'HOTEL_WHOLESALE' ? 'Commercial Receiving Dock / Kitchen Address *' : 'Delivery Address *'}
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}>
                  <MapPin size={15} color="#94a3b8" />
                  <input
                    type="text"
                    placeholder="Building, Street, Landmark, Area"
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    required
                    style={{
                      border: 'none',
                      background: 'transparent',
                      width: '100%',
                      paddingLeft: '8px',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {authModalRole === 'HOTEL_WHOLESALE' && (
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px', display: 'block' }}>
                    Dock Delivery Instructions
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rear gate delivery between 6am-9am"
                    value={dockNotes}
                    onChange={(e) => setDockNotes(e.target.value)}
                    style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      width: '100%',
                      fontSize: '12px',
                      outline: 'none'
                    }}
                  />
                </div>
              )}
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              marginTop: '8px',
              padding: '12px',
              fontSize: '14px',
              background: authModalRole === 'HOTEL_WHOLESALE' 
                ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' 
                : 'linear-gradient(135deg, #059669 0%, #047857 100%)'
            }}
          >
            {loading ? 'Processing...' : (authModalTab === 'login' ? 'Sign In' : 'Complete Registration')}
          </button>
        </form>
      </div>
    </div>
  );
}
