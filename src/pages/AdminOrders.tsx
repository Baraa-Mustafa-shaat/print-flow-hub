import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

const STATUSES = [
  { value: 'all', label: 'الكل' },
  { value: 'pending', label: 'في الانتظار' },
  { value: 'queued', label: 'في الطابور' },
  { value: 'printing', label: 'قيد الطباعة' },
  { value: 'printed', label: 'تمت الطباعة' },
  { value: 'delivered', label: 'تم الاستلام' },
  { value: 'cancelled', label: 'ملغي' },
];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'في الانتظار', color: 'bg-warning/10 text-warning' },
  queued: { label: 'في الطابور', color: 'bg-primary/10 text-primary' },
  printing: { label: 'قيد الطباعة', color: 'bg-secondary/10 text-secondary' },
  printed: { label: 'تمت الطباعة', color: 'bg-success/10 text-success' },
  delivered: { label: 'تم الاستلام', color: 'bg-success/10 text-success' },
  cancelled: { label: 'ملغي', color: 'bg-destructive/10 text-destructive' },
};

const NEXT_STATUS: Record<string, string> = {
  pending: 'queued',
  queued: 'printing',
  printing: 'printed',
  printed: 'delivered',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    let query = supabase.from('orders').select('*, customers(name, phone)').order('created_at', { ascending: false });
    if (filter !== 'all') query = query.eq('status', filter);
    const { data } = await query;
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  const updateStatus = async (orderId: string, currentStatus: string) => {
    const next = NEXT_STATUS[currentStatus];
    if (!next) return;
    const updates: any = { status: next };
    if (next === 'printing') updates.started_printing_at = new Date().toISOString();
    if (next === 'printed') updates.finished_printing_at = new Date().toISOString();

    const { error } = await supabase.from('orders').update(updates).eq('id', orderId);
    if (error) toast.error('فشل التحديث');
    else {
      toast.success(`تم تحديث الحالة إلى: ${STATUS_LABELS[next]?.label}`);
      fetchOrders();
    }
  };

  const filtered = orders.filter(o => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      String(o.order_number).includes(s) ||
      o.customers?.name?.toLowerCase().includes(s) ||
      o.customers?.phone?.includes(s)
    );
  });

  return (
    <AppLayout>
      <div className="animate-fade-in space-y-4">
        <h1 className="font-display text-2xl font-bold">إدارة الطلبات</h1>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث برقم الطلب أو اسم العميل..." className="pr-9" />
          </div>
          <div className="flex flex-wrap gap-1">
            {STATUSES.map(s => (
              <button key={s.value} onClick={() => setFilter(s.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${filter === s.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="card-elevated overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="p-3 text-right font-medium">#</th>
                  <th className="p-3 text-right font-medium">العميل</th>
                  <th className="p-3 text-right font-medium">التاريخ</th>
                  <th className="p-3 text-right font-medium">الحالة</th>
                  <th className="p-3 text-right font-medium">المبلغ</th>
                  <th className="p-3 text-right font-medium">المتبقي</th>
                  <th className="p-3 text-right font-medium">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => {
                  const status = STATUS_LABELS[order.status] || { label: order.status, color: '' };
                  const next = NEXT_STATUS[order.status];
                  return (
                    <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="p-3 font-medium">{order.order_number}</td>
                      <td className="p-3">{order.customers?.name || '-'}</td>
                      <td className="p-3 text-muted-foreground">{new Date(order.created_at).toLocaleDateString('ar')}</td>
                      <td className="p-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}>{status.label}</span>
                      </td>
                      <td className="p-3">{order.total_amount}</td>
                      <td className="p-3">{order.remaining_amount > 0 ? <span className="text-destructive">{order.remaining_amount}</span> : <span className="text-success">0</span>}</td>
                      <td className="p-3">
                        {next && (
                          <Button size="sm" variant="outline" onClick={() => updateStatus(order.id, order.status)}>
                            {STATUS_LABELS[next]?.label}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">لا توجد طلبات</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
