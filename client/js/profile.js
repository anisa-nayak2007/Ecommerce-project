// Customer Account & Profile Controller
import { API } from "./api.js";
import { CONFIG } from "./config.js";

class ProfileController {
  constructor() {
    this.profile = null;
    this.orders = [];
    this.init();
  }

  async init() {
    await this.loadProfileData();
    await this.loadUserOrders();
    this.bindForms();
  }

  async loadProfileData() {
    const res = await API.getUserProfile();
    if (!res.success) return;

    this.profile = res.data;

    // Header Info
    const avatarEl = document.getElementById("profileAvatarInitials");
    const nameEl = document.getElementById("profileHeaderName");
    const emailEl = document.getElementById("profileHeaderEmail");
    const tierEl = document.getElementById("profileHeaderTier");
    const pointsEl = document.getElementById("profileLoyaltyPoints");
    const memberSinceEl = document.getElementById("profileMemberSince");

    if (avatarEl) {
      const initials = this.profile.name.split(" ").map(n => n[0]).join("").toUpperCase();
      avatarEl.textContent = initials;
    }

    if (nameEl) nameEl.textContent = this.profile.name;
    if (emailEl) emailEl.textContent = this.profile.email;
    if (tierEl) tierEl.textContent = this.profile.memberTier;
    if (pointsEl) pointsEl.textContent = `${this.profile.loyaltyPoints} Pts`;
    if (memberSinceEl) memberSinceEl.textContent = `Client since ${this.profile.memberSince}`;

    // Populate Account Details Form
    const inputName = document.getElementById("accNameInput");
    const inputEmail = document.getElementById("accEmailInput");
    const inputPhone = document.getElementById("accPhoneInput");

    if (inputName) inputName.value = this.profile.name;
    if (inputEmail) inputEmail.value = this.profile.email;
    if (inputPhone) inputPhone.value = this.profile.phone || "";

    // Populate Sizing Preferences
    const topSize = document.getElementById("prefTopSize");
    const trouserSize = document.getElementById("prefTrouserSize");
    const fitPref = document.getElementById("prefFitSilhouette");

    if (topSize && this.profile.sizingPreferences?.topSize) {
      topSize.value = this.profile.sizingPreferences.topSize;
    }
    if (trouserSize && this.profile.sizingPreferences?.trouserSize) {
      trouserSize.value = this.profile.sizingPreferences.trouserSize;
    }
    if (fitPref && this.profile.sizingPreferences?.fitPreference) {
      fitPref.value = this.profile.sizingPreferences.fitPreference;
    }

    // Render Saved Addresses
    this.renderAddresses();
  }

