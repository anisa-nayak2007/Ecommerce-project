// Product & Catalog REST API Controller
const db = require('../config/db');

// Helper to structure product with nested colors & variants
async function populateProductRelations(products) {
  if (!products || products.length === 0) return [];

  const productIds = products.map(p => p.id);
  const placeholders = productIds.map(() => '?').join(',');

  const colors = await db.all(
    `SELECT * FROM product_colors WHERE product_id IN (${placeholders})`,
    productIds
  );

  const variants = await db.all(
    `SELECT * FROM product_variants WHERE product_id IN (${placeholders})`,
    productIds
  );

  // Group by product_id
  const colorMap = {};
  colors.forEach(c => {
    if (!colorMap[c.product_id]) colorMap[c.product_id] = [];
    colorMap[c.product_id].push({
      id: c.id,
      name: c.color_name,
      hex: c.color_hex,
      images: JSON.parse(c.images_json || '[]')
    });
  });

  const variantMap = {};
  variants.forEach(v => {
    if (!variantMap[v.product_id]) variantMap[v.product_id] = [];
    variantMap[v.product_id].push({
      id: v.id,
      sku: v.sku,
      color: v.color_name,
      size: v.size_code,
      price: v.price,
      stock: v.stock_quantity
    });
  });

  return products.map(p => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    category: p.category_name,
    categorySlug: p.category_slug,
    gender: p.gender,
    basePrice: p.base_price,
    compareAtPrice: p.compare_at_price,
    isFeatured: Boolean(p.is_featured),
    isNew: Boolean(p.is_new),
    rating: p.rating,
    reviewCount: p.review_count,
    description: p.description,
    details: {
      fabric: p.fabric_details,
      care: p.care_instructions,
      fit: p.fit_notes,
      origin: p.origin_country
    },
    colors: colorMap[p.id] || [],
    variants: variantMap[p.id] || []
  }));
}

const productController = {
  // GET /api/products
  async getProducts(req, res) {
    try {
      const { category, gender, search, maxPrice, inStockOnly, sortBy } = req.query;

      let sql = `
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = 1
      `;
      const params = [];

      if (category && category !== 'all') {
        sql += ` AND (c.slug = ? OR LOWER(c.name) = ?)`;
        params.push(category, category.toLowerCase());
      }

      if (gender && gender !== 'all') {
        sql += ` AND (p.gender = ? OR p.gender = 'unisex')`;
        params.push(gender);
      }

      if (search) {
        sql += ` AND (LOWER(p.title) LIKE ? OR LOWER(p.description) LIKE ?)`;
        const q = `%${search.toLowerCase().trim()}%`;
        params.push(q, q);
      }

      if (maxPrice) {
        sql += ` AND p.base_price <= ?`;
        params.push(parseFloat(maxPrice));
      }

      if (inStockOnly === 'true' || inStockOnly === true) {
        sql += ` AND EXISTS (
          SELECT 1 FROM product_variants pv 
          WHERE pv.product_id = p.id AND pv.stock_quantity > 0
        )`;
      }

      // Sorting
      if (sortBy === 'price-asc') {
        sql += ` ORDER BY p.base_price ASC`;
      } else if (sortBy === 'price-desc') {
        sql += ` ORDER BY p.base_price DESC`;
      } else if (sortBy === 'newest') {
        sql += ` ORDER BY p.is_new DESC, p.id DESC`;
      } else {
        sql += ` ORDER BY p.is_featured DESC, p.id DESC`;
      }

      const rows = await db.all(sql, params);
      const structuredProducts = await populateProductRelations(rows);

      res.json({ success: true, data: structuredProducts });
    } catch (err) {
      console.error('Error fetching products:', err);
      res.status(500).json({ success: false, message: 'Server error retrieving products' });
    }
  },

  // GET /api/products/:slug
  async getProductBySlug(req, res) {
    try {
      const { slug } = req.params;

      const sql = `
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE (p.slug = ? OR p.id = ?) AND p.is_active = 1
      `;
      const row = await db.get(sql, [slug, parseInt(slug) || 0]);

      if (!row) {
        return res.status(404).json({ success: false, message: 'Garment not found' });
      }

      const [structured] = await populateProductRelations([row]);
      res.json({ success: true, data: structured });
    } catch (err) {
      console.error('Error fetching product by slug:', err);
      res.status(500).json({ success: false, message: 'Server error retrieving garment details' });
    }
  },

  // GET /api/categories
  async getCategories(req, res) {
    try {
      const sql = `
        SELECT c.*, COUNT(p.id) as count
        FROM categories c
        LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1
        GROUP BY c.id
        ORDER BY c.id ASC
      `;
      const rows = await db.all(sql);
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error('Error fetching categories:', err);
      res.status(500).json({ success: false, message: 'Server error retrieving categories' });
    }
  },

  // POST /api/promos/validate
  async validatePromo(req, res) {
    try {
      const { code, subtotal } = req.body;
      const cleanCode = (code || '').trim().toUpperCase();

      const promo = await db.get(
        'SELECT * FROM promo_codes WHERE code = ? AND is_active = 1',
        [cleanCode]
      );

      if (!promo) {
        return res.status(400).json({ success: false, message: 'Invalid or expired promo code' });
      }

      const currentSubtotal = parseFloat(subtotal) || 0;
      if (currentSubtotal < promo.min_spend) {
        return res.status(400).json({
          success: false,
          message: `Minimum spend of $${promo.min_spend.toFixed(2)} required for this code`
        });
      }

      res.json({
        success: true,
        data: {
          code: promo.code,
          discountPercent: promo.discount_percent,
          freeShipping: Boolean(promo.free_shipping),
          minSpend: promo.min_spend,
          description: promo.description
        }
      });
    } catch (err) {
      console.error('Error validating promo code:', err);
      res.status(500).json({ success: false, message: 'Server error validating code' });
    }
  }
};

module.exports = productController;
