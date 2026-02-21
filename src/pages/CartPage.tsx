import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrder, CartItem } from '@/contexts/OrderContext';
import { useStock } from '@/contexts/StockContext';
import { motion, AnimatePresence } from 'framer-motion';

const getItemName = (item: CartItem) => {
  const bowlQty = item.qty ?? 1;
  const packQty = item.quantity ?? 1;

  if (item.category === 'mama') {
  return `🍜 ${item.flavor?.name || ''} ${packQty} ห่อ`;
}

  return `🍢 โอเด้ง x${bowlQty}`;
};


const getItemDetails = (item: CartItem): string[] => {
  const details: string[] = [];

  if (item.toppings.length > 0) {
  details.push(
  `ท็อปปิ้ง: ${item.toppings
    .map(t => `${t.name} x${t.qty}`)
    .join(', ')}`
);
}



  if (item.soupType)
    details.push(`น้ำซุป: ${item.soupType.name}`);

  if (item.dippingSauce)
    details.push(`น้ำจิ้ม: ${item.dippingSauce.name}`);

  if (item.spicyLevel)
    details.push(`ความเผ็ด: ${item.spicyLevel}`);

  if (item.extraNoodle)
    details.push('เพิ่มเส้น');

  if (item.addOns && item.addOns.length > 0) {
    details.push(
      `เพิ่มเติม: ${item.addOns.map(a => a.name).join(', ')}`
    );
  }

  return details;
};


const CartPage = () => {
  const { cart, removeFromCart, clearCart, cartTotal, customerName, submitOrder } = useOrder();
  const { deductStock } = useStock();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    deductStock(cart);
    const orderId = await submitOrder()
navigate(`/order/${orderId}`)
  };

  const handleEdit = (item: CartItem) => {
    navigate(`/menu/${item.category}?edit=${item.id}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/menu')} className="p-2 -ml-2 rounded-full hover:bg-accent transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">ตะกร้า</h1>
        {cart.length > 0 && (
          <button onClick={clearCart} className="ml-auto text-sm text-destructive hover:underline">
            ล้างทั้งหมด
          </button>
        )}
      </div>

      {/* Cart Items */}
      <div className="flex-1 p-6">
        {cart.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🛒</div>
            <p className="text-muted-foreground text-lg">ตะกร้าว่างเปล่า</p>
            <Button variant="outline" onClick={() => navigate('/menu')} className="mt-4">
              กลับไปเลือกเมนู
            </Button>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-4">
              {cart.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="bg-card rounded-xl border border-border p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-base">{getItemName(item)}</h3>
                      <div className="mt-2 space-y-1">
                        {getItemDetails(item).map((detail, i) => (
                          <p key={i} className="text-sm text-muted-foreground">{detail}</p>
                        ))}
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <span className="font-bold text-primary text-lg">฿{item.price}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Checkout */}
      {cart.length > 0 && (
        <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border p-4 space-y-3">
          <div className="flex justify-between items-center px-2">
            <div>
              <p className="text-sm text-muted-foreground">ลูกค้า: {customerName}</p>
              <p className="text-sm text-muted-foreground">{cart.length} รายการ</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">ยอดรวม</p>
              <p className="text-2xl font-bold text-primary">฿{cartTotal}</p>
            </div>
          </div>
          <Button onClick={handleCheckout} size="lg" className="w-full h-14 text-lg font-bold">
            ✅ ยืนยันสั่งอาหาร
          </Button>
        </div>
      )}
    </div>
  );
};

export default CartPage;
