import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api, ApiError } from '@/lib/api';
import { token } from '@/lib/token';
import { toast } from 'sonner';

interface CartItem {
  id: string;          // cart item UUID from backend
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  moq: number;
}

interface WishlistItem {
  id: string;          // wishlist item UUID from backend
  productId: string;
  name: string;
  price: number;
  image: string;
}

interface CartContextType {
  cartItems: CartItem[];
  wishlistItems: WishlistItem[];
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateCartItemQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (wishlistItemId: string) => Promise<void>;
  moveToCart: (wishlistItemId: string) => Promise<void>;
  cartTotal: number;
  cartCount: number;
  wishlistCount: number;
  refreshCart: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function isAuthenticated(): boolean {
  return !!token.getAccess() && token.getUserType() === 'user';
}

function normalizeCartItem(raw: Record<string, unknown>): CartItem {
  const product = (raw.product || {}) as Record<string, unknown>;
  return {
    id: raw.id as string,
    productId: (raw.product_id as string) || (product.id as string) || '',
    name: (product.name as string) || '',
    price: Number(product.sales_price || product.regular_price) || 0,
    quantity: Number(raw.quantity) || 1,
    image: (product.image_url as string) || '',
    moq: Number(product.moq) || 1,
  };
}

function normalizeWishlistItem(raw: Record<string, unknown>): WishlistItem {
  const product = (raw.product || {}) as Record<string, unknown>;
  return {
    id: raw.id as string,
    productId: (raw.product_id as string) || (product.id as string) || '',
    name: (product.name as string) || '',
    price: Number(product.sales_price || product.regular_price) || 0,
    image: (product.image_url as string) || '',
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated()) return;
    try {
      const res = await api.get<unknown>('/cart');
      const data = res.data as Record<string, unknown>;
      const raw = (data.items || []) as Record<string, unknown>[];
      setCartItems(raw.map(normalizeCartItem));
    } catch {
      // silently fail — cart may just be empty
    }
  }, []);

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated()) return;
    try {
      const res = await api.get<unknown>('/wishlist');
      const data = res.data as Record<string, unknown>;
      const raw = (data.items || []) as Record<string, unknown>[];
      setWishlistItems(raw.map(normalizeWishlistItem));
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated()) {
      refreshCart();
      refreshWishlist();
    }
  }, [refreshCart, refreshWishlist]);

  const addToCart = async (productId: string, quantity = 1) => {
    if (!isAuthenticated()) {
      toast.error('Please log in to add items to cart');
      return;
    }
    try {
      await api.post('/cart', { productId, quantity });
      await refreshCart();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to add to cart');
      throw err;
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    if (!isAuthenticated()) return;
    try {
      await api.delete(`/cart/${cartItemId}`);
      setCartItems((prev) => prev.filter((i) => i.id !== cartItemId));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to remove from cart');
      throw err;
    }
  };

  const updateCartItemQuantity = async (cartItemId: string, quantity: number) => {
    if (!isAuthenticated()) return;
    if (quantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }
    try {
      await api.patch(`/cart/${cartItemId}`, { quantity });
      setCartItems((prev) => prev.map((i) => i.id === cartItemId ? { ...i, quantity } : i));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update quantity');
      throw err;
    }
  };

  const clearCart = () => {
    // Local clear only — no backend bulk-clear endpoint
    setCartItems([]);
  };

  const addToWishlist = async (productId: string) => {
    if (!isAuthenticated()) {
      toast.error('Please log in to save items to wishlist');
      return;
    }
    const alreadyIn = wishlistItems.some((i) => i.productId === productId);
    if (alreadyIn) {
      toast.info('Already in your wishlist');
      return;
    }
    try {
      await api.post('/wishlist', { productId });
      await refreshWishlist();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to add to wishlist');
      throw err;
    }
  };

  const removeFromWishlist = async (wishlistItemId: string) => {
    if (!isAuthenticated()) return;
    try {
      await api.delete(`/wishlist/${wishlistItemId}`);
      setWishlistItems((prev) => prev.filter((i) => i.id !== wishlistItemId));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to remove from wishlist');
      throw err;
    }
  };

  const moveToCart = async (wishlistItemId: string) => {
    if (!isAuthenticated()) return;
    try {
      await api.post(`/wishlist/${wishlistItemId}/move-to-cart`, {});
      await refreshCart();
      setWishlistItems((prev) => prev.filter((i) => i.id !== wishlistItemId));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to move to cart');
      throw err;
    }
  };

  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const wishlistCount = wishlistItems.length;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        wishlistItems,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        addToWishlist,
        removeFromWishlist,
        moveToCart,
        cartTotal,
        cartCount,
        wishlistCount,
        refreshCart,
        refreshWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
