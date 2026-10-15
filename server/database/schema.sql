-- SQLite3 Relational Database Schema for Apparel E-Commerce Platform
PRAGMA foreign_keys = ON;

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Master Products Table
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  gender TEXT CHECK(gender IN ('women', 'men', 'unisex')) NOT NULL DEFAULT 'unisex',
  base_price REAL NOT NULL,
  compare_at_price REAL,
  is_featured INTEGER DEFAULT 0,
  is_new INTEGER DEFAULT 0,
  rating REAL DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  description TEXT NOT NULL,
  fabric_details TEXT,
  care_instructions TEXT,
  fit_notes TEXT,
  origin_country TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- 3. Product Colorways (Links photo galleries to a specific color swatch)
CREATE TABLE IF NOT EXISTS product_colors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  color_name TEXT NOT NULL,
  color_hex TEXT NOT NULL,
  images_json TEXT NOT NULL, -- JSON Array of image URLs
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 4. Product SKU Variants (Permutation of Product x Color x Size)
CREATE TABLE IF NOT EXISTS product_variants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  color_name TEXT NOT NULL,
  size_code TEXT NOT NULL,
  price REAL NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK(stock_quantity >= 0),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 5. Customer Orders
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  subtotal REAL NOT NULL,
  discount_amount REAL DEFAULT 0,
  shipping_fee REAL DEFAULT 0,
  tax_amount REAL NOT NULL,
  total_amount REAL NOT NULL,
  status TEXT CHECK(status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')) DEFAULT 'processing',
  tracking_carrier TEXT DEFAULT 'FedEx Express Priority',
  tracking_number TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Order Line Items
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  variant_id INTEGER,
  product_title TEXT NOT NULL,
  color_name TEXT NOT NULL,
  size_code TEXT NOT NULL,
  sku TEXT NOT NULL,
  unit_price REAL NOT NULL,
  quantity INTEGER NOT NULL CHECK(quantity > 0),
  image_url TEXT,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
);

-- 7. Promo Codes
CREATE TABLE IF NOT EXISTS promo_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  discount_percent INTEGER DEFAULT 0,
  free_shipping INTEGER DEFAULT 0,
  min_spend REAL DEFAULT 0,
  description TEXT,
  is_active INTEGER DEFAULT 1
);

-- 8. User Profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  member_tier TEXT DEFAULT 'Atelier Connoisseur',
  member_since TEXT DEFAULT 'November 2024',
  loyalty_points INTEGER DEFAULT 480,
  top_size TEXT DEFAULT 'S',
  trouser_size TEXT DEFAULT '32',
  fit_preference TEXT DEFAULT 'Relaxed / Oversized',
  measurement_unit TEXT DEFAULT 'inches'
);

-- 9. Saved Addresses
CREATE TABLE IF NOT EXISTS saved_addresses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_email TEXT NOT NULL,
  title TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  postal_code TEXT NOT NULL,
  country TEXT DEFAULT 'United States',
  is_default INTEGER DEFAULT 0
);
