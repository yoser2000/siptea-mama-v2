import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrder, CartItemOption } from '@/contexts/OrderContext';
import { useStock, StockItem } from '@/contexts/StockContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import StepIndicator from '@/components/StepIndicator';
import CartFloatingButton from '@/components/CartFloatingButton';

const TOTAL_STEPS = 4;

type ToppingWithQty = {
  item: StockItem;
  qty: number;
};

const toOption = (item: StockItem): CartItemOption => ({
  id: item.id,
  name: item.name,
  price: item.price,
});

const OdenCustomize = () => {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditing = !!editId;

  const [step, setStep] = useState(1);
  const [selectedToppings, setSelectedToppings] = useState<ToppingWithQty[]>([]);
  const [selectedSoup, setSelectedSoup] = useState<StockItem | null>(null);
  const [selectedSauce, setSelectedSauce] = useState<StockItem | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<StockItem[]>([]);
  const navigate = useNavigate();
  const { addToCart, updateCartItem, cart } = useOrder();
  const { getMenuItems, config, getRemainingStock } = useStock();
  const loadedRef = useRef(false);

  const odenToppings = getMenuItems('toppings');
  const soupTypes = getMenuItems('soupTypes');
  const dippingSauces = getMenuItems('dippingSauces');
  const odenAddOns = getMenuItems('odenAddOns');

  // Set defaults for soup and sauce
  useEffect(() => {
    if (!selectedSoup && soupTypes.length > 0 && !loadedRef.current) {
      const available = soupTypes.find(s => s.stock > 0);
      if (available) setSelectedSoup(available);
    }
    if (!selectedSauce && dippingSauces.length > 0 && !loadedRef.current) {
      const available = dippingSauces.find(s => s.stock > 0);
      if (available) setSelectedSauce(available);
    }
  }, [soupTypes, dippingSauces, selectedSoup, selectedSauce]);

  // Load existing item data when editing
  useEffect(() => {
    if (editId && !loadedRef.current) {
      const existing = cart.find(i => i.id === editId);
      if (existing && existing.category === 'oden') {
        loadedRef.current = true;
        setSelectedToppings(
  existing.toppings.map(t => {
    const item = odenToppings.find(tp => tp.id === t.id);
    return item
      ? { item, qty: (t as any).qty ?? 1 }
      : null;
  }).filter(Boolean) as ToppingWithQty[]
);

        if (existing.soupType) {
          const s = soupTypes.find(st => st.id === existing.soupType!.id);
          if (s) setSelectedSoup(s);
        }
        if (existing.dippingSauce) {
          const d = dippingSauces.find(ds => ds.id === existing.dippingSauce!.id);
          if (d) setSelectedSauce(d);
        }
        if (existing.addOns) {
          setSelectedAddOns(
            existing.addOns
              .map(a => odenAddOns.find(ao => ao.id === a.id))
              .filter(Boolean) as StockItem[]
          );
        }
      }
    }
  }, [editId, cart, odenToppings, soupTypes, dippingSauces, odenAddOns]);

  const totalPrice = useMemo(() => {
    let price = config.odenBasePrice;
    price += selectedToppings.reduce(
  (sum, t) => sum + t.item.price * t.qty,
  0
);
    price += selectedSoup?.price || 0;
    price += selectedSauce?.price || 0;
    price += selectedAddOns.reduce((sum, a) => sum + a.price, 0);
    return price;
  }, [selectedToppings, selectedSoup, selectedSauce, selectedAddOns, config]);

  const increaseTopping = (item: StockItem) => {
  const remainingStock = getRemainingStock(
    'toppings',
    item.id,
    cart,
    editId ?? undefined
  );

  setSelectedToppings(prev => {
    const found = prev.find(t => t.item.id === item.id);
    const currentQty = found?.qty ?? 0;

    if (currentQty >= remainingStock) return prev;

    if (found) {
      return prev.map(t =>
        t.item.id === item.id
          ? { ...t, qty: t.qty + 1 }
          : t
      );
    }

    return [...prev, { item, qty: 1 }];
  });
};




const decreaseTopping = (item: StockItem) => {
  setSelectedToppings(prev =>
    prev
      .map(t =>
        t.item.id === item.id ? { ...t, qty: t.qty - 1 } : t
      )
      .filter(t => t.qty > 0)
  );
};

const toggleAddOn = (item: StockItem) => {
  if (item.stock <= 0) return;

  setSelectedAddOns(prev =>
    prev.find(a => a.id === item.id)
      ? prev.filter(a => a.id !== item.id)
      : [...prev, item]
  );
};

  const handleAddToCart = () => {

  // 🔥 ตรวจ stock ไส้
  for (const t of selectedToppings) {
  const remainingStock = getRemainingStock(
    'toppings',
    t.item.id,
    cart,
    editId ?? undefined
  );

  if (t.qty > remainingStock) {
    alert(`ไส้ ${t.item.name} สต็อกไม่พอ`);
    return;
  }
}


  // 🔥 ตรวจน้ำซุป
  if (selectedSoup && selectedSoup.stock <= 0) {
    alert('น้ำซุปหมด');
    return;
  }

  // 🔥 ตรวจน้ำจิ้ม
  if (selectedSauce && selectedSauce.stock <= 0) {
    alert('น้ำจิ้มหมด');
    return;
  }

    if (selectedToppings.length === 0) return;
    const itemData = {
      category: 'oden' as const,
      qty: 1, // ✅ สำคัญมาก (แก้ error ทั้งหมด)

      toppings: selectedToppings.map(t => ({
  id: t.item.id,
  name: t.item.name,
  price: t.item.price,
  qty: t.qty,
})),
      soupType: selectedSoup ? toOption(selectedSoup) : undefined,
      dippingSauce: selectedSauce ? toOption(selectedSauce) : undefined,
      addOns: selectedAddOns.map(toOption),
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

  const canProceed = step === 1 ? selectedToppings.length > 0 : true;
  const backPath = isEditing ? '/cart' : '/menu';

  const slideVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-[160px]">

      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => step > 1 ? setStep(s => s - 1) : navigate(backPath)}
            className="p-2 -ml-2 rounded-full hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">🍢 โอเด้ง {isEditing && '(แก้ไข)'}</h1>
          <span className="ml-auto text-lg font-bold text-primary">฿{totalPrice}</span>
        </div>
        <StepIndicator current={step} total={TOTAL_STEPS} />
      </div>

      {/* Content */}
      <div className="flex-1 p-6">


        <AnimatePresence mode="wait">
          {step === 1 && (
  <motion.div
    key="s1"
    variants={slideVariants}
    initial="enter"
    animate="center"
    exit="exit"
    transition={{ duration: 0.2 }}
  >
    <h2 className="text-lg font-bold mb-1">เลือกไส้</h2>
    <p className="text-muted-foreground text-sm mb-4">
      เลือกอย่างน้อย 1 อย่าง
    </p>

    <div className="grid grid-cols-2 gap-3">
      {odenToppings.map(topping => {
        const selected = selectedToppings.find(
          t => t.item.id === topping.id
        );

        const remainingStock = getRemainingStock(
  'toppings',
  topping.id,
  cart,
  editId ?? undefined
);

const isOut = remainingStock <= 0;


        return (
          <div
            key={topping.id}
            className={cn(
              "p-4 rounded-xl border-2 transition-all",
              isOut
                ? "border-border bg-muted opacity-50"
                : selected
                ? "border-primary bg-primary/10"
                : "border-border bg-card"
            )}
          >
            <div className="flex gap-3 items-center">
              {topping.image && (
                <img
                  src={topping.image}
                  alt={topping.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              )}

              <div className="flex-1">
                <div className="font-semibold">
                  {topping.name}
                </div>

                {isOut ? (
                  <div className="text-xs text-destructive mt-1">
                    สินค้าหมด
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    ฿{topping.price}
                  </div>
                )}

                {!isOut && (
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => decreaseTopping(topping)}
                      className="w-8 h-8 rounded-full border"
                    >
                      −
                    </button>

                    <span className="w-6 text-center font-bold">
                      {selected?.qty ?? 0}
                    </span>

                    <button
                      type="button"
                      onClick={() => increaseTopping(topping)}
                      className="w-8 h-8 rounded-full border"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </motion.div>
)}



          {step === 2 && (
  <motion.div
    key="s2"
    variants={slideVariants}
    initial="enter"
    animate="center"
    exit="exit"
    transition={{ duration: 0.2 }}
  >
    <h2 className="text-lg font-bold mb-4">เลือกน้ำซุป</h2>

    <div className="grid grid-cols-2 gap-3">
      {soupTypes.map(soup => {
        const remainingStock = getRemainingStock(
  'soupTypes',
  soup.id,
  cart,
  editId ?? undefined
);

const outOfStock = remainingStock <= 0;

        const selected = selectedSoup?.id === soup.id;

        return (
          <button
            key={soup.id}
            onClick={() => !outOfStock && setSelectedSoup(soup)}
            disabled={outOfStock}
            className={cn(
              "p-4 rounded-xl border-2 transition-all text-left",
              outOfStock
                ? "border-border bg-muted opacity-50 cursor-not-allowed"
                : selected
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/40"
            )}
          >
            <div className="flex gap-3 items-center">
              {soup.image && (
                <img
                  src={soup.image}
                  alt={soup.name}
                  className="w-14 h-14 rounded-lg object-cover"
                />
              )}

              <div className="flex-1">
                <div className="font-semibold">{soup.name}</div>
                <div className="text-sm text-muted-foreground">
                  {outOfStock
                    ? <span className="text-destructive">หมด</span>
                    : soup.price > 0
                    ? `+฿${soup.price}`
                    : 'ฟรี'}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  </motion.div>
)}


          {step === 3 && (
            <motion.div key="s3" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}>
              <h2 className="text-lg font-bold mb-4">เลือกน้ำจิ้ม</h2>
              <div className="space-y-3 mb-8">
                {dippingSauces.map(sauce => {
                  const remainingStock = getRemainingStock(
  'dippingSauces',
  sauce.id,
  cart,
  editId ?? undefined
);

const outOfStock = remainingStock <= 0;

                  return (
                    <button
                      key={sauce.id}
                      onClick={() => !outOfStock && setSelectedSauce(sauce)}
                      disabled={outOfStock}
                      className={cn(
                        "w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between",
                        outOfStock
                          ? "border-border bg-muted opacity-50 cursor-not-allowed"
                          : selectedSauce?.id === sauce.id
                            ? "border-primary bg-primary/10 active:scale-95"
                            : "border-border bg-card hover:border-primary/30 active:scale-95"
                      )}
                    >
                      <span className="font-semibold">{sauce.name}</span>
                      <span className="text-muted-foreground">
                        {outOfStock ? <span className="text-destructive">หมด</span> : sauce.price > 0 ? `+฿${sauce.price}` : 'ฟรี'}
                      </span>
                    </button>
                  );
                })}
              </div>

            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}>
              <h2 className="text-lg font-bold mb-4">สรุปรายการ</h2>
              <div className="bg-card rounded-2xl border border-border p-5 space-y-3">

  {/* ค่าพื้นฐาน */}
  <div className="flex justify-between font-medium">
    <span>โอเด้ง</span>
    <span>฿{config.odenBasePrice}</span>
  </div>

  {/* ไส้ */}
  {selectedToppings.map(t => (
    <div key={t.item.id} className="flex justify-between text-sm">
      <span className="text-muted-foreground">
        ท็อปปิ้ง: {t.item.name} × {t.qty}
      </span>
      <span>+฿{t.item.price * t.qty}</span>
    </div>
  ))}

  {/* ✅ น้ำซุป */}
  {selectedSoup && (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">
        น้ำซุป: {selectedSoup.name}
      </span>
      <span>
        {selectedSoup.price > 0 ? `+฿${selectedSoup.price}` : 'ฟรี'}
      </span>
    </div>
  )}

  {/* ✅ น้ำจิ้ม */}
  {selectedSauce && (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">
        น้ำจิ้ม: {selectedSauce.name}
      </span>
      <span>
        {selectedSauce.price > 0 ? `+฿${selectedSauce.price}` : 'ฟรี'}
      </span>
    </div>
  )}

  {/* AddOns */}
  {selectedAddOns.map(a => (
    <div key={a.id} className="flex justify-between text-sm">
      <span className="text-muted-foreground">
        เพิ่มเติม: {a.name}
      </span>
      <span>+฿{a.price}</span>
    </div>
  ))}

  {/* รวม */}
  <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
    <span>รวม</span>
    <span className="text-primary">฿{totalPrice}</span>
  </div>
</div>


              <Button onClick={handleAddToCart} size="lg" className="w-full h-14 text-lg font-bold mt-6">
                {isEditing ? 'บันทึกการแก้ไข ✏️' : 'เพิ่มลงตะกร้า 🛒'}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom navigation */}
      {step < 4 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-4 z-40">
          <div className="flex gap-3">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(s => s - 1)} className="flex-1 h-12">
                ย้อนกลับ
              </Button>
            )}
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed}
              className="flex-1 h-12"
            >
              {step === 3 ? 'ดูสรุป' : 'ถัดไป'}
            </Button>
          </div>
        </div>
      )}

    </div>
  );
};

export default OdenCustomize;