  async loadUserOrders() {
    const listContainer = document.getElementById("profileOrdersList");
    const ordersCountEl = document.getElementById("profileOrdersCount");
    if (!listContainer) return;

    const res = await API.getUserOrders();
    if (!res.success || res.data.length === 0) {
      listContainer.innerHTML = `
        <div class="p-5 text-center bg-light rounded-1">
          <i class="bi bi-box-seam fs-1 text-muted mb-3 d-block"></i>
          <h5 class="font-editorial mb-2">No Past Orders Found</h5>
          <p class="text-muted small mb-4">When you place orders, they will appear here with live tracking and invoices.</p>
          <a href="index.html" class="btn btn-luxury-dark">Start Shopping</a>
        </div>
      `;
      if (ordersCountEl) ordersCountEl.textContent = "0";
      return;
    }

    this.orders = res.data;
    if (ordersCountEl) ordersCountEl.textContent = this.orders.length;

    listContainer.innerHTML = this.orders.map(order => {
      const statusBadge = this.getStatusBadge(order.status);
      const formattedDate = new Date(order.date).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric'
      });

      return `
        <div class="card border rounded-1 mb-4 shadow-sm">
          <div class="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <span class="text-muted small text-uppercase fw-semibold d-block">Order Reference</span>
              <strong class="font-monospace fs-6">${order.orderNumber}</strong>
            </div>
            <div>
              <span class="text-muted small text-uppercase fw-semibold d-block">Order Date</span>
              <span class="small">${formattedDate}</span>
            </div>
            <div>
              <span class="text-muted small text-uppercase fw-semibold d-block">Total Paid</span>
              <strong class="font-sans">${CONFIG.CURRENCY_SYMBOL}${order.total.toFixed(2)}</strong>
            </div>
            <div>
              ${statusBadge}
            </div>
            <div>
              <a href="order-confirmation.html?orderNumber=${order.orderNumber}" class="btn btn-sm btn-outline-dark">
                <i class="bi bi-receipt me-1"></i> View Receipt
              </a>
            </div>
          </div>
          
          <div class="card-body p-4">
            <div class="row g-3 align-items-center">
              <div class="col-md-8">
                <div class="d-flex flex-wrap gap-3">
                  ${order.items.map(item => `
                    <div class="d-flex align-items-center gap-2 border p-2 rounded bg-light" style="max-width: 280px;">
                      <img src="${item.image}" alt="${item.title}" class="rounded" style="width: 48px; height: 60px; object-fit: cover;">
                      <div class="min-w-0">
                        <div class="small fw-bold text-truncate">${item.title}</div>
                        <div class="text-muted" style="font-size: 0.72rem;">${item.color} &bull; Size ${item.size} &bull; Qty: ${item.quantity}</div>
                        <div class="small fw-semibold mt-1">${CONFIG.CURRENCY_SYMBOL}${(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                    </div>
                  `).join("")}
                </div>
              </div>
              <div class="col-md-4 text-md-end border-start-md ps-md-4">
                <span class="small text-muted d-block mb-1">Carrier Dispatch:</span>
                <div class="small fw-semibold">${order.trackingCarrier || 'FedEx Express'}</div>
                <div class="small font-monospace text-muted mb-2">${order.trackingNumber || 'FX-PENDING'}</div>
                <button type="button" class="btn btn-sm btn-link text-dark p-0 text-decoration-underline" 
                        onclick="alert('Shipment is currently in transit. Estimated delivery in 2 business days.');">
                  <i class="bi bi-geo-alt me-1"></i> Live Tracking Details
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  getStatusBadge(status) {
    switch (status) {
      case "delivered":
        return `<span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1"><i class="bi bi-check-circle me-1"></i>Delivered</span>`;
      case "shipped":
        return `<span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1"><i class="bi bi-truck me-1"></i>In Transit</span>`;
      case "processing":
      default:
        return `<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2 py-1"><i class="bi bi-hourglass-split me-1"></i>Processing in Atelier</span>`;
    }
  }

  renderAddresses() {
    const container = document.getElementById("profileAddressGrid");
    if (!container || !this.profile.savedAddresses) return;

    container.innerHTML = this.profile.savedAddresses.map(addr => `
      <div class="col-md-6 mb-3">
        <div class="card h-100 border p-3 ${addr.isDefault ? 'border-dark shadow-sm' : ''}">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="fw-bold small text-uppercase">${addr.title}</span>
            ${addr.isDefault ? '<span class="badge bg-dark">Default</span>' : ''}
          </div>
          <div class="fw-semibold small">${addr.name}</div>
          <div class="small text-muted">${addr.address}</div>
          <div class="small text-muted mb-3">${addr.city}, ${addr.state} ${addr.postalCode}</div>
          <div class="mt-auto d-flex gap-2">
            ${!addr.isDefault ? `
              <button class="btn btn-sm btn-outline-dark" data-action="set-default-address" data-id="${addr.id}">
                Set as Default
              </button>
            ` : ''}
            <button class="btn btn-sm btn-link text-danger p-0 ms-auto text-decoration-none" data-action="delete-address" data-id="${addr.id}">
              <i class="bi bi-trash3"></i>
            </button>
          </div>
        </div>
      </div>
    `).join("");

    // Bind Address Action Buttons
    container.querySelectorAll("[data-action='set-default-address']").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = parseInt(e.currentTarget.dataset.id);
        this.profile.savedAddresses.forEach(a => a.isDefault = (a.id === id));
        await API.updateUserProfile({ savedAddresses: this.profile.savedAddresses });
        this.renderAddresses();
        this.showToast("Default shipping address updated.");
      });
    });

    container.querySelectorAll("[data-action='delete-address']").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = parseInt(e.currentTarget.dataset.id);
        this.profile.savedAddresses = this.profile.savedAddresses.filter(a => a.id !== id);
        await API.updateUserProfile({ savedAddresses: this.profile.savedAddresses });
        this.renderAddresses();
        this.showToast("Address removed.");
      });
    });
  }

  bindForms() {
    // 1. Account Details Form
    const accForm = document.getElementById("profileAccountForm");
    if (accForm) {
      accForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("accNameInput").value.trim();
        const email = document.getElementById("accEmailInput").value.trim();
        const phone = document.getElementById("accPhoneInput").value.trim();

        await API.updateUserProfile({ name, email, phone });
        this.showToast("Personal information updated successfully.");
        await this.loadProfileData();
      });
    }

    // 2. Sizing Preferences Form
    const sizingForm = document.getElementById("profileSizingForm");
    if (sizingForm) {
      sizingForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const topSize = document.getElementById("prefTopSize").value;
        const trouserSize = document.getElementById("prefTrouserSize").value;
        const fitPreference = document.getElementById("prefFitSilhouette").value;

        await API.updateUserProfile({
          sizingPreferences: {
            topSize,
            trouserSize,
            fitPreference,
            measurementUnit: this.profile.sizingPreferences?.measurementUnit || "inches"
          }
        });

        this.showToast("Atelier sizing preferences saved.");
      });
    }

    // 3. Add Address Modal Form
    const addAddressForm = document.getElementById("addAddressForm");
    if (addAddressForm) {
      addAddressForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const title = document.getElementById("newAddrTitle").value.trim() || "Address";
        const name = document.getElementById("newAddrName").value.trim();
        const address = document.getElementById("newAddrStreet").value.trim();
        const city = document.getElementById("newAddrCity").value.trim();
        const state = document.getElementById("newAddrState").value.trim();
        const postalCode = document.getElementById("newAddrZip").value.trim();
        const isDefault = document.getElementById("newAddrDefaultCheck").checked;

        const newAddr = {
          id: Date.now(),
          title,
          name,
          address,
          city,
          state,
          postalCode,
          country: "United States",
          isDefault
        };

        if (isDefault) {
          this.profile.savedAddresses.forEach(a => a.isDefault = false);
        }

        this.profile.savedAddresses.push(newAddr);
        await API.updateUserProfile({ savedAddresses: this.profile.savedAddresses });
        
        // Hide modal
        const modalEl = document.getElementById("addAddressModal");
        if (modalEl && window.bootstrap) {
          const bsModal = bootstrap.Modal.getInstance(modalEl);
          if (bsModal) bsModal.hide();
        }

        addAddressForm.reset();
        this.renderAddresses();
        this.showToast("New shipping address added.");
      });
    }
  }

  showToast(message) {
    let toast = document.getElementById("appGlobalToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "appGlobalToast";
      toast.className = "custom-toast";
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="bi bi-check-circle fs-5"></i><span>${message}</span>`;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3200);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new ProfileController();
});
