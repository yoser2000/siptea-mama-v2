import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrder } from '@/contexts/OrderContext';
import type { CartItem } from '@/contexts/OrderContext';
import { useStock, StockItem } from '@/contexts/StockContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import StepIndicator from '@/components/StepIndicator';
import CartFloatingButton from '@/components/CartFloatingButton';

const TOTAL_STEPS = 3;

type ToppingWithQty = {
  item: StockItem;
  qty: number;
};

const MamaCustomize = () => {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditing = !!editId;

  const [step, setStep] = useState(1);
  const [selectedFlavor, setSelectedFlavor] = useState<StockItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedToppings, setSelectedToppings] = useState<ToppingWithQty[]>([]);

  const navigate = useNavigate();
  const { addToCart, updateCartItem, cart } = useOrder();
  const { getMenuItems, config, getRemainingStock } = useStock();
  const loadedRef = useRef(false);

  const flavors = getMenuItems('noodleFlavors');
  const toppings = getMenuItems('toppings');

  /* =========================
     Load edit data
  ========================= */
  useEffect(() => {
    if (editId && !loadedRef.current) {
      const existing = cart.find(i => i.id === editId);
      if (existing && existing.category === 'mama') {
        loadedRef.current = true;

        if (existing.flavor) {
          const f = flavors.find(fl => fl.id === existing.flavor!.id);
          if (f) setSelectedFlavor(f);
        }

        if (existing.qty) {
          setQuantity(existing.qty);
        }

        if (existing.toppings) {
          setSelectedToppings(
            existing.toppings.map(t => ({
              item: toppings.find(tp => tp.id === t.id)!,
              qty: (t as any).qty ?? 1,
            }))
          );
        }
      }
    }
  }, [editId, cart, flavors, toppings]);

  /* =========================
     Price
  ========================= */
  const totalPrice = useMemo(() => {
    let price = config.mamaBasePrice * quantity;

    if (selectedFlavor) {
      price += selectedFlavor.price * quantity;
    }

    price += selectedToppings.reduce(
  (sum, t) => sum + t.item.price * t.qty,
  0
);



    return price;
  }, [selectedFlavor, selectedToppings, quantity, config]);

  /* =========================
     Topping handlers (limit by stock)
  ========================= */
  const increaseTopping = (topping: StockItem) => {
  const remainingStock = getRemainingStock(
    'toppings',
    topping.id,
    cart,
    editId ?? undefined
  );

  setSelectedToppings(prev => {
    const found = prev.find(t => t.item.id === topping.id);
    const currentQty = found?.qty ?? 0;

    // ❗ ต้องเช็ค currentQty + 1 ว่ายังไม่เกิน remainingStock
    if (currentQty + 1 > remainingStock) return prev;

    if (found) {
      return prev.map(t =>
        t.item.id === topping.id
          ? { ...t, qty: t.qty + 1 }
          : t
      );
    }

    return [...prev, { item: topping, qty: 1 }];
  });
};



  const decreaseTopping = (topping: StockItem) => {
    setSelectedToppings(prev =>
      prev
        .map(t =>
          t.item.id === topping.id ? { ...t, qty: t.qty - 1 } : t
        )
        .filter(t => t.qty > 0)
    );
  };

  /* =========================
     Add to cart (check stock)
  ========================= */
  const handleAddToCart = () => {
    if (!selectedFlavor) return;

const remainingFlavorStock = getRemainingStock(
  'noodleFlavors',
  selectedFlavor.id,
  cart,
  editId ?? undefined
);

if (quantity > remainingFlavorStock) {
  alert(`มาม่าเหลือแค่ ${remainingFlavorStock} ห่อ`);
  return;
}



    // รวมของใน cart ที่ใช้ท็อปปิ้งเดียวกันอยู่แล้ว
const usedQtyInCart = (toppingId: string) => {
  return cart
    .filter(c => c.category === 'mama')
    .flatMap(c => c.toppings)
    .filter(t => t.id === toppingId)
    .reduce((sum, t) => sum + (t.qty ?? 1), 0);
};

for (const t of selectedToppings) {
  const totalStock = t.item.stock;

  if (t.qty > totalStock) {
    alert(`ท็อปปิ้ง ${t.item.name} สต็อกไม่พอ`);
    return;
  }
}




    const itemData: Omit<CartItem, 'id'> = {
  category: 'mama',
  qty: 1,
  quantity: quantity,
  flavor: selectedFlavor,
  toppings: selectedToppings.map(t => ({
    id: t.item.id,
    name: t.item.name,
    price: t.item.price,
    qty: t.qty,
  })),
  price: totalPrice,
};




    if (isEditing && editId) {
      updateCartItem(editId, itemData);
      navigate('/cart');
    } else {
      addToCart(itemData);
      navigate('/menu');
    }
  };

  const canProceed = step === 1 ? !!selectedFlavor : true;

  /* =========================
     UI
  ========================= */

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">

      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b px-4 py-3">
  <div className="flex items-center gap-3 mb-3">
    <button
      onClick={() => navigate('/menu')}
      className="p-2 -ml-2 rounded-full hover:bg-accent"
    >
      <ArrowLeft className="w-5 h-5" />
    </button>

    <h1 className="text-xl font-bold">🍜 มาม่า</h1>

    <span className="ml-auto text-lg font-bold text-primary">
      ฿{totalPrice}
    </span>
  </div>

  <StepIndicator current={step} total={TOTAL_STEPS} />
