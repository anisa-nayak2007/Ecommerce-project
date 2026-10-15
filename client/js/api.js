// Decoupled API Client & Service Adapter
// Seamlessly handles mock data for Frontend-First iteration, and routes to Express REST API once backend is live

import { CONFIG } from "./config.js";
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_PROMO_CODES, MOCK_ORDERS } from "./mockData.js";

// Helper to get mutable local store state
function getLocalStore() {
  const stored = localStorage.getItem("anisa_products");
  if (!stored) {
    localStorage.setItem("anisa_products", JSON.stringify(MOCK_PRODUCTS));
    return MOCK_PRODUCTS;
  }
  return JSON.parse(stored);
}

function saveLocalProducts(products) {
  localStorage.setItem("anisa_products", JSON.stringify(products));
}

function getLocalOrders() {
  const stored = localStorage.getItem("anisa_orders");
  if (!stored) {
    localStorage.setItem("anisa_orders", JSON.stringify(MOCK_ORDERS));
    return MOCK_ORDERS;
  }
  return JSON.parse(stored);
}

function saveLocalOrders(orders) {
  localStorage.setItem("anisa_orders", JSON.stringify(orders));
}

// User Profile Default Mock
const DEFAULT_USER_PROFILE = {
  name: "Sophia Reynolds",
  email: "sophia.r@example.com",
  phone: "+1 (555) 234-5678",
  memberTier: "Atelier Connoisseur",
  memberSince: "November 2024",
  loyaltyPoints: 480,
  sizingPreferences: {
    topSize: "S",
    trouserSize: "32",
    fitPreference: "Relaxed / Oversized",
    measurementUnit: "inches"
  },
  savedAddresses: [
    {
      id: 1,
      title: "Primary Residence",
      name: "Sophia Reynolds",
      address: "742 Evergreen Terrace, Apt 4B",
      city: "Brooklyn",
      state: "New York",
      postalCode: "11201",
      country: "United States",
      isDefault: true
    },
    {
      id: 2,
      title: "Design Studio",
      name: "Sophia Reynolds",
      address: "185 Mercer St, Floor 5",
      city: "New York",
      state: "New York",
      postalCode: "10012",
      country: "United States",
      isDefault: false
    }
  ],
  savedPaymentMethods: [
    {
      id: 1,
      brand: "Mastercard",
      last4: "4242",
      exp: "12/28",
      isDefault: true
    }
  ]
};

function getLocalUserProfile() {
  const stored = localStorage.getItem("anisa_user_profile");
  if (!stored) {
    localStorage.setItem("anisa_user_profile", JSON.stringify(DEFAULT_USER_PROFILE));
    return DEFAULT_USER_PROFILE;
  }
  return JSON.parse(stored);
}

function saveLocalUserProfile(profile) {
  localStorage.setItem("anisa_user_profile", JSON.stringify(profile));
}

