
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'employee', 'customer');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Customers table (extends profiles for customer-specific data)
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  notes TEXT,
  visits_count_monthly INTEGER DEFAULT 0,
  visits_count_total INTEGER DEFAULT 0,
  printed_pages_monthly INTEGER DEFAULT 0,
  printed_pages_total INTEGER DEFAULT 0,
  reward_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own data" ON public.customers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Customers can update own data" ON public.customers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all customers" ON public.customers FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all customers" ON public.customers FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert customers" ON public.customers FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number SERIAL,
  customer_id UUID REFERENCES public.customers(id),
  order_date TIMESTAMPTZ DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending',
  queue_position INTEGER,
  payment_method TEXT DEFAULT 'cash',
  subtotal NUMERIC(10,2) DEFAULT 0,
  discount NUMERIC(10,2) DEFAULT 0,
  paid_amount NUMERIC(10,2) DEFAULT 0,
  remaining_amount NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2) DEFAULT 0,
  employee_id UUID REFERENCES auth.users(id),
  source_type TEXT DEFAULT 'direct',
  source_ref TEXT,
  notes TEXT,
  is_cancelled BOOLEAN DEFAULT false,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  started_printing_at TIMESTAMPTZ,
  finished_printing_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own orders" ON public.orders FOR SELECT USING (
  customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
);
CREATE POLICY "Customers can insert own orders" ON public.orders FOR INSERT WITH CHECK (
  customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
);
CREATE POLICY "Customers can update own pending orders" ON public.orders FOR UPDATE USING (
  customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()) AND status IN ('pending', 'queued')
);
CREATE POLICY "Admins can do all on orders" ON public.orders FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Employees can view all orders" ON public.orders FOR SELECT USING (public.has_role(auth.uid(), 'employee'));
CREATE POLICY "Employees can insert orders" ON public.orders FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'employee'));
CREATE POLICY "Employees can update orders" ON public.orders FOR UPDATE USING (public.has_role(auth.uid(), 'employee'));

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Order items
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  item_type TEXT NOT NULL DEFAULT 'print',
  print_color_mode TEXT DEFAULT 'bw',
  print_size_mode TEXT DEFAULT 'normal',
  curriculum_type TEXT,
  grade TEXT,
  semester TEXT,
  branch TEXT,
  subject TEXT,
  cover BOOLEAN DEFAULT false,
  papers_count INTEGER DEFAULT 0,
  files_count INTEGER DEFAULT 0,
  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC(10,2) DEFAULT 0,
  total_price NUMERIC(10,2) DEFAULT 0,
  details_json JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view items of their orders" ON public.order_items FOR SELECT USING (
  order_id IN (SELECT id FROM public.orders WHERE customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()))
);
CREATE POLICY "Users can insert items to their orders" ON public.order_items FOR INSERT WITH CHECK (
  order_id IN (SELECT id FROM public.orders WHERE customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()))
);
CREATE POLICY "Admins can do all on order_items" ON public.order_items FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Employees can view order_items" ON public.order_items FOR SELECT USING (public.has_role(auth.uid(), 'employee'));
CREATE POLICY "Employees can insert order_items" ON public.order_items FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'employee'));

-- Order files
CREATE TABLE public.order_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  original_name TEXT NOT NULL,
  stored_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  mime_type TEXT,
  file_size BIGINT,
  page_count INTEGER,
  source_type TEXT DEFAULT 'upload',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.order_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view files of their orders" ON public.order_files FOR SELECT USING (
  order_id IN (SELECT id FROM public.orders WHERE customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()))
);
CREATE POLICY "Users can insert files to their orders" ON public.order_files FOR INSERT WITH CHECK (
  order_id IN (SELECT id FROM public.orders WHERE customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()))
);
CREATE POLICY "Admins can do all on order_files" ON public.order_files FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Employees can view order_files" ON public.order_files FOR SELECT USING (public.has_role(auth.uid(), 'employee'));

-- Order history / audit log
CREATE TABLE public.order_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  description TEXT,
  changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.order_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view history of own orders" ON public.order_history FOR SELECT USING (
  order_id IN (SELECT id FROM public.orders WHERE customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()))
);
CREATE POLICY "Admins can do all on order_history" ON public.order_history FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Employees can view order_history" ON public.order_history FOR SELECT USING (public.has_role(auth.uid(), 'employee'));
CREATE POLICY "Employees can insert order_history" ON public.order_history FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'employee'));

-- Rewards
CREATE TABLE public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  reward_type TEXT NOT NULL DEFAULT 'discount_percentage',
  reward_value NUMERIC(10,2) DEFAULT 0,
  reward_mode TEXT DEFAULT 'random',
  description TEXT,
  is_premium BOOLEAN DEFAULT false,
  min_monthly_visits INTEGER,
  min_monthly_pages INTEGER,
  min_total_visits INTEGER,
  min_total_pages INTEGER,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  stock_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active rewards" ON public.rewards FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can do all on rewards" ON public.rewards FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_rewards_updated_at BEFORE UPDATE ON public.rewards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Customer rewards
CREATE TABLE public.customer_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  reward_id UUID REFERENCES public.rewards(id) NOT NULL,
  order_id UUID REFERENCES public.orders(id),
  granted_at TIMESTAMPTZ DEFAULT now(),
  redeemed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'granted',
  notes TEXT
);

ALTER TABLE public.customer_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own rewards" ON public.customer_rewards FOR SELECT USING (
  customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can do all on customer_rewards" ON public.customer_rewards FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Settings
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.settings FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for order files
INSERT INTO storage.buckets (id, name, public) VALUES ('order-files', 'order-files', false);

CREATE POLICY "Users can upload order files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'order-files' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can view own order files" ON storage.objects FOR SELECT USING (bucket_id = 'order-files' AND auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage all files" ON storage.objects FOR ALL USING (bucket_id = 'order-files' AND public.has_role(auth.uid(), 'admin'));

-- Auto-create profile and customer on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.phone);
  
  -- Default role is customer
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');
  
  -- Create customer record
  INSERT INTO public.customers (user_id, name, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.phone);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
