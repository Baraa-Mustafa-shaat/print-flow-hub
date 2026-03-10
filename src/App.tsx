import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CustomerDashboard from "./pages/CustomerDashboard";
import CustomerNewOrder from "./pages/CustomerNewOrder";
import CustomerOrders from "./pages/CustomerOrders";
import CustomerRewards from "./pages/CustomerRewards";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrders from "./pages/AdminOrders";
import AdminCustomers from "./pages/AdminCustomers";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Customer Routes */}
            <Route path="/customer" element={<ProtectedRoute requiredRole="customer"><CustomerDashboard /></ProtectedRoute>} />
            <Route path="/customer/new-order" element={<ProtectedRoute requiredRole="customer"><CustomerNewOrder /></ProtectedRoute>} />
            <Route path="/customer/orders" element={<ProtectedRoute requiredRole="customer"><CustomerOrders /></ProtectedRoute>} />
            <Route path="/customer/rewards" element={<ProtectedRoute requiredRole="customer"><CustomerRewards /></ProtectedRoute>} />
            
            {/* Admin/Employee Routes */}
            <Route path="/dashboard" element={<ProtectedRoute requiredRole="employee"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/orders" element={<ProtectedRoute requiredRole="employee"><AdminOrders /></ProtectedRoute>} />
            <Route path="/dashboard/customers" element={<ProtectedRoute requiredRole="employee"><AdminCustomers /></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
