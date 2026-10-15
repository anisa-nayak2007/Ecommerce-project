// Order & Checkout Processing Controller
const db = require('../config/db');

const orderController = {
  // POST /api/checkout
  async createOrder(req, res) {
    try {
      const { customer, shipping, items, subtotal, discount, shippingFee, tax, total } = req.body;

      if (!items || items.length === 0) {
        return res.status(400).json({ success: false, message: 'Shopping bag is empty' });
      }

      if (!customer?.name || !customer?.email || !shipping?.address) {
        return res.status(400).json({ success: false, message: 'Missing required customer or shipping details' });
      }

      // 1. Verify Stock for all items
      for (const item of items) {
        const variant = await db.get(
          'SELECT * FROM product_variants WHERE id = ? OR sku = ?',
          [item.variantId || 0, item.sku || '']
        );

        if (!variant) {
          return res.status(400).json({
            success: false,
            message: `Garment variant not found: ${item.title} (${item.size})`
          });
        }

        if (variant.stock_quantity < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient inventory for ${item.title} (${variant.color_name}, ${variant.size_code}). Only ${variant.stock_quantity} left.`
          });
        }
      }

      // 2. Atomic Inventory Decrement
      for (const item of items) {
        await db.run(
          `UPDATE product_variants 
           SET stock_quantity = stock_quantity - ? 
           WHERE (id = ? OR sku = ?) AND stock_quantity >= ?`,
          [item.quantity, item.variantId || 0, item.sku || '', item.quantity]
        );
      }

      // 3. Create Master Order Record
      const orderNumber = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const shippingAddressStr = `${shipping.address}, ${shipping.city}, ${shipping.postalCode}`;
      const trackingNumber = `FX-${Math.floor(1000000000 + Math.random() * 9000000000)}-US`;

      const orderInsert = await db.run(
        `INSERT INTO orders (
          order_number, customer_name, customer_email, shipping_address,
          subtotal, discount_amount, shipping_fee, tax_amount, total_amount,
          status, tracking_carrier, tracking_number
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderNumber, customer.name, customer.email, shippingAddressStr,
          subtotal, discount || 0, shippingFee || 0, tax, total,
          'processing', 'FedEx Express Priority', trackingNumber
        ]
      );

      const orderId = orderInsert.lastID;

      // 4. Create Line Item Records
      for (const item of items) {
        await db.run(
          `INSERT INTO order_items (
            order_id, variant_id, product_title, color_name, size_code, sku, unit_price, quantity, image_url
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId, item.variantId || null, item.title, item.color,
            item.size, item.sku || 'SKU-TEMP', item.price, item.quantity, item.image
          ]
        );
      }

      // 5. Fetch completed order
      const completedOrder = await db.get('SELECT * FROM orders WHERE id = ?', [orderId]);
      const orderItems = await db.all('SELECT * FROM order_items WHERE order_id = ?', [orderId]);

      res.status(201).json({
        success: true,
        data: {
          orderNumber: completedOrder.order_number,
          date: completedOrder.created_at,
          customer: {
            name: completedOrder.customer_name,
            email: completedOrder.customer_email
          },
          shippingAddress: completedOrder.shipping_address,
          subtotal: completedOrder.subtotal,
          discount: completedOrder.discount_amount,
          shipping: completedOrder.shipping_fee,
          tax: completedOrder.tax_amount,
          total: completedOrder.total_amount,
          status: completedOrder.status,
          trackingCarrier: completedOrder.tracking_carrier,
          trackingNumber: completedOrder.tracking_number,
          items: orderItems.map(i => ({
            id: i.id,
            title: i.product_title,
            color: i.color_name,
            size: i.size_code,
            sku: i.sku,
            price: i.unit_price,
            quantity: i.quantity,
            image: i.image_url
          }))
        }
      });
    } catch (err) {
      console.error('Error processing checkout:', err);
      res.status(500).json({ success: false, message: 'Server error processing order' });
    }
  },

  // GET /api/orders/:orderNumber
  async getOrder(req, res) {
    try {
      const { orderNumber } = req.params;

      const order = await db.get('SELECT * FROM orders WHERE order_number = ?', [orderNumber]);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order reference not found' });
      }

      const items = await db.all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);

      res.json({
        success: true,
        data: {
          orderNumber: order.order_number,
          date: order.created_at,
          customer: {
            name: order.customer_name,
            email: order.customer_email
          },
          shippingAddress: order.shipping_address,
          subtotal: order.subtotal,
          discount: order.discount_amount,
          shipping: order.shipping_fee,
          tax: order.tax_amount,
          total: order.total_amount,
          status: order.status,
          trackingCarrier: order.tracking_carrier,
          trackingNumber: order.tracking_number,
          items: items.map(i => ({
            title: i.product_title,
            color: i.color_name,
            size: i.size_code,
            sku: i.sku,
            price: i.unit_price,
            quantity: i.quantity,
            image: i.image_url
          }))
        }
      });
    } catch (err) {
      console.error('Error fetching order:', err);
      res.status(500).json({ success: false, message: 'Server error retrieving order receipt' });
    }
  }
};

module.exports = orderController;
