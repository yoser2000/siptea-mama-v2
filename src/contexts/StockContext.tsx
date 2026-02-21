import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { CartItem } from './OrderContext';
import {
  noodleFlavors,
  sharedToppings,
  soupTypes,
  dippingSauces,
  odenAddOns,
  MAMA_BASE_PRICE,
  ODEN_BASE_PRICE,
  EXTRA_NOODLE_PRICE,
} from '@/data/menuData';

/* =========================
   Types
========================= */

export type StockCategory =
  | 'noodleFlavors'
  | 'toppings'
  | 'soupTypes'
  | 'dippingSauces'
  | 'odenAddOns';

export interface StockItem {
  id: string;
  name: string;
  price: number;
  cost: number;
  image?: string;
  stock: number;
  minStock: number;
  enabled: boolean;
}

export interface StockConfig {
  mamaBasePrice: number;
  odenBasePrice: number;
  extraNoodlePrice: number;
}

type StockData = Record<StockCategory, StockItem[]>;

interface StockContextType {
  getAvailableItems: (category: StockCategory) => StockItem[];
  getMenuItems: (category: StockCategory) => StockItem[];
  getAllItems: (category: StockCategory) => StockItem[];
  updateItem: (
    category: StockCategory,
    id: string,
    updates: Partial<StockItem>
  ) => void;
  deductStock: (items: CartItem[]) => void;
  getRemainingStock: (
    category: StockCategory,
    itemId: string,
    cartItems: CartItem[],
    excludeCartItemId?: string
  ) => number;
  config: StockConfig;
  lowStockItems: { category: StockCategory; item: StockItem }[];
}

/* =========================
   Constants
========================= */

const STOCK_KEY = 'restaurant-stock';

/* =========================
   Helpers
========================= */

const toStockItems = (
  items: { id: string; name: string; price: number; image?: string }[]
): StockItem[] =>
  items.map(item => ({
    ...item,
    stock: 50,
    minStock: 5,
    enabled: true,
    cost: item.price * 0.6,
  }));

function initStockData(): StockData {
  try {
    const stored = localStorage.getItem(STOCK_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.toppings) return parsed;
    }
  } catch {}

  return {
    noodleFlavors: toStockItems(noodleFlavors),
    toppings: toStockItems(sharedToppings),
    soupTypes: toStockItems(soupTypes),
    dippingSauces: toStockItems(dippingSauces),
    odenAddOns: toStockItems(odenAddOns),
  };
}

/* =========================
   Context
========================= */

const StockContext = createContext<StockContextType | null>(null);

export function StockProvider({ children }: { children: React.ReactNode }) {
  const [stockData, setStockData] = useState<StockData>(initStockData);

  const [config] = useState<StockConfig>({
    mamaBasePrice: MAMA_BASE_PRICE,
    odenBasePrice: ODEN_BASE_PRICE,
    extraNoodlePrice: EXTRA_NOODLE_PRICE,
  });

  /* =========================
   Get Remaining Stock
========================= */

const getRemainingStock = useCallback(
  (
    category: StockCategory,
    itemId: string,
    cartItems: CartItem[],
    excludeCartItemId?: string
  ) => {
    const stockItem = stockData[category]?.find(i => i.id === itemId);
    if (!stockItem) return 0;

    const totalStock = stockItem.stock;

    const usedInCart = cartItems
      .filter(item => item.id !== excludeCartItemId)
      .reduce((sum, item) => {

        if (category === 'noodleFlavors') {
          if (
            item.category === 'mama' &&
            item.flavor?.id === itemId
          ) {
            return sum + (item.quantity ?? 1);
          }
        }

        if (category === 'toppings') {
          const found = item.toppings?.find(t => t.id === itemId);
          if (found) {
            return sum + (found.qty ?? 1);
          }
        }

        return sum;
      }, 0);

    return Math.max(totalStock - usedInCart, 0);
  },
  [stockData]
);


  /* =========================
     Basic APIs
  ========================= */

  const getAvailableItems = useCallback(
    (category: StockCategory) =>
      stockData[category].filter(i => i.enabled && i.stock > 0),
    [stockData]
  );

  const getMenuItems = useCallback(
    (category: StockCategory) =>
      stockData[category].filter(i => i.enabled),
    [stockData]
  );

  const getAllItems = useCallback(
    (category: StockCategory) => stockData[category],
    [stockData]
  );

  const updateItem = useCallback(
    (category: StockCategory, id: string, updates: Partial<StockItem>) => {
      setStockData(prev => {
        const next = {
          ...prev,
          [category]: prev[category].map(i =>
            i.id === id ? { ...i, ...updates } : i
          ),
        };

        localStorage.setItem(STOCK_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  /* =========================
     Deduct Stock (Checkout)
  ========================= */

  const deductStock = useCallback(
    (cartItems: CartItem[]) => {
      setStockData(prev => {
        const next: StockData = {
          noodleFlavors: prev.noodleFlavors.map(i => ({ ...i })),
          toppings: prev.toppings.map(i => ({ ...i })),
          soupTypes: prev.soupTypes.map(i => ({ ...i })),
          dippingSauces: prev.dippingSauces.map(i => ({ ...i })),
          odenAddOns: prev.odenAddOns.map(i => ({ ...i })),
        };

        const deduct = (
          category: StockCategory,
          id: string,
          qty: number
        ) => {
          const item = next[category].find(i => i.id === id);
          if (item) {
            item.stock = Math.max(0, item.stock - qty);
          }
        };

        for (const item of cartItems) {
          const orderQty = item.qty ?? 1;

          /* ----- MAMA ----- */
if (item.category === 'mama') {

  const noodleQty = item.quantity ?? 1; // 🔥 ใช้ quantity

  if (item.flavor) {
    deduct('noodleFlavors', item.flavor.id, noodleQty);
  }

  item.toppings?.forEach(t =>
    deduct('toppings', t.id, t.qty ?? 1)
  );
}


          /* ----- ODEN ----- */
          if (item.category === 'oden') {
            item.toppings?.forEach(t =>
              deduct('toppings', t.id, t.qty ?? 1)
            );

            if (item.soupType) {
              deduct('soupTypes', item.soupType.id, orderQty);
            }

            if (item.dippingSauce) {
              deduct('dippingSauces', item.dippingSauce.id, orderQty);
            }

            item.addOns?.forEach(a =>
              deduct('odenAddOns', a.id, orderQty)
            );
          }
        }

        localStorage.setItem(STOCK_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  /* =========================
     Low Stock
  ========================= */

  const lowStockItems = useMemo(() => {
    const result: { category: StockCategory; item: StockItem }[] = [];

    (Object.keys(stockData) as StockCategory[]).forEach(cat => {
      stockData[cat].forEach(item => {
        if (item.enabled && item.stock <= item.minStock) {
          result.push({ category: cat, item });
        }
      });
    });

    return result;
  }, [stockData]);

  return (
    <StockContext.Provider
      value={{
        getAvailableItems,
        getMenuItems,
        getAllItems,
        updateItem,
        deductStock,
        getRemainingStock,
        config,
        lowStockItems,
      }}
    >
      {children}
    </StockContext.Provider>
  );
}

export function useStock() {
  const ctx = useContext(StockContext);
  if (!ctx) {
    throw new Error('useStock must be used within StockProvider');
  }
  return ctx;
}
