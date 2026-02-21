import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

interface PinGateProps {
  children: React.ReactNode;
  storageKey?: string;
  pin?: string;
  title?: string;
}

const PinGate = ({ children, storageKey = 'staff-auth', pin = '1234', title = 'เข้าสู่ระบบ' }: PinGateProps) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [unlocked, setUnlocked] = useState(() =>
    sessionStorage.getItem(storageKey) === 'true'
  );

  if (unlocked) return <>{children}</>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === pin) {
      sessionStorage.setItem(storageKey, 'true');
      setUnlocked(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground">กรุณาใส่รหัส PIN</p>
        <Input
          type="password"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="PIN"
          className="h-14 text-center text-2xl tracking-widest"
          maxLength={8}
          autoFocus
        />
        {error && <p className="text-destructive text-sm">รหัสไม่ถูกต้อง</p>}
        <Button type="submit" size="lg" className="w-full h-12">
          เข้าสู่ระบบ
        </Button>
        <p className="text-xs text-muted-foreground">PIN เริ่มต้น: 1234</p>
      </form>
    </div>
  );
};

export default PinGate;