import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useOrder } from '@/contexts/OrderContext';
import { motion, AnimatePresence } from 'framer-motion';

const CartFloatingButton = () => {
  const { cart, cartTotal } = useOrder();
  const navigate = useNavigate();
  const location = useLocation();

  // ไม่มีของในตะกร้า → ไม่ต้องโชว์
  if (cart.length === 0) return null;

  const pathname = location.pathname;

  // ✅ หน้า menu → popup bar
  const isMenuPage = pathname === '/menu';

  // ❌ หน้าไม่ต้องโชว์ตะกร้าเลย
  const hiddenPages = ['/cart', '/summary', '/checkout'];
  const shouldHide = hiddenPages.some(p => pathname.startsWith(p));

  if (shouldHide) return null;

  return (
    <AnimatePresence>
      {isMenuPage ? (
        /* ================= POPUP BAR (หน้า /menu) ================= */
        <motion.button
          key="menu-bar"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          onClick={() => navigate('/cart')}
          className="
            fixed bottom-4 left-4 right-4
            bg-primary text-primary-foreground
            rounded-2xl px-6 py-4
            shadow-2xl
            flex items-center justify-between
            z-50
          "
        >
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5" />
            <span className="font-bold">{cart.length} รายการ</span>
          </div>
          <span className="font-bold text-lg">฿{cartTotal}</span>
        </motion.button>
      ) : (
        /* ================= FLOATING CIRCLE (หน้าอื่น) ================= */
        <motion.button
          key="floating-circle"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          onClick={() => navigate('/cart')}
          className="
            fixed bottom-[88px] right-6
            w-14 h-14
            bg-primary text-primary-foreground
            rounded-full
            shadow-xl
            flex items-center justify-center
            z-50
          "
        >
          <ShoppingCart className="w-6 h-6" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default CartFloatingButton;
