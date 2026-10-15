// Database Seeder - Populates SQLite3 with Initial Apparel Domain Data
const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function initializeAndSeed() {
  console.log('--- Initializing SQLite3 Database & Running Migrations ---');

  // 1. Run Schema DDL
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
  await db.exec(schemaSql);
  console.log('✓ SQLite3 schema tables created or verified.');

  // 2. Check if already seeded
  const existingCat = await db.get('SELECT COUNT(*) as count FROM categories');
  if (existingCat && existingCat.count > 0) {
    console.log('✓ Database already contains data. Skipping re-seed.');
    return;
  }

  console.log('Seeding initial apparel catalog, variants, promo codes, and profile...');

  // 3. Seed Categories
  const categories = [
    { name: 'Outerwear', slug: 'outerwear', desc: 'Structured coats, jackets, and seasonal protective tailoring.' },
    { name: 'Knitwear', slug: 'knitwear', desc: 'Heirloom Mongolian cashmere and heavyweight wool knits.' },
    { name: 'Tops & Shirts', slug: 'tops-shirts', desc: 'French flax linen shirts and dense combed organic cotton tees.' },
    { name: 'Trousers & Denim', slug: 'trousers-denim', desc: 'Reverse-pleated virgin wool trousers and selvedge denim.' },
    { name: 'Accessories', slug: 'accessories', desc: 'Tuscan vegetable-tanned leather carryalls and minimalist goods.' }
  ];

  const catMap = {};
  for (const cat of categories) {
    const res = await db.run(
      'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)',
      [cat.name, cat.slug, cat.desc]
    );
    catMap[cat.name] = res.lastID;
  }

  // 4. Seed Products, Colors, and Variants
  const products = [
    {
      title: 'Double-Breasted Wool Trench Coat',
      slug: 'double-breasted-wool-trench-coat',
      category: 'Outerwear',
      gender: 'women',
      basePrice: 285.00,
      comparePrice: 340.00,
      isFeatured: 1,
      isNew: 1,
      rating: 4.9,
      reviewCount: 38,
      desc: 'Architectural silhouette cut from heavyweight 100% melton wool. Features storm flap detailing, horn button closures, a wide notched lapel, and a belted waist that cinches for a tailored drape.',
      fabric: '100% Premium Melton Wool (650 GSM); Lining: 100% Cupro',
      care: 'Dry clean only. Store on shaped wooden hanger.',
      fit: 'Relaxed oversized cut. Model is 5\'10" (178cm) wearing size S.',
      origin: 'Tailored in Portugal',
      colors: [
        {
          name: 'Camel Dune',
          hex: '#C19A6B',
          images: [
            'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80'
          ],
          variants: [
            { sku: 'W-TRN-CAM-XS', size: 'XS', stock: 4 },
            { sku: 'W-TRN-CAM-S', size: 'S', stock: 8 },
            { sku: 'W-TRN-CAM-M', size: 'M', stock: 6 },
            { sku: 'W-TRN-CAM-L', size: 'L', stock: 2 }
          ]
        },
        {
          name: 'Obsidian Black',
          hex: '#1A1A1A',
          images: [
            'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1000&q=80'
          ],
          variants: [
            { sku: 'W-TRN-BLK-XS', size: 'XS', stock: 3 },
            { sku: 'W-TRN-BLK-S', size: 'S', stock: 5 },
            { sku: 'W-TRN-BLK-M', size: 'M', stock: 7 },
            { sku: 'W-TRN-BLK-L', size: 'L', stock: 0 }
          ]
        }
      ]
    },
    {
      title: 'Chunky Ribbed Cashmere Turtleneck',
      slug: 'chunky-ribbed-cashmere-turtleneck',
      category: 'Knitwear',
      gender: 'unisex',
      basePrice: 195.00,
      comparePrice: 230.00,
      isFeatured: 1,
      isNew: 1,
      rating: 4.8,
      reviewCount: 42,
      desc: 'An heirloom-grade knit constructed from 4-ply Mongolian cashmere. Features pronounced English fisherman ribbing, dropped shoulders, and a cozy fold-over turtleneck collar.',
      fabric: '100% Grade-A Mongolian Cashmere (4-ply)',
      care: 'Hand wash cold with wool detergent or gentle dry clean. Dry flat.',
      fit: 'Generous unisex drape. Sized for relaxed layering.',
      origin: 'Spun in Italy',
      colors: [
        {
          name: 'Oatmeal Heather',
          hex: '#D6CFC7',
          images: [
            'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1000&q=80'
          ],
          variants: [
            { sku: 'U-KNT-OAT-S', size: 'S', stock: 5 },
            { sku: 'U-KNT-OAT-M', size: 'M', stock: 9 },
            { sku: 'U-KNT-OAT-L', size: 'L', stock: 4 }
          ]
        },
        {
          name: 'Sage Green',
          hex: '#8A9A86',
          images: [
            'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=80'
          ],
          variants: [
            { sku: 'U-KNT-SGE-S', size: 'S', stock: 3 },
            { sku: 'U-KNT-SGE-M', size: 'M', stock: 6 },
            { sku: 'U-KNT-SGE-L', size: 'L', stock: 1 }
          ]
        }
      ]
    },
    {
      title: 'Heavyweight Boxy Cotton Tee',
      slug: 'heavyweight-boxy-cotton-tee',
      category: 'Tops & Shirts',
      gender: 'unisex',
      basePrice: 55.00,
      comparePrice: null,
      isFeatured: 1,
      isNew: 0,
      rating: 4.7,
      reviewCount: 95,
      desc: 'The definitive everyday boxy tee. Cut from ultra-dense 300 GSM combed organic cotton with a reinforced 1.25" ribbed collar that never sags.',
      fabric: '100% GOTS Certified Organic Combed Cotton (300 GSM)',
      care: 'Machine wash cold inside out. Hang dry or tumble dry low.',
      fit: 'Boxy, dropped shoulders with structured drape.',
      origin: 'Made in Los Angeles',
      colors: [
        {
          name: 'Chalk White',
          hex: '#F8F8F6',
          images: [
            'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80'
          ],
          variants: [
            { sku: 'U-TEE-WHT-XS', size: 'XS', stock: 12 },
            { sku: 'U-TEE-WHT-S', size: 'S', stock: 18 },
            { sku: 'U-TEE-WHT-M', size: 'M', stock: 24 },
            { sku: 'U-TEE-WHT-L', size: 'L', stock: 15 }
          ]
        },
        {
          name: 'Vintage Washed Black',
          hex: '#2B2B2B',
          images: [
            'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80'
          ],
          variants: [
            { sku: 'U-TEE-BLK-S', size: 'S', stock: 10 },
            { sku: 'U-TEE-BLK-M', size: 'M', stock: 14 },
            { sku: 'U-TEE-BLK-L', size: 'L', stock: 11 }
          ]
        }
      ]
    },
    {
      title: 'Relaxed Pleated Wool Trousers',
      slug: 'relaxed-pleated-wool-trousers',
      category: 'Trousers & Denim',
      gender: 'men',
      basePrice: 165.00,
      comparePrice: 195.00,
      isFeatured: 1,
      isNew: 1,
      rating: 4.9,
      reviewCount: 27,
      desc: 'Modern tailoring with dual front reverse pleats, extended tab waistband, and a gentle taper that breaks cleanly over loafers or chunky leather boots.',
      fabric: '100% Tropical Virgin Wool; Interior pocketing: 100% Cotton Twill',
      care: 'Dry clean only. Press with warm iron over pressing cloth.',
      fit: 'High-rise, relaxed thigh, soft ankle taper.',
      origin: 'Tailored in Italy',
      colors: [
        {
          name: 'Charcoal Melange',
          hex: '#3F4246',
          images: [
            'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80'
          ],
          variants: [
            { sku: 'M-TRS-CHR-S', size: 'S', stock: 5 },
            { sku: 'M-TRS-CHR-M', size: 'M', stock: 8 },
            { sku: 'M-TRS-CHR-L', size: 'L', stock: 4 }
          ]
        }
      ]
    },
    {
      title: 'Minimalist Italian Leather Tote',
      slug: 'minimalist-italian-leather-tote',
      category: 'Accessories',
      gender: 'unisex',
      basePrice: 220.00,
      comparePrice: 260.00,
      isFeatured: 0,
      isNew: 1,
      rating: 5.0,
      reviewCount: 16,
      desc: 'Sculpted from vegetable-tanned Tuscan full-grain leather. Unlined interior with a removable zippered clutch pouch, magnetic top clasp, and reinforced shoulder straps.',
      fabric: '100% Tuscan Full-Grain Vegetable-Tanned Cowhide',
      care: 'Wipe clean with soft microfiber cloth. Condition annually.',
      fit: 'Fits up to 16" MacBook Pro + daily essentials.',
      origin: 'Handcrafted in Florence, Italy',
      colors: [
        {
          name: 'Cognac Tan',
          hex: '#9E5B32',
          images: [
            'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80'
          ],
          variants: [
            { sku: 'U-BAG-COG-ONE', size: 'ONE SIZE', stock: 9 }
          ]
        }
      ]
    }
  ];

  for (const prod of products) {
    const categoryId = catMap[prod.category];
    const pRes = await db.run(
      `INSERT INTO products (
        category_id, title, slug, gender, base_price, compare_at_price, 
        is_featured, is_new, rating, review_count, description, 
        fabric_details, care_instructions, fit_notes, origin_country
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        categoryId, prod.title, prod.slug, prod.gender, prod.basePrice,
        prod.comparePrice, prod.isFeatured, prod.isNew, prod.rating,
        prod.reviewCount, prod.desc, prod.fabric, prod.care, prod.fit, prod.origin
      ]
    );

    const productId = pRes.lastID;

    for (const color of prod.colors) {
      await db.run(
        `INSERT INTO product_colors (product_id, color_name, color_hex, images_json)
         VALUES (?, ?, ?, ?)`,
        [productId, color.name, color.hex, JSON.stringify(color.images)]
      );

      for (const variant of color.variants) {
        await db.run(
          `INSERT INTO product_variants (
            product_id, sku, color_name, size_code, price, stock_quantity
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [productId, variant.sku, color.name, variant.size, prod.basePrice, variant.stock]
        );
      }
    }
  }

  // 5. Seed Promo Codes
  const promos = [
    { code: 'SAVE15', discount: 15, freeShip: 0, minSpend: 50.00, desc: '15% off orders over $50' },
    { code: 'WELCOME10', discount: 10, freeShip: 0, minSpend: 0.00, desc: '10% off your entire order' },
    { code: 'FREESHIP', discount: 0, freeShip: 1, minSpend: 0.00, desc: 'Complimentary Express Delivery' }
  ];

  for (const promo of promos) {
    await db.run(
      'INSERT INTO promo_codes (code, discount_percent, free_shipping, min_spend, description) VALUES (?, ?, ?, ?, ?)',
      [promo.code, promo.discount, promo.freeShip, promo.minSpend, promo.desc]
    );
  }

  // 6. Seed Default User Profile & Saved Addresses
  await db.run(
    `INSERT INTO user_profiles (
      name, email, phone, member_tier, member_since, loyalty_points, top_size, trouser_size, fit_preference, measurement_unit
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'Sophia Reynolds', 'sophia.r@example.com', '+1 (555) 234-5678',
      'Atelier Connoisseur', 'November 2024', 480, 'S', '32',
      'Relaxed / Oversized', 'inches'
    ]
  );

  await db.run(
    `INSERT INTO saved_addresses (user_email, title, name, address, city, state, postal_code, country, is_default)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'sophia.r@example.com', 'Primary Residence', 'Sophia Reynolds',
      '742 Evergreen Terrace, Apt 4B', 'Brooklyn', 'New York', '11201', 'United States', 1
    ]
  );

  // 7. Seed Initial Order
  const orderRes = await db.run(
    `INSERT INTO orders (
      order_number, customer_name, customer_email, shipping_address,
      subtotal, discount_amount, shipping_fee, tax_amount, total_amount,
      status, tracking_carrier, tracking_number
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'ORD-2026-7842', 'Sophia Reynolds', 'sophia.r@example.com',
      '742 Evergreen Terrace, Brooklyn, NY 11201',
      340.00, 51.00, 0.00, 23.84, 312.84,
      'processing', 'FedEx Express Priority', 'FX-9942-8812-US'
    ]
  );

  const orderId = orderRes.lastID;
  await db.run(
    `INSERT INTO order_items (
      order_id, product_title, color_name, size_code, sku, unit_price, quantity, image_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      orderId, 'Double-Breasted Wool Trench Coat', 'Camel Dune', 'S',
      'W-TRN-CAM-S', 285.00, 1,
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=200&q=80'
    ]
  );

  console.log('✓ Initial apparel database seed completed successfully!');
}

module.exports = { initializeAndSeed };
