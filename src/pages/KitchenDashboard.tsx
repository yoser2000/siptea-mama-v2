import { useOrder, OrderStatus, Order } from '@/contexts/OrderContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Clock, ChefHat, CheckCircle2, UtensilsCrossed } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* =========================
   Status Flow
========================= */

const statusFlow: OrderStatus[] = [
  'กำลังเตรียม',
  'กำลังทำ',
  'เสร็จแล้ว',
  'จ่ายเงินแล้ว',
];

const getNextStatus = (current: OrderStatus): OrderStatus | null => {
  const idx = statusFlow.indexOf(current);
  return idx < statusFlow.length - 1 ? statusFlow[idx + 1] : null;
};

const statusColors: Record<OrderStatus, string> = {
  'กำลังเตรียม': 'border-warning bg-warning/10',
  'กำลังทำ': 'border-primary bg-primary/10',
  'เสร็จแล้ว': 'border-yellow-500 bg-yellow-500/10',
  'จ่ายเงินแล้ว': 'border-success bg-success/10',
};

const statusButtonLabels: Record<OrderStatus, string> = {
  'กำลังเตรียม': '🔥 เริ่มทำ',
  'กำลังทำ': '✅ เสร็จแล้ว',
  'เสร็จแล้ว': '💰 รับเงินแล้ว',
  'จ่ายเงินแล้ว': '',
};

/* =========================
   Order Card
========================= */

const OrderCard = ({
  order,
  onUpdateStatus,
}: {
  order: Order;
  onUpdateStatus: (id: string, status: OrderStatus) => void;
}) => {
  const nextStatus = getNextStatus(order.status);
  const timeSince = getTimeSince(order.createdAt);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        'rounded-2xl border-2 p-5 space-y-3',
        statusColors[order.status]
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">
              คิว {order.queueNumber}
            </span>
            <span className="text-xs bg-card/50 px-2 py-0.5 rounded-full font-mono">
              {order.id}
            </span>
          </div>

          <p className="text-sm text-muted-foreground mt-0.5">
            {order.customerName}
            {order.tableNumber && ` · โต๊ะ ${order.tableNumber}`}
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-muted-foreground">
            {timeSince}
          </span>

          {/* รวมทั้งบิล */}
          <div className="text-lg font-bold text-white mt-1">
            ฿{order.totalPrice}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {order.items.map((item, i) => (
          <div
            key={i}
            className="bg-card/40 rounded-xl p-3 space-y-1"
          >
            {/* ชื่อ + จำนวน + ราคาต่อถ้วย */}
            <div className="flex justify-between font-semibold">
              <span>
                {item.category === 'mama'
                  ? `🍜 ${item.flavor?.name}`
                  : '🍢 โอเด้ง'}{' '}
                ×{' '}
                {item.category === 'mama'
                  ? item.quantity ?? 1
                  : item.qty ?? 1}
              </span>

              <span className="text-white font-bold">
                ฿{item.price}
              </span>
            </div>

            {/* รายละเอียด */}
            <div className="text-sm text-muted-foreground space-y-0.5">
              {item.toppings?.length > 0 && (
                <p>
                  ท็อปปิ้ง:{' '}
                  {item.toppings.map((t, idx) => (
                    <span key={t.id}>
                      {t.name}
                      {t.qty && t.qty > 1 ? ` x${t.qty}` : ''}
                      {idx < item.toppings.length - 1 && ', '}
                    </span>
                  ))}
                </p>
              )}

              {item.soupType && (
                <p>น้ำซุป: {item.soupType.name}</p>
              )}

              {item.dippingSauce && (
                <p>น้ำจิ้ม: {item.dippingSauce.name}</p>
              )}

              {item.spicyLevel && (
                <p>ความเผ็ด: {item.spicyLevel}</p>
              )}

              {item.extraNoodle && <p>เพิ่มเส้น</p>}

              {item.addOns && item.addOns.length > 0 && (
                <p>
                  เพิ่มเติม:{' '}
                  {item.addOns.map(a => a.name).join(', ')}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Note */}
      {order.note && (
        <div className="bg-destructive/10 text-destructive rounded-xl p-3 text-sm font-medium">
          📝 {order.note}
        </div>
      )}

      {/* Action */}
      {nextStatus && (
        <Button
          onClick={() =>
            onUpdateStatus(order.id, nextStatus)
          }
          size="lg"
          className="w-full h-14 text-lg font-bold"
        >
          {statusButtonLabels[order.status]}
        </Button>
      )}
    </motion.div>
  );
};

/* =========================
   Time Helper
========================= */

function getTimeSince(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'เมื่อกี้';
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;

  const diffHr = Math.floor(diffMin / 60);
  return `${diffHr} ชม.ที่แล้ว`;
}

/* =========================
   Dashboard
========================= */

const KitchenDashboard = () => {
  const { todayOrders, updateOrderStatus } = useOrder();

  const preparing = todayOrders.filter(
    o => o.status === 'กำลังเตรียม'
  );

  const cooking = todayOrders.filter(
    o => o.status === 'กำลังทำ'
  );

  const waitingPayment = todayOrders.filter(
    o => o.status === 'เสร็จแล้ว'
  );

  const paid = todayOrders.filter(
    o => o.status === 'จ่ายเงินแล้ว'
  );

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UtensilsCrossed className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">ครัว</h1>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <span>⏳ {preparing.length} รอ</span>
            <span>👨‍🍳 {cooking.length} กำลังทำ</span>
            <span>💰 {waitingPayment.length} รอรับเงิน</span>
            <span>✅ {paid.length} เสร็จ</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* กำลังทำ */}
        {cooking.length > 0 && (
          <Section
            title="กำลังทำ"
            orders={cooking}
            updateOrderStatus={updateOrderStatus}
          />
        )}

        {/* รอคิว */}
        {preparing.length > 0 && (
          <Section
            title="รอคิว"
            orders={preparing}
            updateOrderStatus={updateOrderStatus}
          />
        )}

        {/* รอรับเงิน */}
        {waitingPayment.length > 0 && (
          <Section
            title="💰 รอรับเงิน"
            orders={waitingPayment}
            updateOrderStatus={updateOrderStatus}
          />
        )}

        {/* เสร็จแล้ววันนี้ */}
        {paid.length > 0 && (
          <Section
            title="✅ เสร็จแล้ววันนี้"
            orders={paid}
            updateOrderStatus={updateOrderStatus}
          />
        )}
      </div>
    </div>
  );
};

/* =========================
   Reusable Section
========================= */

const Section = ({
  title,
  orders,
  updateOrderStatus,
}: {
  title: string;
  orders: Order[];
  updateOrderStatus: (id: string, status: OrderStatus) => void;
}) => (
  <div>
    <h2 className="text-sm font-semibold mb-3">
      {title} ({orders.length})
    </h2>

    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence>
        {orders.map(order => (
          <OrderCard
            key={order.id}
            order={order}
            onUpdateStatus={updateOrderStatus}
          />
        ))}
      </AnimatePresence>
    </div>
  </div>
);

export default KitchenDashboard;
