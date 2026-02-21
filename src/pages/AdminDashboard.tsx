import { useMemo, useState } from 'react';
import { useOrder } from '@/contexts/OrderContext';
import { useStock } from '@/contexts/StockContext';
import {
  ArrowLeft,
  Download,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import AdminStockManager from '@/components/admin/AdminStockManager';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

type ViewMode =
  | 'today'
  | '7days'
  | '30days'
  | 'month'
  | 'all'
  | 'custom';

type Tab = 'analytics' | 'stock';

const AdminDashboard = () => {
  const { orders } = useOrder();
  const stock = useStock();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] =
    useState<Tab>('analytics');

  const [viewMode, setViewMode] =
    useState<ViewMode>('today');

  const [startDate, setStartDate] =
    useState('');
  const [endDate, setEndDate] =
    useState('');
const [selectedDate, setSelectedDate] = useState('');
  /* ================= PAID ONLY ================= */

  const paidOrders = orders.filter(
    o => o.status === 'จ่ายเงินแล้ว'
  );
  const dailySummary = useMemo(() => {
  const summary: Record<
    string,
    {
      revenue: number;
      orders: number;
      items: Record<string, number>;
    }
  > = {};

  paidOrders.forEach(order => {
    const date = new Date(order.createdAt);

const dateKey = `${date.getFullYear()}-${String(
  date.getMonth() + 1
).padStart(2, '0')}-${String(
  date.getDate()
).padStart(2, '0')}`;

    if (!summary[dateKey]) {
      summary[dateKey] = {
        revenue: 0,
        orders: 0,
        items: {},
      };
    }

    summary[dateKey].revenue +=
      order.totalPrice;

    summary[dateKey].orders += 1;

    order.items.forEach(item => {
      const name =
        item.category === 'mama'
          ? `มาม่า ${item.flavor?.name || ''}`
          : 'โอเด้ง';

      const qty =
        item.category === 'mama'
          ? item.quantity ?? 1
          : item.qty ?? 1;

      summary[dateKey].items[name] =
        (summary[dateKey].items[name] || 0) +
        qty;
    });
  });

  return summary;
}, [paidOrders]);
const selectedDayData =
  selectedDate && dailySummary[selectedDate];

const bestSellerOfDay =
  selectedDayData &&
  Object.entries(selectedDayData.items)
    .sort((a, b) => b[1] - a[1])[0];
  /* ================= FILTER LOGIC ================= */

  const getFilteredOrders = () => {
    const now = new Date();

    return paidOrders.filter(o => {
      const d = new Date(o.createdAt);

      switch (viewMode) {
        case 'today':
          return (
            d.toDateString() ===
            now.toDateString()
          );

        case '7days':
          return (
            d >=
            new Date(
              new Date().setDate(
                now.getDate() - 6
              )
            )
          );

        case '30days':
          return (
            d >=
            new Date(
              new Date().setDate(
                now.getDate() - 29
              )
            )
          );

        case 'month':
          return (
            d.getMonth() ===
              now.getMonth() &&
            d.getFullYear() ===
              now.getFullYear()
          );

        case 'all':
          return true;

        case 'custom':
          if (!startDate || !endDate)
            return false;

          const start = new Date(
            startDate
          );
          const end = new Date(endDate);

          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);

          return d >= start && d <= end;
      }
    });
  };

  /* ================= ANALYTICS ================= */

  const analytics = useMemo(() => {
  const now = new Date();

  const filtered = paidOrders.filter(o => {
    const d = new Date(o.createdAt);

    switch (viewMode) {
      case 'today':
        return d.toDateString() === now.toDateString();

      case '7days':
        return d >= new Date(new Date().setDate(now.getDate() - 6));

      case '30days':
        return d >= new Date(new Date().setDate(now.getDate() - 29));

      case 'month':
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );

      case 'all':
        return true;

      case 'custom':
        if (!startDate || !endDate) return false;

        const start = new Date(startDate);
        const end = new Date(endDate);

        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        return d >= start && d <= end;
    }
  });
/* ===== REVENUE ===== */

const revenue = filtered.reduce(
  (sum, order) => sum + order.totalPrice,
  0
);
    /* ===== PROFIT ===== */

    let cost = 0;

    filtered.forEach(order => {
      order.items.forEach(item => {
        const qty =
          item.category === 'mama'
            ? item.quantity ?? 1
            : item.qty ?? 1;

        const stockItem =
          stock
            .getAllItems(
              'noodleFlavors'
            )
            .find(
              s =>
                s.name ===
                item.flavor?.name
            );

        if (stockItem) {
          cost +=
            stockItem.cost * qty;
        }
      });
    });

    const profit =
      revenue - cost;

    /* ===== HOURLY CHART DATA ===== */

    const hourly: Record<
      number,
      number
    > = {};

    filtered.forEach(order => {
      const hour = new Date(
        order.createdAt
      ).getHours();

      hourly[hour] =
        (hourly[hour] || 0) + 1;
    });

    const chartData = Array.from(
      { length: 24 },
      (_, h) => ({
        hour: `${h}:00`,
        orders: hourly[h] || 0,
      })
    );

    return {
      revenue,
      profit,
      chartData,
      orders: filtered,
    };
  }, [
    paidOrders,
    viewMode,
    startDate,
    endDate,
    stock,
  ]);

  /* ================= EXPORT PDF ================= */

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.text(
      'Restaurant Sales Report',
      14,
      15
    );

    autoTable(doc, {
      startY: 20,
      head: [['Order ID', 'Revenue']],
      body: analytics.orders.map(o => [
        o.id,
        o.totalPrice,
      ]),
    });

    doc.save('report.pdf');
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-background">
      <div className="flex justify-between items-center p-4 border-b">
        <button
          onClick={() => navigate('/')}
        >
          <ArrowLeft />
        </button>

        <h1 className="font-bold">
          Dashboard PRO
        </h1>

        {activeTab === 'analytics' && (
          <button
            onClick={exportPDF}
            className="text-primary"
          >
            <Download />
          </button>
        )}
      </div>

      <div className="p-4 space-y-6">

        {/* TAB */}
        <div className="flex gap-2">
          <button
            onClick={() =>
              setActiveTab('analytics')
            }
            className={cn(
              'px-4 py-2 rounded-lg',
              activeTab === 'analytics'
                ? 'bg-primary text-white'
                : 'bg-muted'
            )}
          >
            Analytics
          </button>

          <button
            onClick={() =>
              setActiveTab('stock')
            }
            className={cn(
              'px-4 py-2 rounded-lg',
              activeTab === 'stock'
                ? 'bg-primary text-white'
                : 'bg-muted'
            )}
          >
            Stock
          </button>
        </div>

        {activeTab === 'analytics' && (
          <>
            {/* FILTER BUTTONS */}
            <div className="flex gap-2 flex-wrap">
              {[
                ['today', 'วันนี้'],
                ['7days', '7 วัน'],
                ['30days', '30 วัน'],
                ['month', 'เดือนนี้'],
                ['all', 'ทั้งหมด'],
                ['custom', 'กำหนดเอง'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() =>
                    setViewMode(
                      id as ViewMode
                    )
                  }
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm',
                    viewMode === id
                      ? 'bg-primary text-white'
                      : 'bg-muted'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* CUSTOM DATE */}
            <div className="mt-4">
  <label className="text-sm text-muted-foreground">
    ดูรายวันย้อนหลัง
  </label>
  <input
    type="date"
    value={selectedDate}
    onChange={e =>
      setSelectedDate(e.target.value)
    }
    className="px-3 py-2 rounded-lg bg-card border ml-3"
  />
</div>
            {viewMode === 'custom' && (
              <div className="flex gap-3">
                <input
                  type="date"
                  value={startDate}
                  onChange={e =>
                    setStartDate(
                      e.target.value
                    )
                  }
                  className="px-3 py-2 rounded-lg bg-card border"
                />

                <input
                  type="date"
                  value={endDate}
                  onChange={e =>
                    setEndDate(
                      e.target.value
                    )
                  }
                  className="px-3 py-2 rounded-lg bg-card border"
                />
              </div>
            )}

            {/* STATS */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card p-4 rounded-xl border">
                รายได้
                <div className="text-xl font-bold">
                  ฿{analytics.revenue}
                </div>
              </div>

              <div className="bg-card p-4 rounded-xl border">
                กำไรจริง
                <div className="text-xl font-bold">
                  ฿{analytics.profit}
                </div>
              </div>
            </div>

            {/* HOURLY GRAPH */}
            <div className="bg-card p-4 rounded-xl border">
              <h3 className="font-semibold mb-3">
                📈 กราฟออเดอร์รายชั่วโมง
              </h3>

              <div className="h-72">
                <ResponsiveContainer>
                  <LineChart
                    data={analytics.chartData}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* DAILY DETAIL */}
{selectedDayData && (
  <div className="bg-card p-4 rounded-xl border space-y-3">
    <h3 className="font-semibold">
      📅 สรุปวันที่ {selectedDate}
    </h3>

    <div>
      รายได้วันนั้น:
      <span className="font-bold ml-2">
        ฿{selectedDayData.revenue}
      </span>
    </div>

    <div>
      จำนวนออเดอร์:
      <span className="font-bold ml-2">
        {selectedDayData.orders}
      </span>
    </div>

    {bestSellerOfDay && (
      <div>
        🏆 ขายดีที่สุด:
        <span className="font-bold ml-2">
          {bestSellerOfDay[0]} ({bestSellerOfDay[1]} ชิ้น)
        </span>
      </div>
    )}

    <div className="mt-3">
      <h4 className="font-medium">
        อันดับขายดี
      </h4>
      {Object.entries(selectedDayData.items)
        .sort((a, b) => b[1] - a[1])
        .map(([name, qty], index) => (
          <div
            key={name}
            className="flex justify-between text-sm border-b py-1"
          >
            <span>
              {index + 1}. {name}
            </span>
            <span>{qty} ชิ้น</span>
          </div>
        ))}
    </div>
  </div>
)}
          </>
        )}

        {activeTab === 'stock' && (
          <AdminStockManager />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;