import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Send, FileText, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CustomerNewOrder() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [colorMode, setColorMode] = useState<'bw' | 'color'>('bw');
  const [sizeMode, setSizeMode] = useState<'normal' | 'large' | 'small'>('normal');
  const [copies, setCopies] = useState(1);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const PRICES = { bw: 0.5, color: 2, large: 1, small: 0.3, normal: 0 };

  const estimatedPrice = () => {
    const basePrice = colorMode === 'bw' ? PRICES.bw : PRICES.color;
    const sizeExtra = sizeMode === 'large' ? PRICES.large : sizeMode === 'small' ? PRICES.small : 0;
    return ((basePrice + sizeExtra) * copies * Math.max(files.length, 1)).toFixed(2);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Get customer
      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!customer) throw new Error('لم يتم العثور على بيانات العميل');

      const total = parseFloat(estimatedPrice());

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: customer.id,
          status: 'pending',
          source_type: 'customer_portal',
          subtotal: total,
          total_amount: total,
          remaining_amount: total,
          notes,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order item
      await supabase.from('order_items').insert({
        order_id: order.id,
        item_type: 'print',
        print_color_mode: colorMode,
        print_size_mode: sizeMode,
        quantity: copies,
        files_count: files.length,
        unit_price: parseFloat(estimatedPrice()) / copies,
        total_price: total,
      });

      // Upload files
      for (const file of files) {
        const storedName = `${order.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('order-files')
          .upload(storedName, file);

        if (!uploadError) {
          await supabase.from('order_files').insert({
            order_id: order.id,
            original_name: file.name,
            stored_name: storedName,
            file_path: storedName,
            mime_type: file.type,
            file_size: file.size,
            source_type: 'upload',
          });
        }
      }

      toast.success('تم إرسال الطلب بنجاح!');
      navigate('/customer/orders');
    } catch (err: any) {
      toast.error('حدث خطأ', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl animate-fade-in">
        <h1 className="mb-6 font-display text-2xl font-bold">طلب طباعة جديد</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div className="card-elevated p-5">
            <h2 className="mb-3 font-display text-base font-bold">رفع الملفات</h2>
            <label className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-primary/30 bg-accent/30 p-8 transition-colors hover:border-primary/50">
              <Upload className="mb-2 h-8 w-8 text-primary" />
              <span className="text-sm font-medium text-foreground">اضغط لاختيار الملفات</span>
              <span className="text-xs text-muted-foreground">PDF, Word, Excel, PowerPoint, صور</span>
              <input type="file" multiple className="hidden" onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.bmp" />
            </label>
            {files.length > 0 && (
              <ul className="mt-3 space-y-2">
                {files.map((file, i) => (
                  <li key={i} className="flex items-center justify-between rounded-lg border border-border p-2 text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="truncate">{file.name}</span>
                      <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(0)} KB)</span>
                    </div>
                    <button type="button" onClick={() => removeFile(i)} className="text-destructive hover:text-destructive/80">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Print Settings */}
          <div className="card-elevated p-5">
            <h2 className="mb-3 font-display text-base font-bold">إعدادات الطباعة</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>نوع الطباعة</Label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setColorMode('bw')}
                    className={`flex-1 rounded-lg border-2 p-3 text-center text-sm font-medium transition-all ${colorMode === 'bw' ? 'border-primary bg-accent text-accent-foreground' : 'border-border'}`}>
                    أبيض وأسود
                  </button>
                  <button type="button" onClick={() => setColorMode('color')}
                    className={`flex-1 rounded-lg border-2 p-3 text-center text-sm font-medium transition-all ${colorMode === 'color' ? 'border-primary bg-accent text-accent-foreground' : 'border-border'}`}>
                    ملوّن
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>الحجم</Label>
                <div className="flex gap-2">
                  {[{ value: 'small', label: 'مصغر' }, { value: 'normal', label: 'عادي' }, { value: 'large', label: 'مكبر' }].map(opt => (
                    <button key={opt.value} type="button" onClick={() => setSizeMode(opt.value as any)}
                      className={`flex-1 rounded-lg border-2 p-3 text-center text-sm font-medium transition-all ${sizeMode === opt.value ? 'border-primary bg-accent text-accent-foreground' : 'border-border'}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="copies">عدد النسخ</Label>
                <Input id="copies" type="number" min={1} value={copies} onChange={(e) => setCopies(parseInt(e.target.value) || 1)} />
              </div>
              <div className="space-y-2">
                <Label>السعر التقديري</Label>
                <div className="flex h-10 items-center rounded-lg bg-accent px-3 font-display text-lg font-bold text-accent-foreground">
                  {estimatedPrice()} شيكل
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="card-elevated p-5">
            <Label htmlFor="notes">ملاحظات إضافية</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="أي تعليمات خاصة للطباعة..." className="mt-2" />
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                جاري الإرسال...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                إرسال الطلب
              </span>
            )}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
