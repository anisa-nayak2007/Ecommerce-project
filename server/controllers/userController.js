// User Profile, Addresses & Customer Portal Controller
const db = require('../config/db');

const userController = {
  // GET /api/user/profile
  async getProfile(req, res) {
    try {
      const email = req.query.email || 'sophia.r@example.com';
      const user = await db.get('SELECT * FROM user_profiles WHERE email = ?', [email]);
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'User profile not found' });
      }

      const addresses = await db.all(
        'SELECT * FROM saved_addresses WHERE user_email = ? ORDER BY is_default DESC, id DESC',
        [email]
      );

      res.json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          memberTier: user.member_tier,
          memberSince: user.member_since,
          loyaltyPoints: user.loyalty_points,
          sizingPreferences: {
            topSize: user.top_size,
            trouserSize: user.trouser_size,
            fitPreference: user.fit_preference,
            measurementUnit: user.measurement_unit
          },
          savedAddresses: addresses.map(a => ({
            id: a.id,
            title: a.title,
            name: a.name,
            address: a.address,
            city: a.city,
            state: a.state,
            postalCode: a.postal_code,
            country: a.country,
            isDefault: Boolean(a.is_default)
          }))
        }
      });
    } catch (err) {
      console.error('Error fetching user profile:', err);
      res.status(500).json({ success: false, message: 'Server error retrieving profile' });
    }
  },

  // PUT /api/user/profile
  async updateProfile(req, res) {
    try {
      const { name, email, phone, sizingPreferences, savedAddresses } = req.body;
      const targetEmail = email || 'sophia.r@example.com';

      // Update basic details & sizing
      let updateFields = [];
      let params = [];

      if (name) { updateFields.push('name = ?'); params.push(name); }
      if (phone) { updateFields.push('phone = ?'); params.push(phone); }

      if (sizingPreferences) {
        if (sizingPreferences.topSize) { updateFields.push('top_size = ?'); params.push(sizingPreferences.topSize); }
        if (sizingPreferences.trouserSize) { updateFields.push('trouser_size = ?'); params.push(sizingPreferences.trouserSize); }
        if (sizingPreferences.fitPreference) { updateFields.push('fit_preference = ?'); params.push(sizingPreferences.fitPreference); }
        if (sizingPreferences.measurementUnit) { updateFields.push('measurement_unit = ?'); params.push(sizingPreferences.measurementUnit); }
      }

      if (updateFields.length > 0) {
        params.push(targetEmail);
        await db.run(
          `UPDATE user_profiles SET ${updateFields.join(', ')} WHERE email = ?`,
          params
        );
      }

      // Sync saved addresses if provided
      if (Array.isArray(savedAddresses)) {
        await db.run('DELETE FROM saved_addresses WHERE user_email = ?', [targetEmail]);
        for (const addr of savedAddresses) {
          await db.run(
            `INSERT INTO saved_addresses (
              user_email, title, name, address, city, state, postal_code, country, is_default
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              targetEmail, addr.title, addr.name, addr.address, addr.city,
              addr.state || '', addr.postalCode, addr.country || 'United States', addr.isDefault ? 1 : 0
            ]
          );
        }
      }

      res.json({ success: true, message: 'Profile updated successfully' });
    } catch (err) {
      console.error('Error updating profile:', err);
      res.status(500).json({ success: false, message: 'Server error updating profile' });
    }
  },

  // GET /api/user/orders
  async getUserOrders(req, res) {
    try {
      const email = req.query.email || 'sophia.r@example.com';
      const orders = await db.all(
        'SELECT * FROM orders WHERE customer_email = ? ORDER BY id DESC',
        [email]
      );

      const structuredOrders = [];
      for (const o of orders) {
        const items = await db.all('SELECT * FROM order_items WHERE order_id = ?', [o.id]);
        structuredOrders.push({
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
          trackingCarrier: o.tracking_carrier,
          trackingNumber: o.tracking_number,
          items: items.map(i => ({
            id: i.id,
            title: i.product_title,
            color: i.color_name,
            size: i.size_code,
            sku: i.sku,
            price: i.unit_price,
            quantity: i.quantity,
            image: i.image_url
          }))
        });
      }

      res.json({ success: true, data: structuredOrders });
    } catch (err) {
      console.error('Error fetching customer orders:', err);
      res.status(500).json({ success: false, message: 'Server error retrieving customer orders' });
    }
  }
};

module.exports = userController;
