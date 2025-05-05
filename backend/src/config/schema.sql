-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'farmer', 'consumer');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'consumer',
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create farmer_profiles table
CREATE TABLE farmer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  farm_name TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  profile_image TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_id UNIQUE (user_id)
);

-- Create consumer_profiles table
CREATE TABLE consumer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  default_address_id UUID,
  preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_id UNIQUE (user_id)
);

-- Create addresses table
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'USA',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update consumer_profiles with foreign key to addresses
ALTER TABLE consumer_profiles
ADD CONSTRAINT fk_default_address
FOREIGN KEY (default_address_id)
REFERENCES addresses(id)
ON DELETE SET NULL;

-- Create categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID NOT NULL REFERENCES farmer_profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  image TEXT,
  is_organic BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status order_status NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  shipping_address_id UUID NOT NULL REFERENCES addresses(id),
  shipping_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  tracking_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_product UNIQUE (user_id, product_id)
);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users table policies
CREATE POLICY users_select_own ON users FOR SELECT USING (auth.uid() = id OR auth.jwt().role = 'admin');
CREATE POLICY users_update_own ON users FOR UPDATE USING (auth.uid() = id OR auth.jwt().role = 'admin');

-- Farmer profiles policies
CREATE POLICY farmer_profiles_select_all ON farmer_profiles FOR SELECT USING (true);
CREATE POLICY farmer_profiles_insert_own ON farmer_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY farmer_profiles_update_own ON farmer_profiles FOR UPDATE USING (auth.uid() = user_id OR auth.jwt().role = 'admin');

-- Consumer profiles policies
CREATE POLICY consumer_profiles_select_own ON consumer_profiles FOR SELECT USING (auth.uid() = user_id OR auth.jwt().role = 'admin');
CREATE POLICY consumer_profiles_insert_own ON consumer_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY consumer_profiles_update_own ON consumer_profiles FOR UPDATE USING (auth.uid() = user_id OR auth.jwt().role = 'admin');

-- Addresses policies
CREATE POLICY addresses_select_own ON addresses FOR SELECT USING (auth.uid() = user_id OR auth.jwt().role = 'admin');
CREATE POLICY addresses_insert_own ON addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY addresses_update_own ON addresses FOR UPDATE USING (auth.uid() = user_id OR auth.jwt().role = 'admin');
CREATE POLICY addresses_delete_own ON addresses FOR DELETE USING (auth.uid() = user_id OR auth.jwt().role = 'admin');

-- Categories policies
CREATE POLICY categories_select_all ON categories FOR SELECT USING (true);
CREATE POLICY categories_insert_admin ON categories FOR INSERT WITH CHECK (auth.jwt().role = 'admin');
CREATE POLICY categories_update_admin ON categories FOR UPDATE USING (auth.jwt().role = 'admin');
CREATE POLICY categories_delete_admin ON categories FOR DELETE USING (auth.jwt().role = 'admin');

-- Products policies
CREATE POLICY products_select_all ON products FOR SELECT USING (true);
CREATE POLICY products_insert_farmer ON products FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM farmer_profiles WHERE id = farmer_id AND user_id = auth.uid())
);
CREATE POLICY products_update_farmer ON products FOR UPDATE USING (
  EXISTS (SELECT 1 FROM farmer_profiles WHERE id = farmer_id AND user_id = auth.uid()) OR auth.jwt().role = 'admin'
);
CREATE POLICY products_delete_farmer ON products FOR DELETE USING (
  EXISTS (SELECT 1 FROM farmer_profiles WHERE id = farmer_id AND user_id = auth.uid()) OR auth.jwt().role = 'admin'
);

-- Orders policies
CREATE POLICY orders_select_own ON orders FOR SELECT USING (auth.uid() = user_id OR auth.jwt().role = 'admin');
CREATE POLICY orders_insert_own ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY orders_update_own ON orders FOR UPDATE USING (auth.uid() = user_id OR auth.jwt().role = 'admin');

-- Order items policies
CREATE POLICY order_items_select_own ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid()) OR auth.jwt().role = 'admin'
);
CREATE POLICY order_items_insert_own ON order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid())
);

-- Payments policies
CREATE POLICY payments_select_own ON payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid()) OR auth.jwt().role = 'admin'
);
CREATE POLICY payments_insert_own ON payments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid())
);

-- Reviews policies
CREATE POLICY reviews_select_all ON reviews FOR SELECT USING (true);
CREATE POLICY reviews_insert_own ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY reviews_update_own ON reviews FOR UPDATE USING (auth.uid() = user_id OR auth.jwt().role = 'admin');
CREATE POLICY reviews_delete_own ON reviews FOR DELETE USING (auth.uid() = user_id OR auth.jwt().role = 'admin');
