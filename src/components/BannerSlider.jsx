'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { Tag, Sparkles, Clock, ShieldCheck } from 'lucide-react';

export default function BannerSlider() {
  const { mode } = useCart();
  const [activeSlide, setActiveSlide] = useState(0);

  const retailBanners = [
    {
      title: 'Sprouted Farm Fresh Daily',
      subtitle: 'Organic Matki & Moong Sprouts rinsed in ozone water',
      tag: '⚡ 15 MINS DROP',
      bgColor: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
      code: 'FRESH10'
    },
    {
      title: 'Crisp Broccoli & Malai Paneer',
      subtitle: 'Hand-graded daily harvest direct from Pune farms',
      tag: '🥦 SAVE UP TO 30%',
      bgColor: 'linear-gradient(135deg, #047857 0%, #0d9488 100%)',
      code: 'HEALTHY'
    }
  ];

  const wholesaleBanners = [
    {
      title: 'Hotel & Cloud Kitchen Bulk Supply',
      subtitle: '5kg to 50kg graded crates with direct GST tax invoice',
      tag: '🏨 HORECA RATES',
      bgColor: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      code: 'HOTELBULK'
    },
    {
      title: 'Morning Dock Delivery by 7:30 AM',
      subtitle: 'Guaranteed kitchen door arrival before morning prep starts',
      tag: '🚚 DEDICATED LOGISTICS',
      bgColor: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
      code: 'MORNING7'
    }
  ];

  const banners = mode === 'WHOLESALE' ? wholesaleBanners : retailBanners;

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div style={{ padding: '8px 14px 12px' }}>
      <div style={{
        background: banners[activeSlide].bgColor,
        borderRadius: '16px',
        padding: '16px 18px',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.15)',
        transition: 'all 0.4s ease'
      }}>
        {/* Glow accent */}
        <div style={{
          position: 'absolute',
          top: '-30px',
          right: '-30px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.12)',
          filter: 'blur(10px)'
        }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(8px)',
            borderRadius: '999px',
            padding: '3px 10px',
            fontSize: '10px',
            fontWeight: '800',
            letterSpacing: '0.5px',
            marginBottom: '8px'
          }}>
            <Sparkles size={11} color="#fde047" />
            <span>{banners[activeSlide].tag}</span>
          </div>

          <h3 style={{
            fontSize: '16px',
            fontWeight: '800',
            marginBottom: '4px',
            letterSpacing: '-0.3px',
            lineHeight: 1.25
          }}>
            {banners[activeSlide].title}
          </h3>

          <p style={{
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.85)',
            marginBottom: '10px',
            lineHeight: 1.4
          }}>
            {banners[activeSlide].subtitle}
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '700',
              fontFamily: 'monospace'
            }}>
              <Tag size={12} color="#fbbf24" />
              <span>Use: {banners[activeSlide].code}</span>
            </div>

            {/* Slide indicators */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {banners.map((_, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  style={{
                    width: activeSlide === idx ? '16px' : '6px',
                    height: '6px',
                    borderRadius: '999px',
                    backgroundColor: activeSlide === idx ? '#ffffff' : 'rgba(255, 255, 255, 0.4)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
