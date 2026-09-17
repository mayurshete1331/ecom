'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSTip, setShowIOSTip] = useState(false);

  useEffect(() => {
    // Check if running already in standalone PWA mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      return; // Already installed!
    }

    // Check if iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Show prompt after 2 seconds if on mobile device
    const timer = setTimeout(() => {
      if (isIosDevice && !isStandalone) {
        setShowPrompt(true);
      } else if (!isStandalone) {
        setShowPrompt(true);
      }
    }, 1500);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSTip(true);
    } else {
      // Fallback instructions
      alert('To install KisanDirect: Open your browser menu (⋮) and tap "Add to Home screen" or "Install App".');
    }
  };

  if (!showPrompt) return null;

  return (
    <div style={{
      backgroundColor: '#0f172a',
      color: '#ffffff',
      padding: '8px 14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '10px',
      borderBottom: '1px solid #1e293b',
      position: 'relative',
      zIndex: 60,
      boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
        <div style={{
          width: '30px',
          height: '30px',
          borderRadius: '8px',
          backgroundColor: '#059669',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Smartphone size={16} color="#ffffff" />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Download KisanDirect App</span>
            <span style={{ fontSize: '8px', backgroundColor: '#fbbf24', color: '#000', padding: '1px 4px', borderRadius: '3px', fontWeight: '900' }}>
              FAST
            </span>
          </div>
          <div style={{ fontSize: '10px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Install on phone for 15-min 1-tap orders
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        <button
          onClick={handleInstallClick}
          style={{
            backgroundColor: '#059669',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '5px 10px',
            fontSize: '11px',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 2px 6px rgba(5, 150, 105, 0.4)'
          }}
        >
          <Download size={12} />
          <span>Install</span>
        </button>

        <button
          onClick={() => setShowPrompt(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: '2px'
          }}
        >
          <X size={15} />
        </button>
      </div>

      {/* iOS Safari Tip Bubble */}
      {showIOSTip && (
        <div style={{
          position: 'absolute',
          bottom: '-55px',
          left: '14px',
          right: '14px',
          backgroundColor: '#1e293b',
          color: '#ffffff',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '11px',
          border: '1px solid #334155',
          boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>
            Tap the <strong>Share</strong> icon (⬆) at the bottom, then select <strong>&quot;Add to Home Screen&quot;</strong> (➕).
          </span>
          <button
            onClick={() => setShowIOSTip(false)}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
