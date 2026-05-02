-- 1. Wipe and recreate products with new schema
DROP TABLE IF EXISTS public.products CASCADE;

CREATE TABLE public.products (
  id text PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'Autre',
  description text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  old_price numeric,
  has_discount boolean NOT NULL DEFAULT false,
  available_sizes text[] NOT NULL DEFAULT '{}',
  colors jsonb NOT NULL DEFAULT '[]'::jsonb,
  badge text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY products_select_all ON public.products FOR SELECT USING (true);
CREATE POLICY products_insert_all ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY products_update_all ON public.products FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY products_delete_all ON public.products FOR DELETE USING (true);

-- 2. Size decks
CREATE TABLE public.size_decks (
  id text PRIMARY KEY,
  name text NOT NULL,
  sizes text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.size_decks ENABLE ROW LEVEL SECURITY;
CREATE POLICY size_decks_select_all ON public.size_decks FOR SELECT USING (true);
CREATE POLICY size_decks_insert_all ON public.size_decks FOR INSERT WITH CHECK (true);
CREATE POLICY size_decks_update_all ON public.size_decks FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY size_decks_delete_all ON public.size_decks FOR DELETE USING (true);

-- 3. Product types
CREATE TABLE public.product_types (
  id text PRIMARY KEY,
  name text NOT NULL,
  size_deck_id text REFERENCES public.size_decks(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY product_types_select_all ON public.product_types FOR SELECT USING (true);
CREATE POLICY product_types_insert_all ON public.product_types FOR INSERT WITH CHECK (true);
CREATE POLICY product_types_update_all ON public.product_types FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY product_types_delete_all ON public.product_types FOR DELETE USING (true);

-- 4. Orders
CREATE TABLE public.orders (
  id text PRIMARY KEY,
  customer_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_price numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'En attente',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY orders_select_all ON public.orders FOR SELECT USING (true);
CREATE POLICY orders_insert_all ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY orders_update_all ON public.orders FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY orders_delete_all ON public.orders FOR DELETE USING (true);

-- 5. Profiles (linked to auth.users)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_select_own ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_insert_own ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at trigger for profiles
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

CREATE POLICY product_images_select_all ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY product_images_insert_all ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
CREATE POLICY product_images_update_all ON storage.objects FOR UPDATE USING (bucket_id = 'product-images') WITH CHECK (bucket_id = 'product-images');
CREATE POLICY product_images_delete_all ON storage.objects FOR DELETE USING (bucket_id = 'product-images');