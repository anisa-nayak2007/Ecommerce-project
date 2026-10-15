// Merchant Admin Controller (Inventory, Orders, and Local Uploads)
const db = require('../config/db');

const adminController = {
  // POST /api/admin/products
  async createProduct(req, res) {
    try {
      let productData = req.body;
      if (typeof productData === 'string') {
        productData = JSON.parse(productData);
      }

      const { title, category, gender, basePrice, description, colors, variants } = productData;

      if (!title || !basePrice) {
        return res.status(400).json({ success: false, message: 'Garment title and base price are required' });
      }

      // 1. Resolve or Insert Category
      let cat = await db.get('SELECT id FROM categories WHERE name = ?', [category || 'Outerwear']);
      let categoryId;
      if (cat) {
        categoryId = cat.id;
      } else {
        const catSlug = (category || 'uncategorized').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const cRes = await db.run('INSERT INTO categories (name, slug) VALUES (?, ?)', [category, catSlug]);
        categoryId = cRes.lastID;
      }

      // 2. Generate slug
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);

      // 3. Handle Local Uploaded Files if present
      let uploadedUrls = [];
      if (req.files && req.files.length > 0) {
        uploadedUrls = req.files.map(f => `/uploads/products/${f.filename}`);
      }

      // 4. Insert Master Product
      const pRes = await db.run(
        `INSERT INTO products (
          category_id, title, slug, gender, base_price, is_new, description
        ) VALUES (?, ?, ?, ?, ?, 1, ?)`,
        [categoryId, title, slug, gender || 'unisex', parseFloat(basePrice), description || '']
      );

      const productId = pRes.lastID;

      // 5. Insert Colorways
      const colorsList = Array.isArray(colors) ? colors : [];
      if (colorsList.length === 0) {
        // Fallback default color
        colorsList.push({
          name: 'Obsidian Black',
          hex: '#1A1A1A',
          images: uploadedUrls.length > 0 ? uploadedUrls : ['https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80']
        });
      }

      for (const c of colorsList) {
        const colorImages = (uploadedUrls.length > 0 && (!c.images || c.images.length === 0))
          ? uploadedUrls 
          : (c.images || ['https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80']);

        await db.run(
          `INSERT INTO product_colors (product_id, color_name, color_hex, images_json)
           VALUES (?, ?, ?, ?)`,
          [productId, c.name, c.hex || '#000000', JSON.stringify(colorImages)]
        );
      }

      // 6. Insert SKU Variants
      const variantsList = Array.isArray(variants) ? variants : [];
      for (const v of variantsList) {
        await db.run(
          `INSERT INTO product_variants (
            product_id, sku, color_name, size_code, price, stock_quantity
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [productId, v.sku, v.color, v.size, parseFloat(v.price || basePrice), parseInt(v.stock || 0)]
        );
      }

      res.status(201).json({
        success: true,
        data: {
          id: productId,
          title,
          slug
        }
      });
    } catch (err) {
      console.error('Error creating product in admin:', err);
      res.status(500).json({ success: false, message: 'Server error creating product: ' + err.message });
    }
  },

  // PUT /api/admin/variants/:variantId/stock
  async updateStock(req, res) {
    try {
      const { variantId } = req.params;
      const { stock } = req.body;

      if (stock === undefined || isNaN(parseInt(stock))) {
        return res.status(400).json({ success: false, message: 'Valid stock quantity is required' });
      }

      const result = await db.run(
        'UPDATE product_variants SET stock_quantity = ? WHERE id = ?',
        [parseInt(stock), parseInt(variantId)]
      );

      if (result.changes === 0) {
        return res.status(404).json({ success: false, message: 'Variant not found' });
      }

      res.json({ success: true, message: 'Inventory updated' });
    } catch (err) {
      console.error('Error updating stock count:', err);
      res.status(500).json({ success: false, message: 'Server error updating stock count' });
    }
  },

  // GET /api/admin/orders
  async getOrders(req, res) {
    try {
      const orders = await db.all('SELECT * FROM orders ORDER BY id DESC');
      const structured = [];

      for (const o of orders) {
        const items = await db.all('SELECT * FROM order_items WHERE order_id = ?', [o.id]);
        structured.push({
          orderNumber: o.order_number,
          date: o.created_at,
          customer: { name: o.customer_name, email: o.customer_email },
          shippingAddress: o.shipping_address,
          subtotal: o.subtotal,
          discount: o.discount_amount,
          shipping: o.shipping_fee,
          tax: o.tax_amount,
          total: o.total_amount,
          status: o.status,
          items: items.map(i => ({
            id: i.id,
            title: i.product_title,
            color: i.color_name,
            size: i.size_code,
            sku: i.sku,
            price: i.unit_price,
            quantity: i.quantity
          }))
        });
      }

      res.json({ success: true, data: structured });
    } catch (err) {
      console.error('Error fetching admin orders:', err);
      res.status(500).json({ success: false, message: 'Server error retrieving admin orders' });
    }
  },

  // PUT /api/admin/orders/:orderNumber/status
  async updateOrderStatus(req, res) {
    try {
      const { orderNumber } = req.params;
      const { status } = req.body;

      const allowed = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!allowed.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid order fulfillment status' });
      }

      const result = await db.run(
        'UPDATE orders SET status = ? WHERE order_number = ?',
        [status, orderNumber]
      );

      if (result.changes === 0) {
        return res.status(404).json({ success: false, message: 'Order reference not found' });
      }

      res.json({ success: true, message: `Order status updated to ${status}` });
    } catch (err) {
      console.error('Error updating order status:', err);
      res.status(500).json({ success: false, message: 'Server error updating order status' });
    }
  }
};

module.exports = adminController;
