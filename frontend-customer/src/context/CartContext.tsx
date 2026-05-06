'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Cart, CartItem } from '@/types';
import api, { getErrorMessage } from '@/lib/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface CartContextType {
  cart: Cart | null;
  cartCount: number;
  isLoading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    try {
      const { data } = await api.get('/cart');
      if (data.success) setCart(data.data);
    } catch {
      // silent fail
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const addToCart = async (productId: string, quantity = 1) => {
    setIsLoading(true);
    try {
      const { data } = await api.post('/cart/add', { productId, quantity });
      if (data.success) {
        setCart(data.data);
        toast.success('Added to cart!');
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    setIsLoading(true);
    try {
      const { data } = await api.delete(`/cart/remove/${productId}`);
      if (data.success) {
        setCart(data.data);
        toast.success('Removed from cart');
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    setIsLoading(true);
    try {
      const { data } = await api.put(`/cart/update/${productId}`, { quantity });
      if (data.success) setCart(data.data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart/clear');
      setCart(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <CartContext.Provider value={{ cart, cartCount, isLoading, addToCart, removeFromCart, updateQuantity, clearCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
