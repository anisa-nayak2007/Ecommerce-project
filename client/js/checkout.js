// Checkout & Order Placement Controller
import { API } from "./api.js";
import { cart } from "./cart.js";
import { CONFIG } from "./config.js";

class CheckoutController {
  constructor() {
    this.items = cart.getItems();
    this.appliedPromo = null;
    this.selectedShippingFee = CONFIG.STANDARD_SHIPPING_FEE;
    this.init();
  }

  init() {
    if (this.items.length === 0) {
      this.renderEmptyCheckout();
      return;
    }

    this.renderSummary();
    this.bindEvents();
  }

  renderEmptyCheckout() {
    const main = document.getElementById("checkoutMainContainer");
    if (main) {
      main.innerHTML = `
        <div class="container py-5 text-center my-5">
          <i class="bi bi-bag-x fs-1 text-muted mb-3 d-block"></i>
          <h2 class="font-editorial mb-3">Your Shopping Bag is Empty</h2>
          <p class="text-muted mb-4">Please add garments to your bag before proceeding to checkout.</p>
          <a href="index.html" class="btn btn-luxury-dark">Explore Our Collection</a>
        </div>
      `;
    }
  }

  renderSummary() {
    const listEl = document.getElementById("checkoutItemList");
    const subtotalEl = document.getElementById("checkoutSubtotal");
    const discountRow = document.getElementById("checkoutDiscountRow");
    const discountEl = document.getElementById("checkoutDiscount");
    const shippingEl = document.getElementById("checkoutShipping");
    const taxEl = document.getElementById("checkoutTax");
    const grandTotalEl = document.getElementById("checkoutGrandTotal");

    if (!listEl) return;

    // Line items list
    listEl.innerHTML = this.items.map(item => `
      <div class="d-flex gap-3 align-items-center mb-3 pb-3 border-bottom">
        <div class="position-relative">
          <img src="${item.image}" alt="${item.title}" class="rounded" style="width: 58px; height: 75px; object-fit: cover;">
          <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-dark">
            ${item.quantity}
          </span>
        </div>
        <div class="flex-grow-1 min-w-0">
          <h6 class="mb-0 text-truncate font-sans small fw-bold">${item.title}</h6>
          <span class="text-muted small">${item.color} / ${item.size}</span>
        </div>
        <div class="fw-bold small text-nowrap">
          ${CONFIG.CURRENCY_SYMBOL}${(item.price * item.quantity).toFixed(2)}
        </div>
      </div>
    `).join("");

    const subtotal = cart.getSubtotal();
    subtotalEl.textContent = `${CONFIG.CURRENCY_SYMBOL}${subtotal.toFixed(2)}`;

    // Auto free shipping check
    const isFreeStandard = subtotal >= CONFIG.FREE_SHIPPING_THRESHOLD;
    const standardRadio = document.getElementById("shippingStandardRadio");
    const standardLabel = document.getElementById("shippingStandardLabel");
    if (standardLabel) {
      standardLabel.textContent = isFreeStandard ? "Free (Orders over $100)" : `${CONFIG.CURRENCY_SYMBOL}${CONFIG.STANDARD_SHIPPING_FEE.toFixed(2)}`;
    }

    if (standardRadio && standardRadio.checked) {
      this.selectedShippingFee = isFreeStandard ? 0 : CONFIG.STANDARD_SHIPPING_FEE;
    }

    // Discount Calculation
    let discountAmount = 0;
    if (this.appliedPromo) {
      if (this.appliedPromo.discountPercent) {
        discountAmount = subtotal * (this.appliedPromo.discountPercent / 100);
      }
      if (this.appliedPromo.freeShipping) {
        this.selectedShippingFee = 0;
      }
      if (discountRow && discountEl) {
        discountRow.classList.remove("d-none");
        discountEl.textContent = `-${CONFIG.CURRENCY_SYMBOL}${discountAmount.toFixed(2)}`;
      }
    } else {
      if (discountRow) discountRow.classList.add("d-none");
    }

    // Shipping Display
    if (shippingEl) {
      shippingEl.textContent = this.selectedShippingFee === 0 ? "FREE" : `${CONFIG.CURRENCY_SYMBOL}${this.selectedShippingFee.toFixed(2)}`;
    }

    // Tax & Total
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const tax = taxableAmount * CONFIG.TAX_RATE;
    const grandTotal = taxableAmount + this.selectedShippingFee + tax;

    if (taxEl) taxEl.textContent = `${CONFIG.CURRENCY_SYMBOL}${tax.toFixed(2)}`;
    if (grandTotalEl) grandTotalEl.textContent = `${CONFIG.CURRENCY_SYMBOL}${grandTotal.toFixed(2)}`;
  }

