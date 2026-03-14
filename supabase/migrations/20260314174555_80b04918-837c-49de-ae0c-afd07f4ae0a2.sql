
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  farm_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Poultry batches
CREATE TABLE public.poultry_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  batch_name TEXT NOT NULL,
  purchase_date DATE NOT NULL,
  quantity_bought INTEGER NOT NULL,
  purchase_cost NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.poultry_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own batches" ON public.poultry_batches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own batches" ON public.poultry_batches FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own batches" ON public.poultry_batches FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own batches" ON public.poultry_batches FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_batches_updated_at BEFORE UPDATE ON public.poultry_batches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Food expenses
CREATE TABLE public.batch_food_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES public.poultry_batches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expense_date DATE NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.batch_food_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own food expenses" ON public.batch_food_expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own food expenses" ON public.batch_food_expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own food expenses" ON public.batch_food_expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own food expenses" ON public.batch_food_expenses FOR DELETE USING (auth.uid() = user_id);

-- Sales
CREATE TABLE public.batch_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES public.poultry_batches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sale_date DATE NOT NULL,
  quantity_sold INTEGER NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.batch_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sales" ON public.batch_sales FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sales" ON public.batch_sales FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sales" ON public.batch_sales FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sales" ON public.batch_sales FOR DELETE USING (auth.uid() = user_id);

-- Losses
CREATE TABLE public.batch_losses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES public.poultry_batches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  loss_date DATE NOT NULL,
  quantity_lost INTEGER NOT NULL,
  cause TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.batch_losses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own losses" ON public.batch_losses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own losses" ON public.batch_losses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own losses" ON public.batch_losses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own losses" ON public.batch_losses FOR DELETE USING (auth.uid() = user_id);

-- Other expenses
CREATE TABLE public.batch_other_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES public.poultry_batches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expense_date DATE NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.batch_other_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own other expenses" ON public.batch_other_expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own other expenses" ON public.batch_other_expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own other expenses" ON public.batch_other_expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own other expenses" ON public.batch_other_expenses FOR DELETE USING (auth.uid() = user_id);

-- Livestock records
CREATE TABLE public.livestock_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  animal_type TEXT NOT NULL,
  name TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  purchase_date DATE NOT NULL,
  purchase_cost NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'deceased')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.livestock_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own livestock" ON public.livestock_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own livestock" ON public.livestock_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own livestock" ON public.livestock_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own livestock" ON public.livestock_records FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_livestock_updated_at BEFORE UPDATE ON public.livestock_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Livestock expenses
CREATE TABLE public.livestock_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  livestock_id UUID NOT NULL REFERENCES public.livestock_records(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expense_date DATE NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('feed', 'medicine', 'veterinary', 'other')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.livestock_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own livestock expenses" ON public.livestock_expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own livestock expenses" ON public.livestock_expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own livestock expenses" ON public.livestock_expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own livestock expenses" ON public.livestock_expenses FOR DELETE USING (auth.uid() = user_id);

-- Livestock sales
CREATE TABLE public.livestock_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  livestock_id UUID NOT NULL REFERENCES public.livestock_records(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sale_date DATE NOT NULL,
  quantity_sold INTEGER NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.livestock_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own livestock sales" ON public.livestock_sales FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own livestock sales" ON public.livestock_sales FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own livestock sales" ON public.livestock_sales FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own livestock sales" ON public.livestock_sales FOR DELETE USING (auth.uid() = user_id);
