import { useState } from 'react';
import { useStock, StockCategory, StockItem } from '@/contexts/StockContext';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Trash2, AlertTriangle, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

const categoryLabels: Record<StockCategory, { label: string; emoji: string }> = {
  noodleFlavors: { label: 'รสมาม่า', emoji: '🍜' },
  toppings: { label: 'ท็อปปิ้งทั้งหมด', emoji: '🥚' },
  soupTypes: { label: 'น้ำซุปโอเด้ง', emoji: '🍲' },
  dippingSauces: { label: 'น้ำจิ้มโอเด้ง', emoji: '🥣' },
  odenAddOns: { label: 'เพิ่มเติมโอเด้ง', emoji: '➕' },
};

const categories: StockCategory[] = [
  'noodleFlavors',
  'toppings',
  'soupTypes',
  'dippingSauces',
  'odenAddOns',
];

const StockItemRow = ({
  item,
  onUpdate,
  onRemove,
}: {
  item: StockItem;
  onUpdate: (updates: Partial<StockItem>) => void;
  onRemove: () => void;
}) => {
  const isLow = item.enabled && item.stock <= item.minStock;

  return (
    <div
      className={cn(
        'rounded-xl border p-3 space-y-2',
        !item.enabled
          ? 'opacity-50 border-border'
          : isLow
          ? 'border-destructive/50 bg-destructive/5'
          : 'border-border'
      )}
    >
      <div className="flex items-center gap-2">
        <Input
          value={item.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="flex-1 h-8 text-sm font-medium"
        />
        <Switch
          checked={item.enabled}
          onCheckedChange={(checked) => onUpdate({ enabled: checked })}
        />
      </div>

      <div className="flex items-center gap-3 text-sm flex-wrap">
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground text-xs">฿</span>
          <Input
            type="number"
            value={item.price}
            onChange={(e) => onUpdate({ price: Number(e.target.value) || 0 })}
            className="w-16 h-7 text-center text-xs"
          />
        </div>

        <div className="flex items-center gap-1 flex-1">
          <Package className="w-3 h-3 text-muted-foreground shrink-0" />
          <button
            onClick={() =>
              onUpdate({ stock: Math.max(0, item.stock - 1) })
            }
            className="w-6 h-6 rounded bg-muted flex items-center justify-center hover:bg-accent shrink-0"
          >
            <Minus className="w-3 h-3" />
          </button>

          <Input
            type="number"
            value={item.stock}
            onChange={(e) =>
              onUpdate({
                stock: Math.max(0, Number(e.target.value) || 0),
              })
            }
            className={cn(
              'w-14 h-7 text-center text-xs',
              isLow && 'text-destructive font-bold'
            )}
          />

          <button
            onClick={() => onUpdate({ stock: item.stock + 1 })}
            className="w-6 h-6 rounded bg-muted flex items-center justify-center hover:bg-accent shrink-0"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">ขั้นต่ำ</span>
          <Input
            type="number"
            value={item.minStock}
            onChange={(e) =>
              onUpdate({ minStock: Number(e.target.value) || 0 })
            }
            className="w-12 h-7 text-center text-xs"
          />
        </div>

        <button
          onClick={onRemove}
          className="p-1 rounded hover:bg-destructive/10 text-destructive shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

const AdminStockManager = () => {
  const {
    getAllItems,
    updateItem,
    deductStock,
    config,
  } = useStock();

  const [expandedCat, setExpandedCat] =
    useState<StockCategory | null>('noodleFlavors');

  return (
    <div className="space-y-6">
      {categories.map((cat) => {
        const items = getAllItems(cat) || [];
        const isExpanded = expandedCat === cat;
        const { label, emoji } = categoryLabels[cat];

        const lowCount = items.filter(
          (i) => i.enabled && i.stock <= i.minStock
        ).length;

        return (
          <div
            key={cat}
            className="bg-card rounded-2xl border border-border overflow-hidden"
          >
            <button
              onClick={() =>
                setExpandedCat(isExpanded ? null : cat)
              }
              className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span>{emoji}</span>
                <span className="font-bold">{label}</span>
                <span className="text-sm text-muted-foreground">
                  ({items.length})
                </span>
                {lowCount > 0 && (
                  <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded-full">
                    ⚠ {lowCount}
                  </span>
                )}
              </div>
              <span className="text-muted-foreground">
                {isExpanded ? '▲' : '▼'}
              </span>
            </button>

            {isExpanded && (
              <div className="border-t border-border p-4 space-y-3">
                {items.map((item) => (
                  <StockItemRow
                    key={item.id}
                    item={item}
                    onUpdate={(updates) =>
                      updateItem(cat, item.id, updates)
                    }
                    onRemove={() => {}}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AdminStockManager;
