"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface CartItem {
  id: string;
  name: string;
  subtitle?: string;
  price: number;
  image_url: string | null;
  slug: string;
  quantity: number;
  gift_package?: {
    id: string;
    name: string;
    price: number;
    image_url?: string;
  } | null;
}

interface CartContextType {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string, giftPackageId?: string) => void;
  updateQty: (id: string, qty: number, giftPackageId?: string) => void;
  clearCart: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "spectra_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.id === product.id && (i.gift_package?.id || null) === (product.gift_package?.id || null)
      );
      if (existing) {
        return prev.map((i) =>
          i.id === product.id && (i.gift_package?.id || null) === (product.gift_package?.id || null)
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsOpen(true); // open cart drawer on add
  }, []);

  const removeItem = useCallback((id: string, giftPackageId?: string) => {
    setItems((prev) =>
      prev.filter(
        (i) => !(i.id === id && (giftPackageId ? i.gift_package?.id === giftPackageId : true))
      )
    );
  }, []);

  const updateQty = useCallback((id: string, qty: number, giftPackageId?: string) => {
    if (qty < 1) {
      setItems((prev) =>
        prev.filter(
          (i) => !(i.id === id && (giftPackageId ? i.gift_package?.id === giftPackageId : true))
        )
      );
    } else {
      setItems((prev) =>
        prev.map((i) =>
          i.id === id && (giftPackageId ? i.gift_package?.id === giftPackageId : true)
            ? { ...i, quantity: qty }
            : i
        )
      );
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => {
    const itemPrice = Number(i.price) + (i.gift_package ? Number(i.gift_package.price) : 0);
    return s + itemPrice * i.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{ items, count, total, addItem, removeItem, updateQty, clearCart, isOpen, openCart, closeCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
