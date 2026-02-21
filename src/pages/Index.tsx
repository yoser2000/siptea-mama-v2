import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrder } from '@/contexts/OrderContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import heroImage from '@/assets/hero-food.jpg';

const Index = () => {
  const [name, setName] = useState('');
  const [table, setTable] = useState('');
  const [note, setNote] = useState('');
  const { setCustomerInfo } = useOrder();
  const navigate = useNavigate();

  const handleStart = () => {
    if (!name.trim()) return;
    setCustomerInfo(name.trim(), table.trim(), note.trim());
    navigate('/menu');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero */}
      <div className="relative h-56 overflow-hidden">
        <img src={heroImage} alt="อาหาร" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute bottom-5 left-6 right-6"
        >
          <h1 className="text-3xl font-extrabold text-foreground">🍜 ร้านมาม่า & โอเด้ง</h1>
          <p className="text-muted-foreground mt-1 font-medium">สั่งง่าย อร่อยเร็ว</p>
        </motion.div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex-1 px-6 py-6 space-y-5"
      >
        <div className="space-y-2">
          <Label htmlFor="name" className="text-base font-semibold">ชื่อลูกค้า *</Label>
          <Input
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="กรุณาใส่ชื่อ"
            className="h-12 text-base"
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="table" className="text-base">
            หมายเลขโต๊ะ <span className="text-muted-foreground font-normal">(ไม่จำเป็น)</span>
          </Label>
          <Input
            id="table"
            value={table}
            onChange={e => setTable(e.target.value)}
            placeholder="เช่น 1, 2, 3"
            className="h-12 text-base"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="note" className="text-base">
            หมายเหตุถึงครัว <span className="text-muted-foreground font-normal">(ไม่จำเป็น)</span>
          </Label>
          <Textarea
            id="note"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="เช่น แพ้อาหารทะเล, ไม่ใส่ผัก"
            className="text-base"
            rows={3}
          />
        </div>

        <Button
          onClick={handleStart}
          disabled={!name.trim()}
          size="lg"
          className="w-full h-14 text-lg font-bold mt-4"
        >
          🍜 เริ่มสั่งอาหาร
        </Button>
      </motion.div>
    </div>
  );
};

export default Index;