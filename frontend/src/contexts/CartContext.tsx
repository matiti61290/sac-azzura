'use client'

import { createContext, useContext, useEffect, useState } from 'react';

// Le type d'un article dans le panier (basé sur ton StockEntity)
export interface CartItem {
  stockId: number;
  productId: string | number;
  name: string;
  price: number;
  colorName: string;
  materialName: string;
  imageUrl: string;
  quantity: number;
  sku: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (stockId: number) => void;
  updateQuantity: (stockId: number, quantity: number) => void;
  cleanCart: () => void
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Charger le panier depuis le localStorage au démarrage
  useEffect(() => {
    const savedCart = localStorage.getItem('sacAzura_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    setIsLoaded(true);
  }, []);

  // Sauvegarder dans le localStorage à chaque modification
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('sacAzura_cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const addToCart = (newItem: CartItem) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.stockId === newItem.stockId);
      if (existingItem) {
        return prev.map((item) =>
          item.stockId === newItem.stockId
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }
      return [...prev, newItem];
    });
  };

  const removeFromCart = (stockId: number) => {
    setCart((prev) => prev.filter((item) => item.stockId !== stockId));
  };

  const updateQuantity = (stockId: number, quantity: number) => {
    if (quantity < 1) return;
    setCart((prev) =>
      prev.map((item) => (item.stockId === stockId ? { ...item, quantity } : item))
    );
  };

  const cleanCart = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sacAzura_cart')
    }
    setCart([])
  }

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, cleanCart, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

// Hook personnalisé pour utiliser le panier facilement partout
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart doit être utilisé dans un CartProvider');
  }
  return context;
}