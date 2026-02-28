import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: number;
    brand: string;
    model: string;
    price: number;
    image: string;
    quantity: number;
}

interface CartState {
    items: CartItem[];
    isOpen: boolean;
    addItem: (item: Omit<CartItem, 'quantity' | 'price'>, rawPriceStr: string) => void;
    removeItem: (id: number) => void;
    clearCart: () => void;
    toggleCart: () => void;
    getCartTotal: () => number;
    getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,

            addItem: (item, rawPriceStr) => {
                // Convert string price (e.g., "$125,000") to raw number (125000)
                const numericPrice = Number(rawPriceStr.replace(/[^0-9.-]+/g, ""));

                set((state) => {
                    const existingItem = state.items.find((i) => i.id === item.id);

                    if (existingItem) {
                        return {
                            items: state.items.map((i) =>
                                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                            ),
                            isOpen: true // auto open cart on add
                        };
                    }

                    return {
                        items: [...state.items, { ...item, price: numericPrice, quantity: 1 }],
                        isOpen: true
                    };
                });
            },

            removeItem: (id) =>
                set((state) => ({
                    items: state.items.filter((item) => item.id !== id),
                })),

            clearCart: () => set({ items: [] }),

            toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

            getCartTotal: () => {
                return get().items.reduce(
                    (total, item) => total + item.price * item.quantity,
                    0
                );
            },

            getItemCount: () => {
                return get().items.reduce((count, item) => count + item.quantity, 0);
            }
        }),
        {
            name: 'luxe-cart-storage',
        }
    )
);
