import { useParams, useNavigate } from 'react-router-dom';
import { useOrder, OrderStatus as Status } from '@/contexts/OrderContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Clock, ChefHat, CheckCircle2 } from 'lucide-react';

const statusConfig: Record<Status, {
  icon: React.ReactNode;
  color: string;
  label: string;
}> = {

  'กำลังเตรียม': {
    icon: <Clock className="w-8 h-8" />,
    color: 'text-warning',
    label: 'รอคิว',
  },
  'กำลังทำ': {
    icon: <ChefHat className="w-8 h-8" />,
    color: 'text-primary',
    label: 'กำลังทำอาหาร',
  },
  'เสร็จแล้ว': {
    icon: <CheckCircle2 className="w-8 h-8" />,
    color: 'text-success',
    label: 'พร้อมเสิร์ฟ!',
  },
  'จ่ายเงินแล้ว': {
  icon: <CheckCircle2 className="w-8 h-8" />,
  color: 'text-muted-foreground',
  label: 'ชำระเงินเรียบร้อย',
},

};

const statuses: Status[] = [
  'กำลังเตรียม',
  'กำลังทำ',
  'เสร็จแล้ว',
  'จ่ายเงินแล้ว'
];


const OrderStatusPage = () => {
  const { id } = useParams();
  const { getOrder, activeOrders } = useOrder();
  const navigate = useNavigate();
  const order = getOrder(id || '');

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <h1 className="text-xl font-bold mb-2">ไม่พบคำสั่งซื้อ</h1>
          <p className="text-muted-foreground mb-4">Order ID: {id}</p>
          <Button onClick={() => navigate('/')}>กลับหน้าแรก</Button>
        </div>
      </div>
    );
  }

  const config = statusConfig[order.status];
  const currentStatusIndex = statuses.indexOf(order.status);
  const currentlyMaking = activeOrders.filter(o => o.status === 'กำลังทำ');

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto space-y-6"
      >
        {/* Status Header */}
        <div className="text-center pt-8">
          <motion.div
            key={order.status}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn("inline-flex items-center justify-center w-20 h-20 rounded-full mb-4",
              order.status === 'เสร็จแล้ว' ? "bg-success/10" : "bg-primary/10"
            )}
          >
            <span className={config.color}>{config.icon}</span>
          </motion.div>
          <h1 className="text-2xl font-bold">{config.label}</h1>
          <p className="text-muted-foreground mt-1">คิวที่ {order.queueNumber}</p>
        </div>

        {/* Status Steps */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="space-y-4">
            {statuses.map((status, i) => {
              const isActive = i <= currentStatusIndex;
              const isCurrent = i === currentStatusIndex;
              return (
                <div key={status} className="flex items-center gap-4">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {i + 1}
                  </div>
                  <span className={cn(
                    "font-medium transition-colors",
                    isCurrent ? "text-foreground" : isActive ? "text-muted-foreground" : "text-muted-foreground/50"
                  )}>
                    {status}
                  </span>
                  {isCurrent && order.status !== 'เสร็จแล้ว' && (
                    <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-1 rounded-full animate-pulse-soft">
                      ตอนนี้
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Currently Making */}
        {currentlyMaking.length > 0 && order.status !== 'เสร็จแล้ว' && (
          <div className="bg-card rounded-2xl border border-border p-5">
            <h3 className="font-semibold mb-2 text-sm text-muted-foreground">คิวที่กำลังทำ</h3>
            <div className="flex flex-wrap gap-2">
              {currentlyMaking.map(o => (
                <span key={o.id} className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium",
                  o.id === order.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  คิว {o.queueNumber}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Order Details */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <h3 className="font-semibold mb-3">รายละเอียดคำสั่งซื้อ</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order ID</span>
              <span className="font-mono font-medium">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ชื่อ</span>
              <span className="font-medium">{order.customerName}</span>
            </div>
            {order.tableNumber && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">โต๊ะ</span>
                <span className="font-medium">{order.tableNumber}</span>
              </div>
            )}
            <div className="border-t border-border my-2 pt-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between py-1">
                  <span>
                    {item.category === 'mama' ? '🍜' : '🍢'}{' '}
                    {item.category === 'mama' ? `มาม่า ${item.flavor?.name || ''}` : 'โอเด้ง'}
                  </span>
                  <span className="font-medium">฿{item.price}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold text-base border-t border-border pt-2">
              <span>รวม</span>
              <span className="text-primary">฿{order.totalPrice}</span>
            </div>
          </div>
        </div>

        {/* New Order Button */}
        <Button variant="outline" onClick={() => navigate('/')} className="w-full h-12">
          สั่งอาหารเพิ่ม
        </Button>
      </motion.div>
    </div>
  );
};

export default OrderStatusPage;