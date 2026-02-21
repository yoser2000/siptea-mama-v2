import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import { supabase } from '@/lib/supabase'

/* =========================
   Types
========================= */

export type OrderStatus =
  | 'กำลังเตรียม'
  | 'กำลังทำ'
  | 'เสร็จแล้ว'
  | 'จ่ายเงินแล้ว'

export interface CartItemOption {
  id: string
  name: string
  price: number
  qty?: number
}

export interface CartItem {
  id: string
  category: 'mama' | 'oden'
  qty: number
  flavor?: CartItemOption
  toppings: CartItemOption[]
  soupType?: CartItemOption
  dippingSauce?: CartItemOption
  spicyLevel?: string
  extraNoodle?: boolean
  quantity?: number
  addOns?: CartItemOption[]
  price: number
}

export interface Order {
  id: string
  customerName: string
  tableNumber?: string
  note?: string
  items: CartItem[]
  totalPrice: number
  status: OrderStatus
  createdAt: string
  queueNumber: number
}

interface OrderContextType {
  customerName: string
  tableNumber: string
  note: string
  setCustomerInfo: (name: string, table: string, note: string) => void

  cart: CartItem[]
  addToCart: (item: Omit<CartItem, 'id'>) => void
  updateCartItem: (id: string, item: Omit<CartItem, 'id'>) => void
  removeFromCart: (id: string) => void
  clearCart: () => void

  cartTotal: number
  submitOrder: () => Promise<string>

  orders: Order[]
  getOrder: (id: string) => Order | undefined
  updateOrderStatus: (orderId: string, status: OrderStatus) => void
  activeOrders: Order[]
  todayOrders: Order[]
}

const OrderContext = createContext<OrderContextType | null>(null)

/* =========================
   Utils
========================= */

const generateId = () =>
  Math.random().toString(36).substr(2, 8).toUpperCase()

/* =========================
   Provider
========================= */

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [customerName, setCustomerName] = useState('')
  const [tableNumber, setTableNumber] = useState('')
  const [note, setNote] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])

  /* =========================
     โหลดข้อมูลจาก Supabase
  ========================= */

  const fetchOrders = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  console.log("FETCH:", data, error)

    if (!error && data) {
      const formatted: Order[] = data.map((o: any) => ({
        id: o.order_id,
        customerName: '',
        tableNumber: '',
        note: '',
        items: o.items,
        totalPrice: o.total,
        status: o.status,
        createdAt: o.created_at,
        queueNumber: 0,
      }))

      setOrders(formatted)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  /* =========================
     Realtime
  ========================= */

  useEffect(() => {
    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchOrders()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  /* =========================
     Customer
  ========================= */

  const setCustomerInfo = useCallback(
    (name: string, table: string, n: string) => {
      setCustomerName(name)
      setTableNumber(table)
      setNote(n)
    },
    []
  )

  /* =========================
     Cart
  ========================= */

  const addToCart = useCallback((item: Omit<CartItem, 'id'>) => {
    setCart(prev => [
      ...prev,
      {
        id: generateId(),
        ...item,
      },
    ])
  }, [])

  const updateCartItem = useCallback(
    (id: string, item: Omit<CartItem, 'id'>) => {
      setCart(prev =>
        prev.map(c => (c.id === id ? { ...item, id } : c))
      )
    },
    []
  )

  const removeFromCart = useCallback((id: string) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0)

  /* =========================
     Submit Order
  ========================= */

  const submitOrder = useCallback(async () => {
    const orderId = generateId()

    const order: Order = {
      id: orderId,
      customerName,
      tableNumber: tableNumber || undefined,
      note: note || undefined,
      items: [...cart],
      totalPrice: cartTotal,
      status: 'กำลังเตรียม',
      createdAt: new Date().toISOString(),
      queueNumber: 0,
    }

    const { data, error } = await supabase
  .from('orders')
  .insert([
    {
      order_id: orderId,
      items: order.items,
      total: order.totalPrice,
      status: order.status,
      created_at: order.createdAt,
    },
  ])
  .select()

console.log('INSERT RESULT:', data, error)

    if (error) {
      console.error('Insert error:', error)
      return ''
    }

    setCart([])
    return orderId
  }, [customerName, tableNumber, note, cart, cartTotal])

  /* =========================
     Update Status
  ========================= */

  const updateOrderStatus = useCallback(
    async (orderId: string, status: OrderStatus) => {
      await supabase
        .from('orders')
        .update({ status })
        .eq('order_id', orderId)
    },
    []
  )

  const getOrder = useCallback(
    (id: string) => orders.find(o => o.id === id),
    [orders]
  )

  const activeOrders = orders.filter(
    o => o.status !== 'จ่ายเงินแล้ว'
  )

  const todayOrders = orders.filter(o => {
    const orderDate = new Date(o.createdAt).toDateString()
    return orderDate === new Date().toDateString()
  })

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
  )
}

export function useOrder() {
  const context = useContext(OrderContext)
  if (!context)
    throw new Error('useOrder must be used within OrderProvider')
  return context
}