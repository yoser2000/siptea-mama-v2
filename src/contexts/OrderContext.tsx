import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';

export type OrderStatus =
  | 'กำลังเตรียม'
  | 'กำลังทำ'
  | 'เสร็จแล้ว'
  | 'จ่ายเงินแล้ว';

/* =========================
   Types
========================= */
export interface CartItemOption {
  id: string;
  name: string;
  price: number;
  qty?: number; // ✅ เพิ่มจำนวนต่อ option (ไข่ x2, หมู x3)
}

export interface CartItem {
  id: string;
  category: 'mama' | 'oden';
  qty: number; // ⭐⭐⭐ เพิ่มบรรทัดนี้
  flavor?: CartItemOption;
  toppings: CartItemOption[];
  soupType?: CartItemOption;
  dippingSauce?: CartItemOption;
  spicyLevel?: string;
  extraNoodle?: boolean;
  quantity?: number; // จำนวนห่อ (มาม่า)
  addOns?: CartItemOption[];
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  tableNumber?: string;
  note?: string;
  items: CartItem[];
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  queueNumber: number;
}

interface OrderContextType {
  customerName: string;
  tableNumber: string;
  note: string;
  setCustomerInfo: (name: string, table: string, note: string) => void;

  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  updateCartItem: (id: string, item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;

  cartTotal: number;
  submitOrder: () => string;

  orders: Order[];
  getOrder: (id: string) => Order | undefined;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  activeOrders: Order[];
  todayOrders: Order[];
}

const OrderContext = createContext<OrderContextType | null>(null);

/* =========================
   Utils
========================= */
const generateId = () =>
  Math.random().toString(36).substr(2, 8).toUpperCase();

const ORDERS_KEY = 'restaurant-orders';
const QUEUE_KEY = 'restaurant-queue';

function getStoredOrders(): Order[] {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveOrders(orders: Order[]) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function getNextQueueNumber(): number {
  const today = new Date().toDateString();
  try {
    const stored = JSON.parse(localStorage.getItem(QUEUE_KEY) || '{}');
    if (stored.date !== today) {
      const data = { date: today, counter: 1 };
      localStorage.setItem(QUEUE_KEY, JSON.stringify(data));
      return 1;
    }
    stored.counter += 1;
    localStorage.setItem(QUEUE_KEY, JSON.stringify(stored));
    return stored.counter;
  } catch {
    const data = { date: today, counter: 1 };
    localStorage.setItem(QUEUE_KEY, JSON.stringify(data));
    return 1;
  }
}

/* =========================
   Provider
========================= */
export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [note, setNote] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(getStoredOrders);
  useEffect(() => {
  const saved = localStorage.getItem('orders');
  if (saved) {
    setOrders(JSON.parse(saved));
  }
}, []);
useEffect(() => {
  localStorage.setItem(
    'orders',
    JSON.stringify(orders)
  );
}, [orders]);
  const channelRef = useRef<BroadcastChannel | null>(null);

  /* ---------- Broadcast sync ---------- */
  useEffect(() => {
    try {
      const channel = new BroadcastChannel('restaurant-orders');
      channelRef.current = channel;
      channel.onmessage = event => {
        if (event.data.type === 'orders-updated') {
          setOrders(event.data.orders);
        }
      };
      return () => channel.close();
    } catch {}
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const stored = getStoredOrders();
      setOrders(prev =>
        JSON.stringify(prev) !== JSON.stringify(stored) ? stored : prev
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const broadcastOrders = useCallback((newOrders: Order[]) => {
    saveOrders(newOrders);
    try {
      channelRef.current?.postMessage({
        type: 'orders-updated',
        orders: newOrders,
      });
    } catch {}
  }, []);

  /* ---------- Customer ---------- */
  const setCustomerInfo = useCallback(
    (name: string, table: string, n: string) => {
      setCustomerName(name);
      setTableNumber(table);
      setNote(n);
    },
    []
  );

  /* ---------- Cart ---------- */
  const addToCart = useCallback((item: Omit<CartItem, 'id'>) => {
    setCart(prev => [
      ...prev,
      {
        id: generateId(),
        quantity: item.quantity ?? 1,
        ...item,
      },
    ]);
  }, []);

  const updateCartItem = useCallback(
    (id: string, item: Omit<CartItem, 'id'>) => {
      setCart(prev =>
        prev.map(c => (c.id === id ? { ...item, id } : c))
      );
    },
    []
  );

  const removeFromCart = useCallback((id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  /* ---------- Order ---------- */
  const submitOrder = useCallback(() => {
    const orderId = generateId();
    const queueNumber = getNextQueueNumber();

    const order: Order = {
      id: orderId,
      customerName,
      tableNumber: tableNumber || undefined,
      note: note || undefined,
      items: [...cart],
      totalPrice: cartTotal,
      status: 'กำลังเตรียม',
      createdAt: new Date().toISOString(),
      queueNumber,
    };

    const newOrders = [...orders, order];
    setOrders(newOrders);
    broadcastOrders(newOrders);
    setCart([]);
    return orderId;
  }, [
    customerName,
    tableNumber,
    note,
    cart,
    cartTotal,
    orders,
    broadcastOrders,
  ]);

  const getOrder = useCallback(
    (id: string) => orders.find(o => o.id === id),
    [orders]
  );

  const updateOrderStatus = useCallback(
    (orderId: string, status: OrderStatus) => {
      setOrders(prev => {
        const newOrders = prev.map(o =>
          o.id === orderId ? { ...o, status } : o
        );
        broadcastOrders(newOrders);
        return newOrders;
      });
    },
    [broadcastOrders]
  );

  const activeOrders = orders.filter(
  o => o.status !== 'จ่ายเงินแล้ว'
);


  const todayOrders = orders.filter(o => {
    const orderDate = new Date(o.createdAt).toDateString();
    return orderDate === new Date().toDateString();
  });

  return (
    <OrderContext.Provider
      value={{
        customerName,
        tableNumber,
        note,
        setCustomerInfo,
        cart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        cartTotal,
        submitOrder,
        orders,
        getOrder,
        updateOrderStatus,
        activeOrders,
        todayOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (!context)
    throw new Error('useOrder must be used within OrderProvider');
  return context;
}