export const API = {
  // 1. Fetch Products with Filters & Sorting
  async getProducts(params = {}) {
    if (CONFIG.USE_MOCK_API) {
      await new Promise(r => setTimeout(r, 60));
      let products = [...getLocalStore()];

      if (params.category && params.category !== "all") {
        products = products.filter(p => p.categorySlug === params.category || p.category.toLowerCase() === params.category.toLowerCase());
      }

      if (params.gender && params.gender !== "all") {
        products = products.filter(p => p.gender === params.gender || p.gender === "unisex");
      }

      if (params.search) {
        const query = params.search.toLowerCase().trim();
        products = products.filter(p => 
          p.title.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
        );
      }

      if (params.inStockOnly) {
        products = products.filter(p => p.variants.some(v => v.stock > 0));
      }

      if (params.maxPrice) {
        products = products.filter(p => p.basePrice <= parseFloat(params.maxPrice));
      }

      if (params.sortBy) {
        switch (params.sortBy) {
          case "price-asc":
            products.sort((a, b) => a.basePrice - b.basePrice);
            break;
          case "price-desc":
            products.sort((a, b) => b.basePrice - a.basePrice);
            break;
          case "newest":
            products.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
            break;
          case "featured":
          default:
            products.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
            break;
        }
      }

      return { success: true, data: products };
    }

    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${CONFIG.API_BASE_URL}/products?${query}`);
    return await res.json();
  },

  // 2. Fetch Single Product by Slug
  async getProductBySlug(slug) {
    if (CONFIG.USE_MOCK_API) {
      await new Promise(r => setTimeout(r, 50));
      const products = getLocalStore();
      const product = products.find(p => p.slug === slug || p.id === parseInt(slug));
      if (!product) return { success: false, message: "Product not found" };
      return { success: true, data: product };
    }

    const res = await fetch(`${CONFIG.API_BASE_URL}/products/${slug}`);
    return await res.json();
  },

  // 3. Fetch Categories
  async getCategories() {
    if (CONFIG.USE_MOCK_API) {
      return { success: true, data: MOCK_CATEGORIES };
    }
    const res = await fetch(`${CONFIG.API_BASE_URL}/categories`);
    return await res.json();
  },

  // 4. Validate Promo Code
  async validatePromoCode(code, subtotal) {
    if (CONFIG.USE_MOCK_API) {
      const cleanCode = (code || "").trim().toUpperCase();
      const promo = MOCK_PROMO_CODES[cleanCode];
      if (!promo) {
        return { success: false, message: "Invalid or expired promo code" };
      }
      if (subtotal < promo.minSpend) {
        return { success: false, message: `Minimum spend of $${promo.minSpend.toFixed(2)} required for this code` };
      }
      return { success: true, data: { code: cleanCode, ...promo } };
    }

    const res = await fetch(`${CONFIG.API_BASE_URL}/promos/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, subtotal })
    });
    return await res.json();
  },

  // 5. Submit Order & Deduct Stock
  async createOrder(orderPayload) {
    if (CONFIG.USE_MOCK_API) {
      await new Promise(r => setTimeout(r, 120));
      const products = getLocalStore();

      for (const item of orderPayload.items) {
        for (const prod of products) {
          const variant = prod.variants.find(v => v.id === item.variantId || v.sku === item.sku);
          if (variant) {
            if (variant.stock < item.quantity) {
              return { success: false, message: `Insufficient stock for ${prod.title} (${item.color}, ${item.size})` };
            }
            variant.stock -= item.quantity;
          }
        }
      }

      saveLocalProducts(products);

      const orderNumber = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const newOrder = {
        orderNumber,
        date: new Date().toISOString(),
        customer: orderPayload.customer,
        shippingAddress: `${orderPayload.shipping.address}, ${orderPayload.shipping.city}, ${orderPayload.shipping.postalCode}`,
        items: orderPayload.items,
        subtotal: orderPayload.subtotal,
        discount: orderPayload.discount || 0,
        shipping: orderPayload.shippingFee || 0,
        tax: orderPayload.tax || 0,
        total: orderPayload.total,
        status: "processing",
        trackingCarrier: "FedEx Express Priority",
        trackingNumber: `FX-${Math.floor(1000000000 + Math.random() * 9000000000)}`
      };

      const orders = getLocalOrders();
      orders.unshift(newOrder);
      saveLocalOrders(orders);

      return { success: true, data: newOrder };
    }

    const res = await fetch(`${CONFIG.API_BASE_URL}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload)
    });
    return await res.json();
  },

  // 6. Fetch Order by Number
  async getOrder(orderNumber) {
    if (CONFIG.USE_MOCK_API) {
      await new Promise(r => setTimeout(r, 50));
      const orders = getLocalOrders();
      const order = orders.find(o => o.orderNumber === orderNumber);
      if (!order) return { success: false, message: "Order not found" };
      return { success: true, data: order };
    }

    const res = await fetch(`${CONFIG.API_BASE_URL}/orders/${orderNumber}`);
    return await res.json();
  },

  // 7. User Profile Management
  async getUserProfile() {
    if (CONFIG.USE_MOCK_API) {
      return { success: true, data: getLocalUserProfile() };
    }
    const res = await fetch(`${CONFIG.API_BASE_URL}/user/profile`);
    return await res.json();
  },

  async updateUserProfile(updatedFields) {
    if (CONFIG.USE_MOCK_API) {
      const current = getLocalUserProfile();
      const updated = { ...current, ...updatedFields };
      saveLocalUserProfile(updated);
      return { success: true, data: updated };
    }
    const res = await fetch(`${CONFIG.API_BASE_URL}/user/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedFields)
    });
    return await res.json();
  },

  async getUserOrders() {
    if (CONFIG.USE_MOCK_API) {
      return { success: true, data: getLocalOrders() };
    }
    const res = await fetch(`${CONFIG.API_BASE_URL}/user/orders`);
    return await res.json();
  },

  // 8. Admin: Get Orders
  async adminGetOrders() {
    if (CONFIG.USE_MOCK_API) {
      return { success: true, data: getLocalOrders() };
    }
    const res = await fetch(`${CONFIG.API_BASE_URL}/admin/orders`);
    return await res.json();
  },

  // 9. Admin: Update Order Status
  async adminUpdateOrderStatus(orderNumber, status) {
    if (CONFIG.USE_MOCK_API) {
      const orders = getLocalOrders();
      const order = orders.find(o => o.orderNumber === orderNumber);
      if (order) {
        order.status = status;
        saveLocalOrders(orders);
        return { success: true, data: order };
      }
      return { success: false, message: "Order not found" };
    }

    const res = await fetch(`${CONFIG.API_BASE_URL}/admin/orders/${orderNumber}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    return await res.json();
  },

  // 10. Admin: Update Stock
  async adminUpdateStock(variantId, newStock) {
    if (CONFIG.USE_MOCK_API) {
      const products = getLocalStore();
      let updated = false;
      for (const p of products) {
        const v = p.variants.find(item => item.id === parseInt(variantId));
        if (v) {
          v.stock = parseInt(newStock);
          updated = true;
          break;
        }
      }
      if (updated) {
        saveLocalProducts(products);
        return { success: true };
      }
      return { success: false, message: "Variant not found" };
    }

    const res = await fetch(`${CONFIG.API_BASE_URL}/admin/variants/${variantId}/stock`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock: newStock })
    });
    return await res.json();
  },

  // 11. Admin: Create Product
  async adminCreateProduct(productData) {
    if (CONFIG.USE_MOCK_API) {
      const products = getLocalStore();
      const newId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
      const slug = productData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      
      const newProduct = {
        id: newId,
        slug,
        ...productData
      };

      products.unshift(newProduct);
      saveLocalProducts(products);
      return { success: true, data: newProduct };
    }

    const res = await fetch(`${CONFIG.API_BASE_URL}/admin/products`, {
      method: "POST",
      body: productData // FormData
    });
    return await res.json();
  }
};