  bindEvents() {
    // 1. Promo Code Form
    const promoBtn = document.getElementById("applyPromoBtn");
    const promoInput = document.getElementById("promoCodeInput");
    const promoMsg = document.getElementById("promoMessage");

    if (promoBtn && promoInput) {
      promoBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        const code = promoInput.value.trim();
        if (!code) return;

        const res = await API.validatePromoCode(code, cart.getSubtotal());
        if (res.success) {
          this.appliedPromo = res.data;
          promoMsg.className = "small mt-1 text-success";
          promoMsg.textContent = `✓ Applied: ${res.data.description}`;
          this.renderSummary();
        } else {
          this.appliedPromo = null;
          promoMsg.className = "small mt-1 text-danger";
          promoMsg.textContent = res.message;
          this.renderSummary();
        }
      });
    }

    // 2. Shipping Radio Toggles
    document.querySelectorAll("input[name='shippingMethod']").forEach(radio => {
      radio.addEventListener("change", (e) => {
        const subtotal = cart.getSubtotal();
        if (e.target.value === "express") {
          this.selectedShippingFee = CONFIG.EXPRESS_SHIPPING_FEE;
        } else {
          this.selectedShippingFee = subtotal >= CONFIG.FREE_SHIPPING_THRESHOLD ? 0 : CONFIG.STANDARD_SHIPPING_FEE;
        }
        this.renderSummary();
      });
    });

    // 3. Card Number Auto-formatting
    const cardInput = document.getElementById("ccNumberInput");
    if (cardInput) {
      cardInput.addEventListener("input", (e) => {
        let val = e.target.value.replace(/\D/g, "").substring(0, 16);
        val = val.replace(/(.{4})/g, "$1 ").trim();
        e.target.value = val;
      });
    }

    // Card Expiry Formatting MM / YY
    const expiryInput = document.getElementById("ccExpiryInput");
    if (expiryInput) {
      expiryInput.addEventListener("input", (e) => {
        let val = e.target.value.replace(/\D/g, "").substring(0, 4);
        if (val.length >= 2) {
          val = val.substring(0, 2) + " / " + val.substring(2);
        }
        e.target.value = val;
      });
    }

    // 4. Submit Order
    const checkoutForm = document.getElementById("checkoutForm");
    if (checkoutForm) {
      checkoutForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        await this.handleOrderSubmit();
      });
    }
  }

  async handleOrderSubmit() {
    const placeOrderBtn = document.getElementById("placeOrderBtn");
    const name = document.getElementById("custNameInput")?.value.trim();
    const email = document.getElementById("custEmailInput")?.value.trim();
    const address = document.getElementById("custAddressInput")?.value.trim();
    const city = document.getElementById("custCityInput")?.value.trim();
    const postalCode = document.getElementById("custZipInput")?.value.trim();

    if (!name || !email || !address || !city || !postalCode) {
      alert("Please fill out all required shipping and contact details.");
      return;
    }

    if (placeOrderBtn) {
      placeOrderBtn.disabled = true;
      placeOrderBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        Processing Secure Payment...
      `;
    }

    const subtotal = cart.getSubtotal();
    let discountAmount = 0;
    if (this.appliedPromo && this.appliedPromo.discountPercent) {
      discountAmount = subtotal * (this.appliedPromo.discountPercent / 100);
    }
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const tax = taxableAmount * CONFIG.TAX_RATE;
    const total = taxableAmount + this.selectedShippingFee + tax;

    const payload = {
      customer: { name, email },
      shipping: { address, city, postalCode },
      items: this.items,
      subtotal,
      discount: discountAmount,
      shippingFee: this.selectedShippingFee,
      tax,
      total
    };

    const res = await API.createOrder(payload);

    if (res.success) {
      // Clear shopping bag
      cart.clearCart();
      // Redirect to confirmation page
      window.location.href = `order-confirmation.html?orderNumber=${res.data.orderNumber}`;
    } else {
      alert(res.message || "Failed to process order. Please try again.");
      if (placeOrderBtn) {
        placeOrderBtn.disabled = false;
        placeOrderBtn.textContent = "Place Order & Pay";
      }
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new CheckoutController();
});
