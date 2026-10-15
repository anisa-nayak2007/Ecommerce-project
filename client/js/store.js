// Storefront & Catalog Controller
import { API } from "./api.js";
import { cart } from "./cart.js";
import { CONFIG } from "./config.js";

class StoreController {
  constructor() {
    this.currentFilters = {
      category: "all",
      gender: "all",
      search: "",
      sortBy: "featured",
      inStockOnly: false,
      maxPrice: 350
    };

    this.products = [];
    this.init();
  }

  async init() {
    this.bindEvents();
    await this.loadCategories();
    await this.fetchAndRenderProducts();
  }

  bindEvents() {
    // 1. Search Bar with Debounce
    const searchInput = document.getElementById("catalogSearchInput");
    if (searchInput) {
      let debounceTimer;
      searchInput.addEventListener("input", (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.currentFilters.search = e.target.value;
          this.fetchAndRenderProducts();
        }, 250);
      });
    }

    // 2. Category Filter Pills
    document.querySelectorAll(".category-filter-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        document.querySelectorAll(".category-filter-btn").forEach(b => b.classList.remove("active"));
        e.currentTarget.classList.add("active");
        this.currentFilters.category = e.currentTarget.dataset.category;
        this.fetchAndRenderProducts();
      });
    });

    // 3. Gender Filter Radios
    document.querySelectorAll("input[name='genderFilter']").forEach(radio => {
      radio.addEventListener("change", (e) => {
        this.currentFilters.gender = e.target.value;
        this.fetchAndRenderProducts();
      });
    });

    // 4. Sort Dropdown
    const sortSelect = document.getElementById("catalogSortSelect");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        this.currentFilters.sortBy = e.target.value;
        this.fetchAndRenderProducts();
      });
    }

    // 5. In-Stock Only Toggle
    const inStockToggle = document.getElementById("inStockOnlyToggle");
    if (inStockToggle) {
      inStockToggle.addEventListener("change", (e) => {
        this.currentFilters.inStockOnly = e.target.checked;
        this.fetchAndRenderProducts();
      });
    }

    // 6. Price Range Slider
    const priceSlider = document.getElementById("priceRangeSlider");
    const priceLabel = document.getElementById("priceRangeValue");
    if (priceSlider && priceLabel) {
      priceSlider.addEventListener("input", (e) => {
        priceLabel.textContent = `${CONFIG.CURRENCY_SYMBOL}${e.target.value}`;
        this.currentFilters.maxPrice = e.target.value;
        this.fetchAndRenderProducts();
      });
    }

    // 7. Reset Filters Button
    const resetBtn = document.getElementById("resetFiltersBtn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        this.resetFilters();
      });
    }
  }

  resetFilters() {
    this.currentFilters = {
      category: "all",
      gender: "all",
      search: "",
      sortBy: "featured",
      inStockOnly: false,
      maxPrice: 350
    };

    const searchInput = document.getElementById("catalogSearchInput");
    if (searchInput) searchInput.value = "";

    const sortSelect = document.getElementById("catalogSortSelect");
    if (sortSelect) sortSelect.value = "featured";

    const inStockToggle = document.getElementById("inStockOnlyToggle");
    if (inStockToggle) inStockToggle.checked = false;

    const priceSlider = document.getElementById("priceRangeSlider");
    const priceLabel = document.getElementById("priceRangeValue");
    if (priceSlider && priceLabel) {
      priceSlider.value = 350;
      priceLabel.textContent = "$350";
    }

    document.querySelectorAll(".category-filter-btn").forEach(b => {
      b.classList.toggle("active", b.dataset.category === "all");
    });

    const allGenderRadio = document.querySelector("input[name='genderFilter'][value='all']");
    if (allGenderRadio) allGenderRadio.checked = true;

    this.fetchAndRenderProducts();
  }

  async loadCategories() {
    const res = await API.getCategories();
    const container = document.getElementById("categoryFilterPills");
    if (!container || !res.success) return;

    // Render pills
    const pillsHtml = `
      <button class="category-pill category-filter-btn active" data-category="all">All Styles</button>
      ${res.data.map(cat => `
        <button class="category-pill category-filter-btn" data-category="${cat.slug}">${cat.name}</button>
      `).join("")}
    `;
    container.innerHTML = pillsHtml;

    // Rebind pills
    container.querySelectorAll(".category-filter-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        container.querySelectorAll(".category-filter-btn").forEach(b => b.classList.remove("active"));
        e.currentTarget.classList.add("active");
        this.currentFilters.category = e.currentTarget.dataset.category;
        this.fetchAndRenderProducts();
      });
    });
  }

  async fetchAndRenderProducts() {
    const grid = document.getElementById("productGrid");
    const countEl = document.getElementById("productCountDisplay");
    if (!grid) return;

    grid.innerHTML = `
      <div class="col-12 py-5 text-center">
        <div class="spinner-border text-dark" role="status">
          <span class="visually-hidden">Loading collection...</span>
        </div>
      </div>
    `;

    const res = await API.getProducts(this.currentFilters);
    if (!res.success || res.data.length === 0) {
      grid.innerHTML = `
        <div class="col-12 py-5 text-center">
          <div class="p-5 border bg-light">
            <i class="bi bi-search fs-1 text-muted mb-3 d-block"></i>
            <h4 class="font-editorial">No Garments Found</h4>
            <p class="text-muted">Try adjusting your filters, price range, or search keyword.</p>
            <button class="btn btn-luxury-dark mt-2" id="emptyStateResetBtn">Clear All Filters</button>
          </div>
        </div>
      `;
      const emptyReset = document.getElementById("emptyStateResetBtn");
      if (emptyReset) emptyReset.addEventListener("click", () => this.resetFilters());
      if (countEl) countEl.textContent = `0 Items`;
      return;
    }

    this.products = res.data;
    if (countEl) countEl.textContent = `${this.products.length} Garments`;

    // Render Product Cards
    grid.innerHTML = this.products.map(product => this.renderProductCard(product)).join("");

    this.attachCardInteractions(grid);
  }

  renderProductCard(product) {
    const primaryColor = product.colors[0];
    const secondaryImage = primaryColor.images[1] || primaryColor.images[0];
    const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.basePrice;
    const discountPercent = hasDiscount ? Math.round(((product.compareAtPrice - product.basePrice) / product.compareAtPrice) * 100) : 0;

    let badgeHtml = "";
    if (hasDiscount) {
      badgeHtml = `<span class="badge-sale">-${discountPercent}%</span>`;
    } else if (product.isNew) {
      badgeHtml = `<span class="badge-luxury">New Drop</span>`;
    }

    // Color swatches HTML
    const swatchesHtml = product.colors.map((c, idx) => `
      <span class="swatch-circle ${idx === 0 ? 'active' : ''}" 
            style="background-color: ${c.hex};" 
            data-color-name="${c.name}"
            data-img-primary="${c.images[0]}"
            data-img-secondary="${c.images[1] || c.images[0]}"
            title="${c.name}"></span>
    `).join("");

    return `
      <div class="col-6 col-md-4 col-lg-4 mb-4" data-product-id="${product.id}">
        <div class="product-card">
          <div class="product-image-container">
            ${badgeHtml}
            <a href="product.html?slug=${product.slug}" class="d-block w-100 h-100">
              <img src="${primaryColor.images[0]}" alt="${product.title}" class="product-image" loading="lazy">
              <img src="${secondaryImage}" alt="${product.title}" class="product-image-secondary" loading="lazy">
            </a>
            <button class="quick-add-btn" data-action="quick-add" data-id="${product.id}">
              <i class="bi bi-bag-plus me-1"></i> Quick View & Add
            </button>
          </div>
          <div class="product-meta">
            <span class="product-category-label">${product.category} &bull; ${product.gender}</span>
            <a href="product.html?slug=${product.slug}" class="product-title">${product.title}</a>
            <div class="product-price-wrapper">
              <span class="price-current">${CONFIG.CURRENCY_SYMBOL}${product.basePrice.toFixed(2)}</span>
              ${hasDiscount ? `<span class="price-compare">${CONFIG.CURRENCY_SYMBOL}${product.compareAtPrice.toFixed(2)}</span>` : ""}
            </div>
            <div class="swatch-group">
              ${swatchesHtml}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  attachCardInteractions(container) {
    // 1. Swatch Hover & Click to swap card image
    container.querySelectorAll(".swatch-circle").forEach(swatch => {
      swatch.addEventListener("click", (e) => {
        e.preventDefault();
        const card = e.currentTarget.closest(".product-card");
        if (!card) return;

        // Update active swatch
        card.querySelectorAll(".swatch-circle").forEach(s => s.classList.remove("active"));
        e.currentTarget.classList.add("active");

        // Swap images
        const mainImg = card.querySelector(".product-image");
        const secImg = card.querySelector(".product-image-secondary");
        const newPrimary = e.currentTarget.dataset.imgPrimary;
        const newSec = e.currentTarget.dataset.imgSecondary;

        if (mainImg && newPrimary) mainImg.src = newPrimary;
        if (secImg && newSec) secImg.src = newSec;
      });
    });

    // 2. Quick Add Modal Trigger
    container.querySelectorAll("[data-action='quick-add']").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const productId = parseInt(e.currentTarget.dataset.id);
        const product = this.products.find(p => p.id === productId);
        if (product) {
          this.openQuickAddModal(product);
        }
      });
    });
  }

  openQuickAddModal(product) {
    let modalEl = document.getElementById("quickAddModal");
    if (!modalEl) {
      modalEl = document.createElement("div");
      modalEl.id = "quickAddModal";
      modalEl.className = "modal fade";
      modalEl.tabIndex = -1;
      document.body.appendChild(modalEl);
    }

    const primaryColor = product.colors[0];
    let selectedColor = primaryColor.name;
    let selectedSize = null;
    let selectedImage = primaryColor.images[0];

    modalEl.innerHTML = `
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 rounded-0 shadow-lg">
          <div class="modal-body p-0">
            <div class="row g-0">
              <div class="col-md-6 bg-light">
                <img id="quickModalImage" src="${selectedImage}" alt="${product.title}" class="w-100 h-100 object-fit-cover" style="min-height: 400px; max-height: 500px;">
              </div>
              <div class="col-md-6 p-4 p-lg-5 d-flex flex-direction-column justify-content-between">
                <div>
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <span class="text-uppercase text-muted small fw-bold">${product.category}</span>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <h4 class="font-editorial mb-2">${product.title}</h4>
                  <div class="fs-5 fw-bold mb-3">${CONFIG.CURRENCY_SYMBOL}${product.basePrice.toFixed(2)}</div>
                  <p class="text-muted small mb-4">${product.description}</p>

                  <!-- Color Selection -->
                  <div class="mb-3">
                    <label class="form-label small fw-bold text-uppercase d-block mb-2">
                      Color: <span id="quickModalColorLabel" class="fw-normal text-muted">${selectedColor}</span>
                    </label>
                    <div class="d-flex gap-2">
                      ${product.colors.map(c => `
                        <button type="button" class="color-choice-btn ${c.name === selectedColor ? 'active' : ''}" 
                                data-color="${c.name}" data-img="${c.images[0]}">
                          <span class="swatch-circle" style="background-color: ${c.hex};"></span>
                          <span>${c.name}</span>
                        </button>
                      `).join("")}
                    </div>
                  </div>

                  <!-- Size Selection -->
                  <div class="mb-4">
                    <label class="form-label small fw-bold text-uppercase d-block mb-2">Select Size</label>
                    <div class="d-flex flex-wrap gap-2" id="quickModalSizes">
                      ${this.renderSizePills(product, selectedColor)}
                    </div>
                  </div>
                </div>

                <div>
                  <button type="button" class="btn btn-luxury-dark w-100 py-3" id="quickModalAddBtn" disabled>
                    Select a Size
                  </button>
                  <a href="product.html?slug=${product.slug}" class="d-block text-center mt-3 small text-muted text-decoration-underline">
                    View Complete Garment Details & Sizing Guide &rarr;
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();

    // Color Switcher inside Modal
    modalEl.querySelectorAll(".color-choice-btn").forEach(cBtn => {
      cBtn.addEventListener("click", (e) => {
        modalEl.querySelectorAll(".color-choice-btn").forEach(b => b.classList.remove("active"));
        e.currentTarget.classList.add("active");
        selectedColor = e.currentTarget.dataset.color;
        selectedImage = e.currentTarget.dataset.img;
        document.getElementById("quickModalColorLabel").textContent = selectedColor;
        document.getElementById("quickModalImage").src = selectedImage;

        // Re-render size pills for new color
        const sizeContainer = document.getElementById("quickModalSizes");
        sizeContainer.innerHTML = this.renderSizePills(product, selectedColor);
        selectedSize = null;
        const addBtn = document.getElementById("quickModalAddBtn");
        addBtn.disabled = true;
        addBtn.textContent = "Select a Size";
        this.bindSizePills(modalEl, product, () => selectedColor, (size) => {
          selectedSize = size;
          addBtn.disabled = false;
          addBtn.textContent = "Add to Shopping Bag";
        });
      });
    });

    // Bind Size Pills
    this.bindSizePills(modalEl, product, () => selectedColor, (size) => {
      selectedSize = size;
      const addBtn = document.getElementById("quickModalAddBtn");
      addBtn.disabled = false;
      addBtn.textContent = "Add to Shopping Bag";
    });

    // Add to Bag Button
    const addBtn = document.getElementById("quickModalAddBtn");
    addBtn.addEventListener("click", () => {
      if (!selectedSize) return;
      const variant = product.variants.find(v => v.color === selectedColor && v.size === selectedSize);
      if (variant) {
        cart.addItem(product, variant, 1, selectedImage);
        bsModal.hide();
      }
    });
  }

  renderSizePills(product, activeColor) {
    const availableVariants = product.variants.filter(v => v.color === activeColor);
    return availableVariants.map(v => {
      const isSoldOut = v.stock <= 0;
      return `
        <button type="button" class="size-selector-btn ${isSoldOut ? 'sold-out' : ''}" 
                data-size="${v.size}" ${isSoldOut ? 'disabled' : ''}>
          ${v.size}
        </button>
      `;
    }).join("");
  }

  bindSizePills(modalEl, product, getColor, onSelect) {
    modalEl.querySelectorAll(".size-selector-btn:not(.sold-out)").forEach(btn => {
      btn.addEventListener("click", (e) => {
        modalEl.querySelectorAll(".size-selector-btn").forEach(b => b.classList.remove("active"));
        e.currentTarget.classList.add("active");
        onSelect(e.currentTarget.dataset.size);
      });
    });
  }
}

// Instantiate on DOM load
document.addEventListener("DOMContentLoaded", () => {
  new StoreController();
});
