import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/AppLayout';
import { ClipboardList, Users, DollarSign, Printer, ArrowLeft } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ orders: 0, customers: 0, revenue: 0, pendingOrders: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [ordersRes, customersRes] = await Promise.all([
        supabase.from('orders').select('id, total_amount, paid_amount, status'),
        supabase.from('customers').select('id'),
      ]);

      const orders = ordersRes.data || [];
      const revenue = orders.reduce((sum, o) => sum + Number(o.paid_amount || 0), 0);
      const pending = orders.filter(o => ['pending', 'queued', 'printing'].includes(o.status)).length;

      setStats({
        orders: orders.length,
        customers: customersRes.data?.length || 0,
        revenue,
        pendingOrders: pending,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'إجمالي الطلبات', value: stats.orders, icon: ClipboardList, color: 'text-primary', link: '/dashboard/orders' },
    { label: 'طلبات نشطة', value: stats.pendingOrders, icon: Printer, color: 'text-warning', link: '/dashboard/orders' },
    { label: 'العملاء', value: stats.customers, icon: Users, color: 'text-success', link: '/dashboard/customers' },
    { label: 'الإيرادات (شيكل)', value: stats.revenue.toFixed(2), icon: DollarSign, color: 'text-secondary', link: '/dashboard/reports' },
  ];

  return (
    <AppLayout>
      <div className="animate-fade-in space-y-6">
        <h1 className="font-display text-2xl font-bold">لوحة التحكم</h1>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <Link to={card.link} key={card.label} className="stat-card group">
              <div className="flex items-center justify-between">
                <card.icon className={`h-6 w-6 ${card.color}`} />
                <ArrowLeft className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="mt-3 font-display text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
