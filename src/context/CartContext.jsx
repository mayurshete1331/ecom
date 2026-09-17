'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [mode, setMode] = useState('RETAIL'); // 'RETAIL' | 'WHOLESALE'
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);

  // Load saved mode and cart from localStorage
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem('fresh_mode');
      if (savedMode === 'WHOLESALE' || savedMode === 'RETAIL') {
        setMode(savedMode);
      }
      const savedCart = localStorage.getItem(`fresh_cart_${savedMode || 'RETAIL'}`);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save cart changes
  useEffect(() => {
    try {
      localStorage.setItem(`fresh_cart_${mode}`, JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart, mode]);

  const switchMode = (newMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    localStorage.setItem('fresh_mode', newMode);
    // Load that mode's cart
    try {
      const saved = localStorage.getItem(`fresh_cart_${newMode}`);
      setCart(saved ? JSON.parse(saved) : []);
    } catch (e) {
      setCart([]);
    }
  };

  const addToCart = (product, tier) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.tier.id === tier.id);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + 1
        };
        return next;
      } else {
        const initialQty = Math.max(1, tier.min_order_qty || 1);
        return [...prev, { product, tier, quantity: initialQty }];
      }
    });
  };

  const updateQuantity = (tierId, delta) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.tier.id === tierId) {
            const nextQty = item.quantity + delta;
            const minQty = item.tier.min_order_qty || 1;
            if (nextQty < minQty && delta < 0) {
              return null; // Remove item if below min order qty
            }
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const removeFromCart = (tierId) => {
    setCart((prev) => prev.filter((item) => item.tier.id !== tierId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getItemQuantity = (tierId) => {
    const item = cart.find((i) => i.tier.id === tierId);
    return item ? item.quantity : 0;
  };

  // Computations
  const subtotal = cart.reduce((sum, item) => sum + item.tier.price * item.quantity, 0);
  const totalMrp = cart.reduce((sum, item) => sum + item.tier.mrp * item.quantity, 0);
  const totalSavings = Math.max(0, totalMrp - subtotal);
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Delivery rules:
  // Retail: Free above ₹199, else ₹25
  // Wholesale: Free above ₹2000, else ₹120
  const deliveryFee = cart.length === 0
    ? 0
    : mode === 'RETAIL'
      ? (subtotal >= 199 ? 0 : 25)
      : (subtotal >= 2000 ? 0 : 120);

  // Wholesale has 5% GST for hotel tax invoices
  const taxGst = mode === 'WHOLESALE' ? Math.round(subtotal * 0.05 * 100) / 100 : 0;
  const totalAmount = subtotal + deliveryFee + taxGst;

  return (
    <CartContext.Provider
      value={{
        mode,
        switchMode,
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getItemQuantity,
        subtotal,
        totalMrp,
        totalSavings,
        totalCount,
        deliveryFee,
        taxGst,
        totalAmount,
        isCartOpen,
        setIsCartOpen,
        isOrdersOpen,
        setIsOrdersOpen,
        isTrackingOpen,
        setIsTrackingOpen,
        activeOrder,
        setActiveOrder
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
