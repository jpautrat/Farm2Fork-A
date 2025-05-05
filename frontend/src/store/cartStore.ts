import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  unit: string;
  farmer_id: string;
  farmer_name: string;
}

interface CartStore {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemsByFarmer: () => Record<string, CartItem[]>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addToCart: (item) => {
        const { items } = get();
        const existingItem = items.find((i) => i.id === item.id);
        
        if (existingItem) {
          // Update quantity if item already exists
          set({
            items: items.map((i) =>
              i.id === item.id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          // Add new item
          set({ items: [...items, item] });
        }
      },
      
      removeFromCart: (itemId) => {
        const { items } = get();
        set({ items: items.filter((item) => item.id !== itemId) });
      },
      
      updateQuantity: (itemId, quantity) => {
        const { items } = get();
        set({
          items: items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        });
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getTotalPrice: () => {
        const { items } = get();
        return items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
      
      getItemsByFarmer: () => {
        const { items } = get();
        return items.reduce((grouped, item) => {
          const farmerId = item.farmer_id;
          if (!grouped[farmerId]) {
            grouped[farmerId] = [];
          }
          grouped[farmerId].push(item);
          return grouped;
        }, {} as Record<string, CartItem[]>);
      },
    }),
    {
      name: 'farm2fork-cart',
    }
  )
);
