import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import CartFloatingButton from '@/components/CartFloatingButton';

const categories = [
  {
    id: 'mama',
    name: 'มาม่า',
    emoji: '🍜',
    description: 'มาม่าสไตล์ต่างๆ พร้อมท็อปปิ้งเลือกได้',
    path: '/menu/mama',
  },
  {
    id: 'oden',
    name: 'โอเด้ง',
    emoji: '🍢',
    description: 'โอเด้งร้อนๆ เลือกไส้ น้ำซุป และน้ำจิ้ม',
    path: '/menu/oden',
  },
];

const MenuPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full hover:bg-accent transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">เลือกเมนู</h1>
      </div>

      {/* Categories */}
      <div className="p-6 space-y-4">
        {categories.map((cat, i) => (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => navigate(cat.path)}
            className="w-full bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all text-left active:scale-[0.98]"
          >
            <div className="text-5xl mb-3">{cat.emoji}</div>
            <h2 className="text-2xl font-bold text-foreground">{cat.name}</h2>
            <p className="text-muted-foreground mt-1">{cat.description}</p>
          </motion.button>
        ))}
      </div>

      <CartFloatingButton />
    </div>
  );
};

export default MenuPage;