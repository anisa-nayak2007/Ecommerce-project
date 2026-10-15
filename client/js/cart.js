// Shopping Cart State Manager & Slide-Over Drawer Controller
import { CONFIG } from "./config.js";

const CART_STORAGE_KEY = "anisa_cart_items";

export class CartManager {
  constructor() {
    this.items = this.loadCart();
    this.initDrawer();
  }

  loadCart() {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to load cart from storage:", e);
      return [];
    }
  }

  saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items));
    this.updateUI();
    window.dispatchEvent(new CustomEvent("cart:updated", { detail: { items: this.items } }));
  }

  getItems() {
    return this.items;
  }

  getItemCount() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  getSubtotal() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  addItem(product, variant, quantity = 1, selectedImage = null) {
    const existingIndex = this.items.findIndex(
      item => item.productId === product.id && item.variantId === variant.id
    );

    const image = selectedImage || (product.colors && product.colors[0]?.images[0]) || "";

    if (existingIndex > -1) {
      const newQty = this.items[existingIndex].quantity + quantity;
      if (newQty > variant.stock) {
        this.showToast(`Only ${variant.stock} available in stock for this size.`, true);
        return false;
      }
      this.items[existingIndex].quantity = newQty;
    } else {
      if (quantity > variant.stock) {
        this.showToast(`Only ${variant.stock} available in stock.`, true);
        return false;
      }
      this.items.push({
        productId: product.id,
        variantId: variant.id,
        sku: variant.sku,
        title: product.title,
        slug: product.slug,
        category: product.category,
        color: variant.color,
        size: variant.size,
        price: variant.price || product.basePrice,
        image: image,
        quantity: quantity,
        maxStock: variant.stock
      });
    }

    this.saveCart();
    this.showToast(`Added to Bag: ${product.title} (${variant.size})`);
    this.openDrawer();
    return true;
  }

  updateQuantity(variantId, newQuantity) {
    const index = this.items.findIndex(item => item.variantId === variantId);
    if (index > -1) {
      if (newQuantity <= 0) {
        this.removeItem(variantId);
        return;
      }
      if (newQuantity > this.items[index].maxStock) {
        this.showToast(`Maximum available stock is ${this.items[index].maxStock}`, true);
        return;
      }
      this.items[index].quantity = newQuantity;
      this.saveCart();
    }
  }

  removeItem(variantId) {
    this.items = this.items.filter(item => item.variantId !== variantId);
    this.saveCart();
  }

  clearCart() {
    this.items = [];
    this.saveCart();
  }

  initDrawer() {
    // Check if cart drawer DOM elements exist
    this.updateUI();
  }

  updateUI() {
    // 1. Update Navbar Badges
    const badgeElements = document.querySelectorAll(".cart-badge-count");
    const count = this.getItemCount();
    badgeElements.forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? "flex" : "none";
    });

    // 2. Render Drawer Items if Drawer Exists
    const drawerContainer = document.getElementById("cartDrawerItems");
    const subtotalEl = document.getElementById("cartDrawerSubtotal");
    const freeShippingText = document.getElementById("freeShippingText");
    const freeShippingProgress = document.getElementById("freeShippingProgress");
    const emptyState = document.getElementById("cartDrawerEmpty");
    const footerEl = document.getElementById("cartDrawerFooter");

    if (!drawerContainer) return;

    if (this.items.length === 0) {
      drawerContainer.innerHTML = "";
      if (emptyState) emptyState.classList.remove("d-none");
      if (footerEl) footerEl.classList.add("d-none");
      if (freeShippingText) freeShippingText.textContent = `Add $${CONFIG.FREE_SHIPPING_THRESHOLD.toFixed(2)} to qualify for Free Shipping`;
      if (freeShippingProgress) freeShippingProgress.style.width = "0%";
      return;
    }

    if (emptyState) emptyState.classList.add("d-none");
    if (footerEl) footerEl.classList.remove("d-none");

    const subtotal = this.getSubtotal();
    if (subtotalEl) subtotalEl.textContent = `${CONFIG.CURRENCY_SYMBOL}${subtotal.toFixed(2)}`;

    // Free shipping calculation
    const threshold = CONFIG.FREE_SHIPPING_THRESHOLD;
    if (freeShippingText && freeShippingProgress) {
      if (subtotal >= threshold) {
        freeShippingText.innerHTML = `<strong>You've unlocked Free Standard Shipping!</strong> 🎉`;
        freeShippingProgress.style.width = "100%";
      } else {
        const remaining = threshold - subtotal;
        const percent = Math.min((subtotal / threshold) * 100, 100);
        freeShippingText.innerHTML = `Add <strong>${CONFIG.CURRENCY_SYMBOL}${remaining.toFixed(2)}</strong> more to get <strong>Free Delivery</strong>`;
        freeShippingProgress.style.width = `${percent}%`;
      }
    }

    // Render list
    drawerContainer.innerHTML = this.items.map(item => `
      <div class="cart-item" data-variant-id="${item.variantId}">
        <img src="${item.image}" alt="${item.title}" class="cart-item-img">
        <div class="cart-item-info">
          <div class="d-flex justify-content-between align-items-start">
            <a href="product.html?slug=${item.slug}" class="cart-item-title text-truncate">${item.title}</a>
            <button class="cart-item-remove" data-action="remove" data-id="${item.variantId}" title="Remove item">
              <i class="bi bi-trash3"></i>
            </button>
          </div>
          <div class="cart-item-specs">${item.color} / Size ${item.size}</div>
          <div class="d-flex justify-content-between align-items-center mt-2">
            <div class="cart-item-qty">
              <button class="qty-btn" data-action="decrease" data-id="${item.variantId}">-</button>
              <span class="qty-val">${item.quantity}</span>
              <button class="qty-btn" data-action="increase" data-id="${item.variantId}">+</button>
            </div>
            <div class="fw-bold">${CONFIG.CURRENCY_SYMBOL}${(item.price * item.quantity).toFixed(2)}</div>
          </div>
        </div>
      </div>
    `).join("");

    // Attach listeners inside drawer
    drawerContainer.querySelectorAll("[data-action]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const action = e.currentTarget.dataset.action;
        const variantId = parseInt(e.currentTarget.dataset.id);
        const item = this.items.find(i => i.variantId === variantId);
        if (!item) return;

        if (action === "remove") {
          this.removeItem(variantId);
        } else if (action === "increase") {
          this.updateQuantity(variantId, item.quantity + 1);
        } else if (action === "decrease") {
          this.updateQuantity(variantId, item.quantity - 1);
        }
      });
    });
  }

  openDrawer() {
    const drawerEl = document.getElementById("cartOffcanvas");
    if (drawerEl && window.bootstrap) {
      const bsOffcanvas = bootstrap.Offcanvas.getOrCreateInstance(drawerEl);
      bsOffcanvas.show();
    }
  }

  showToast(message, isError = false) {
    let toast = document.getElementById("appGlobalToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "appGlobalToast";
      toast.className = "custom-toast";
      document.body.appendChild(toast);
    }

    toast.style.background = isError ? "var(--color-danger)" : "var(--color-obsidian)";
    toast.innerHTML = `
      <i class="bi ${isError ? 'bi-exclamation-circle' : 'bi-bag-check'} fs-5"></i>
      <span>${message}</span>
    `;
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 3200);
  }
}

// Global Singleton Instance
export const cart = new CartManager();
