import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/AppLayout';
import { Users, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase.from('customers').select('*').order('created_at', { ascending: false }).then(({ data }) => setCustomers(data || []));
  }, []);

  const filtered = customers.filter(c => {
    if (!search) return true;
    const s = search.toLowerCase();
    return c.name?.toLowerCase().includes(s) || c.phone?.includes(s);
  });

  return (
    <AppLayout>
      <div className="animate-fade-in space-y-4">
        <h1 className="font-display text-2xl font-bold">العملاء</h1>

        <div className="relative max-w-md">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث بالاسم أو الرقم..." className="pr-9" />
        </div>

        <div className="card-elevated overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="p-3 text-right font-medium">الاسم</th>
                <th className="p-3 text-right font-medium">الجوال</th>
                <th className="p-3 text-right font-medium">الزيارات</th>
                <th className="p-3 text-right font-medium">الصفحات</th>
                <th className="p-3 text-right font-medium">النقاط</th>
                <th className="p-3 text-right font-medium">التسجيل</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3 text-muted-foreground" dir="ltr">{c.phone || '-'}</td>
                  <td className="p-3">{c.visits_count_total}</td>
                  <td className="p-3">{c.printed_pages_total}</td>
                  <td className="p-3">{c.reward_points}</td>
                  <td className="p-3 text-muted-foreground">{new Date(c.created_at).toLocaleDateString('ar')}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">
                  <Users className="mx-auto mb-2 h-8 w-8 opacity-30" />
                  لا يوجد عملاء
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
