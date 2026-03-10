import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Package, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'في الانتظار', color: 'text-warning', bg: 'bg-warning/10' },
  queued: { label: 'في الطابور', color: 'text-primary', bg: 'bg-primary/10' },
  printing: { label: 'قيد الطباعة', color: 'text-secondary', bg: 'bg-secondary/10' },
  printed: { label: 'تمت الطباعة', color: 'text-success', bg: 'bg-success/10' },
  delivered: { label: 'تم الاستلام', color: 'text-success', bg: 'bg-success/10' },
  cancelled: { label: 'ملغي', color: 'text-destructive', bg: 'bg-destructive/10' },
};

export default function CustomerOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!user) return;
    const { data: customer } = await supabase.from('customers').select('id').eq('user_id', user.id).single();
    if (!customer) return;
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [user]);

  const cancelOrder = async (orderId: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'cancelled', is_cancelled: true, cancelled_at: new Date().toISOString(), cancellation_reason: 'إلغاء من العميل' })
      .eq('id', orderId);
    if (error) {
      toast.error('فشل إلغاء الطلب');
    } else {
      toast.success('تم إلغاء الطلب');
      fetchOrders();
    }
  };

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <h1 className="mb-6 font-display text-2xl font-bold">طلباتي</h1>

        {loading ? (
          <div className="py-12 text-center text-muted-foreground">جاري التحميل...</div>
        ) : orders.length === 0 ? (
          <div className="card-elevated py-12 text-center">
            <Package className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">لا توجد طلبات بعد</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = STATUS_MAP[order.status] || { label: order.status, color: '', bg: '' };
              const canCancel = ['pending', 'queued'].includes(order.status);
              return (
                <div key={order.id} className="card-elevated p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-display text-base font-bold">طلب #{order.order_number}</h3>
                        <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('ar', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                      {order.queue_position && order.status === 'queued' && (
                        <p className="mt-1 text-sm text-primary">ترتيبك في الطابور: {order.queue_position}</p>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-display text-lg font-bold">{order.total_amount} شيكل</p>
                      {order.remaining_amount > 0 && (
                        <p className="text-xs text-destructive">المتبقي: {order.remaining_amount} شيكل</p>
                      )}
                      {canCancel && (
                        <Button variant="ghost" size="sm" className="mt-2 text-destructive hover:text-destructive" onClick={() => cancelOrder(order.id)}>
                          <XCircle className="ml-1 h-4 w-4" />
                          إلغاء
                        </Button>
                      )}
                    </div>
                  </div>
                  {order.notes && <p className="mt-2 text-sm text-muted-foreground">{order.notes}</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