</div>


      {/* Content */}
      <div className="flex-1 p-6">
        <AnimatePresence mode="wait">

          {/* STEP 1 */}
          {step === 1 && (
            <motion.div key="step1" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
              <h2 className="text-lg font-bold mb-4">เลือกรสชาติ</h2>

              <div className="grid grid-cols-2 gap-3">
                {flavors.map(flavor => {
                  const remainingFlavorStock = getRemainingStock(
  'noodleFlavors',
  flavor.id,
  cart,
  editId ?? undefined
);

const isOut = remainingFlavorStock <= 0 || !flavor.enabled;


                  return (
                    <button
                      key={flavor.id}
                      disabled={isOut}
                      onClick={() => !isOut && setSelectedFlavor(flavor)}
                      className={cn(
                        'p-4 rounded-xl border-2 flex flex-col text-left',
                        selectedFlavor?.id === flavor.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-card',
                        isOut && 'opacity-40 cursor-not-allowed'
                      )}
                    >
                      <div className="font-semibold">{flavor.name}</div>

                      {isOut ? (
                        <div className="text-xs text-destructive mt-1">
                          สินค้าหมด
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground mt-1">
                          +฿{flavor.price}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 2 */}
{step === 2 && (
  <motion.div
    key="step2"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <h2 className="text-lg font-bold mb-4">เลือกท็อปปิ้ง</h2>

    <div className="grid grid-cols-2 gap-3">
      {toppings?.map(topping => {
  if (!topping) return null;

  const selected = selectedToppings.find(
    t => t.item.id === topping.id
  );

  const remainingStock = getRemainingStock(
    'toppings',
    topping.id,
    cart ?? [],
    editId ?? undefined
  );

  const isOut = remainingStock <= 0;


        return (
          <div
            key={topping.id}
            className={cn(
              'p-4 rounded-xl border-2 flex gap-3 items-start transition-all',
              selected
                ? 'border-primary bg-primary/10'
                : 'border-border bg-card',
              isOut && 'opacity-50'
            )}
          >
            {/* รูป */}
            <img
              src={topping.image ?? '/images/placeholder.png'}
              alt={topping.name}
              className="w-14 h-14 rounded-lg object-cover"
            />

            {/* ข้อมูล */}
            <div className="flex-1">
              <div className="font-semibold">{topping.name}</div>

              {isOut ? (
                <div className="text-xs text-destructive mt-1">
                  สินค้าหมด
                </div>
              ) : (
                <div className="text-sm text-muted-foreground mt-1">
                  +฿{topping.price}
                </div>
              )}

              {!isOut && (
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => decreaseTopping(topping)}
                    className="w-8 h-8 rounded-full border"
                  >
                    −
                  </button>

                  <span>{selected?.qty ?? 0}</span>

                  <button
                    onClick={() => increaseTopping(topping)}
                    className="w-8 h-8 rounded-full border"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  </motion.div>
)}


          {/* STEP 3 */}
          {step === 3 && (
            <motion.div key="step3" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
              <h2 className="text-lg font-bold mb-4">สรุปรายการ</h2>

              <div className="bg-card border rounded-2xl p-5 space-y-3">
                {selectedFlavor && (
  <div className="flex justify-between">
    <span>
      {selectedFlavor.name} × {quantity}
    </span>
    <span>
      ฿{(config.mamaBasePrice + selectedFlavor.price) * quantity}
    </span>
  </div>
)}


                {selectedToppings.map(t => (
                  <div key={t.item.id} className="flex justify-between text-sm">
                    <span>{t.item.name} × {t.qty}</span>
                    <span>+฿{t.item.price * t.qty}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleAddToCart}
                size="lg"
                className="w-full mt-6"
              >
                เพิ่มลงตะกร้า 🛒
              </Button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      {step < TOTAL_STEPS && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 flex gap-3">
          {step === 1 && selectedFlavor && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-10 h-10 border rounded-full"
              >
                −
              </button>

              <span className="font-bold">{quantity}</span>

              <button
  onClick={() => {
    if (!selectedFlavor) return;

    const remainingFlavorStock = getRemainingStock(
      'noodleFlavors',
      selectedFlavor.id,
      cart ?? [],
      editId ?? undefined
    );

    setQuantity(prev =>
      prev + 1 > remainingFlavorStock ? prev : prev + 1
    );
  }}

  className="w-10 h-10 border rounded-full"
>
  +
</button>

            </div>
          )}

          <Button
            className="flex-1"
            onClick={() => setStep(s => s + 1)}
            disabled={!canProceed}
          >
            {step === 2 ? 'ดูสรุป' : 'ถัดไป'}
          </Button>
        </div>
      )}

      <CartFloatingButton />
    </div>
  );
};

export default MamaCustomize;
