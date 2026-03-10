import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/AppLayout';
import { FilePlus, ClipboardList, Gift, Clock, Package, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ORDER_STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: 'في الانتظار', color: 'text-warning' },
  queued: { label: 'في الطابور', color: 'text-primary' },
  printing: { label: 'قيد الطباعة', color: 'text-secondary' },
  printed: { label: 'تمت الطباعة', color: 'text-success' },
  delivered: { label: 'تم الاستلام', color: 'text-success' },
  cancelled: { label: 'ملغي', color: 'text-destructive' },
};

export default function CustomerDashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, printing: 0, completed: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      // Get customer id
      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!customer) return;

      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (orders) {
        setRecentOrders(orders);
        setStats({
          total: orders.length,
          pending: orders.filter(o => o.status === 'pending' || o.status === 'queued').length,
          printing: orders.filter(o => o.status === 'printing').length,
          completed: orders.filter(o => o.status === 'printed' || o.status === 'delivered').length,
        });
      }
    };
    fetchData();
  }, [user]);

  return (
    <AppLayout>
      <div className="animate-fade-in space-y-6">
        {/* Welcome */}
        <div className="gradient-hero rounded-2xl p-6 text-primary-foreground">
          <h1 className="font-display text-2xl font-bold">مرحبًا {profile?.full_name || 'بك'} 👋</h1>
          <p className="mt-1 text-sm opacity-80">يمكنك إنشاء طلب جديد أو متابعة طلباتك الحالية</p>
          <Link to="/customer/new-order">
            <Button variant="secondary" className="mt-4">
              <FilePlus className="ml-2 h-4 w-4" />
              طلب طباعة جديد
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="stat-card text-center">
            <Package className="mx-auto mb-2 h-6 w-6 text-primary" />
            <p className="font-display text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">إجمالي الطلبات</p>
          </div>
          <div className="stat-card text-center">
            <Clock className="mx-auto mb-2 h-6 w-6 text-warning" />
            <p className="font-display text-2xl font-bold">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">قيد الانتظار</p>
          </div>
          <div className="stat-card text-center">
            <ClipboardList className="mx-auto mb-2 h-6 w-6 text-secondary" />
            <p className="font-display text-2xl font-bold">{stats.printing}</p>
            <p className="text-xs text-muted-foreground">قيد الطباعة</p>
          </div>
          <div className="stat-card text-center">
            <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-success" />
            <p className="font-display text-2xl font-bold">{stats.completed}</p>
            <p className="text-xs text-muted-foreground">مكتملة</p>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card-elevated p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">آخر الطلبات</h2>
            <Link to="/customer/orders" className="text-sm text-primary hover:underline">عرض الكل</Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Package className="mx-auto mb-2 h-10 w-10 opacity-30" />
              <p>لا توجد طلبات بعد</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => {
                const status = ORDER_STATUS_MAP[order.status] || { label: order.status, color: '' };
                return (
                  <div key={order.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium">طلب #{order.order_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('ar')}
                      </p>
                    </div>
                    <div className="text-left">
                      <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
                      {order.queue_position && order.status === 'queued' && (
                        <p className="text-xs text-muted-foreground">الترتيب: {order.queue_position}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
