import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OrderProvider } from "@/contexts/OrderContext";
import { StockProvider } from "@/contexts/StockContext";
import Index from "./pages/Index";
import MenuPage from "./pages/MenuPage";
import MamaCustomize from "./pages/MamaCustomize";
import OdenCustomize from "./pages/OdenCustomize";
import CartPage from "./pages/CartPage";
import OrderStatus from "./pages/OrderStatus";
import KitchenDashboard from "./pages/KitchenDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PinGate from "./components/PinGate";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <StockProvider>
      <OrderProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Customer Flow */}
            <Route path="/" element={<Index />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/menu/mama" element={<MamaCustomize />} />
            <Route path="/menu/oden" element={<OdenCustomize />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/order/:id" element={<OrderStatus />} />

            {/* Staff */}
            <Route path="/kitchen" element={
              <PinGate storageKey="kitchen-auth" title="เข้าสู่ระบบครัว">
                <KitchenDashboard />
              </PinGate>
            } />
            <Route path="/admin" element={
              <PinGate storageKey="admin-auth" title="เข้าสู่ระบบผู้จัดการ">
                <AdminDashboard />
              </PinGate>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </OrderProvider>
      </StockProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;