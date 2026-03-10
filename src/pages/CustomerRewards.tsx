import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/AppLayout';
import { Gift, Star, Trophy } from 'lucide-react';

export default function CustomerRewards() {
  const { user } = useAuth();
  const [customer, setCustomer] = useState<any>(null);
  const [rewards, setRewards] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data: c } = await supabase.from('customers').select('*').eq('user_id', user.id).single();
      setCustomer(c);
      if (c) {
        const { data: cr } = await supabase
          .from('customer_rewards')
          .select('*, rewards(*)')
          .eq('customer_id', c.id)
          .order('granted_at', { ascending: false });
        setRewards(cr || []);
      }
    };
    fetchData();
  }, [user]);

  return (
    <AppLayout>
      <div className="animate-fade-in space-y-6">
        <h1 className="font-display text-2xl font-bold">هداياي ومكافآتي</h1>

        {/* Points Card */}
        {customer && (
          <div className="gradient-primary rounded-2xl p-6 text-primary-foreground">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8" />
              <div>
                <p className="text-sm opacity-80">رصيد النقاط</p>
                <p className="font-display text-3xl font-bold">{customer.reward_points}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="opacity-70">الزيارات هذا الشهر</p>
                <p className="font-bold">{customer.visits_count_monthly}</p>
              </div>
              <div>
                <p className="opacity-70">الصفحات المطبوعة</p>
                <p className="font-bold">{customer.printed_pages_monthly}</p>
              </div>
            </div>
          </div>
        )}

        {/* Available Rewards */}
        <div className="card-elevated p-5">
          <h2 className="mb-4 font-display text-lg font-bold">المكافآت المتاحة</h2>
          {rewards.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Gift className="mx-auto mb-2 h-10 w-10 opacity-30" />
              <p>لا توجد مكافآت حاليًا</p>
              <p className="mt-1 text-xs">استمر في الطباعة لتحصل على هدايا ومكافآت!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rewards.map((cr) => (
                <div key={cr.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <Star className="h-5 w-5 text-secondary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{cr.rewards?.title}</p>
                    <p className="text-xs text-muted-foreground">{cr.rewards?.description}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cr.status === 'granted' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                    {cr.status === 'granted' ? 'متاح' : 'مستخدم'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
