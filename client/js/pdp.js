// Product Detail Page (PDP) Interactive Controller
import { API } from "./api.js";
import { cart } from "./cart.js";
import { CONFIG } from "./config.js";
import { MOCK_SIZE_GUIDE } from "./mockData.js";

class PDPController {
  constructor() {
    this.product = null;
    this.activeColor = null;
    this.activeSize = null;
    this.selectedQuantity = 1;
    this.activeUnit = "inches"; // 'inches' or 'cm'
    this.init();
  }

  async init() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get("slug") || "double-breasted-wool-trench-coat";

    const res = await API.getProductBySlug(slug);
    if (!res.success || !res.data) {
      this.renderNotFound();
      return;
    }

    this.product = res.data;
    this.activeColor = this.product.colors[0];
    
    this.renderPDP();
    this.bindEvents();
    this.loadRecommendations();
  }

  renderNotFound() {
    const container = document.getElementById("pdpMainContainer");
    if (container) {
      container.innerHTML = `
        <div class="container py-5 text-center my-5">
          <i class="bi bi-bag-x fs-1 text-muted mb-3 d-block"></i>
          <h2 class="font-editorial mb-3">Garment Not Found</h2>
          <p class="text-muted mb-4">The item you are looking for may have sold out or is no longer available.</p>
          <a href="index.html" class="btn btn-luxury-dark">Return to Collection</a>
        </div>
      `;
    }
  }

  renderPDP() {
    // 1. Page Title & Breadcrumbs
    document.title = `${this.product.title} &mdash; ${CONFIG.STORE_NAME}`;
    
    const breadcrumbCat = document.getElementById("pdpBreadcrumbCategory");
    const breadcrumbTitle = document.getElementById("pdpBreadcrumbTitle");
    if (breadcrumbCat) breadcrumbCat.textContent = this.product.category;
    if (breadcrumbTitle) breadcrumbTitle.textContent = this.product.title;

    // 2. Titles & Pricing
    document.getElementById("pdpProductTitle").textContent = this.product.title;
    document.getElementById("pdpProductCategory").textContent = `${this.product.category} &bull; ${this.product.gender.toUpperCase()}`;
    document.getElementById("pdpProductPrice").textContent = `${CONFIG.CURRENCY_SYMBOL}${this.product.basePrice.toFixed(2)}`;
    
    const comparePriceEl = document.getElementById("pdpComparePrice");
    if (comparePriceEl) {
      if (this.product.compareAtPrice && this.product.compareAtPrice > this.product.basePrice) {
        comparePriceEl.textContent = `${CONFIG.CURRENCY_SYMBOL}${this.product.compareAtPrice.toFixed(2)}`;
        comparePriceEl.classList.remove("d-none");
      } else {
        comparePriceEl.classList.add("d-none");
      }
    }

    // 3. Ratings
    document.getElementById("pdpRatingStars").innerHTML = `
      <div class="text-warning small me-2">
        ${'<i class="bi bi-star-fill"></i>'.repeat(Math.floor(this.product.rating))}
        ${this.product.rating % 1 !== 0 ? '<i class="bi bi-star-half"></i>' : ''}
      </div>
      <span class="small text-muted">(${this.product.reviewCount} customer reviews)</span>
    `;

    // 4. Description & Details Accordion
    document.getElementById("pdpDescription").textContent = this.product.description;
    document.getElementById("pdpDetailFabric").textContent = this.product.details?.fabric || "100% Premium Cotton";
    document.getElementById("pdpDetailCare").textContent = this.product.details?.care || "Dry clean or delicate cycle.";
    document.getElementById("pdpDetailFit").textContent = this.product.details?.fit || "True to size tailored fit.";
    document.getElementById("pdpDetailOrigin").textContent = this.product.details?.origin || "Imported";

    // 5. Render Color Swatches
    this.renderColorSwatches();

    // 6. Render Image Gallery for Active Color
    this.renderGallery();

    // 7. Render Size Selector for Active Color
    this.renderSizes();

    // 8. Render Size Guide Table
    this.renderSizeGuideTable();
  }

  renderGallery() {
    const images = this.activeColor.images || [];
    const mainImg = document.getElementById("pdpMainImage");
    const thumbnailRail = document.getElementById("pdpThumbnailRail");

    if (mainImg && images.length > 0) {
      mainImg.src = images[0];
      mainImg.alt = `${this.product.title} - ${this.activeColor.name}`;
    }

    if (thumbnailRail) {
      thumbnailRail.innerHTML = images.map((imgUrl, idx) => `
        <img src="${imgUrl}" alt="${this.product.title}" 
             class="gallery-thumbnail ${idx === 0 ? 'active' : ''}" 
             data-img="${imgUrl}">
      `).join("");

      thumbnailRail.querySelectorAll(".gallery-thumbnail").forEach(thumb => {
        thumb.addEventListener("click", (e) => {
          thumbnailRail.querySelectorAll(".gallery-thumbnail").forEach(t => t.classList.remove("active"));
          e.currentTarget.classList.add("active");
          if (mainImg) mainImg.src = e.currentTarget.dataset.img;
        });
      });
    }
  }

  renderColorSwatches() {
    const container = document.getElementById("pdpColorSwatches");
    const label = document.getElementById("pdpSelectedColorName");
    if (!container) return;

    if (label) label.textContent = this.activeColor.name;

    container.innerHTML = this.product.colors.map(c => `
      <button type="button" class="color-choice-btn ${c.name === this.activeColor.name ? 'active' : ''}" 
              data-color-name="${c.name}">
        <span class="swatch-circle" style="background-color: ${c.hex};"></span>
        <span>${c.name}</span>
      </button>
    `).join("");

    container.querySelectorAll(".color-choice-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const colorName = e.currentTarget.dataset.colorName;
        const colorObj = this.product.colors.find(c => c.name === colorName);
        if (colorObj) {
          this.activeColor = colorObj;
          this.activeSize = null; // Reset size on color change
          this.renderColorSwatches();
          this.renderGallery();
          this.renderSizes();
          this.updateAddToBagButton();
        }
      });
    });
  }

  renderSizes() {
    const container = document.getElementById("pdpSizePills");
    const stockMsgEl = document.getElementById("pdpStockIndicator");
    if (!container) return;

    const availableVariants = this.product.variants.filter(v => v.color === this.activeColor.name);

    container.innerHTML = availableVariants.map(v => {
      const isSoldOut = v.stock <= 0;
      return `
        <button type="button" class="size-selector-btn ${this.activeSize === v.size ? 'active' : ''} ${isSoldOut ? 'sold-out' : ''}" 
                data-size="${v.size}" data-stock="${v.stock}" ${isSoldOut ? 'disabled' : ''}>
          ${v.size}
        </button>
      `;
    }).join("");

    container.querySelectorAll(".size-selector-btn:not(.sold-out)").forEach(btn => {
      btn.addEventListener("click", (e) => {
        container.querySelectorAll(".size-selector-btn").forEach(b => b.classList.remove("active"));
        e.currentTarget.classList.add("active");
        this.activeSize = e.currentTarget.dataset.size;
        const stock = parseInt(e.currentTarget.dataset.stock);

        if (stockMsgEl) {
          if (stock <= 2) {
            stockMsgEl.innerHTML = `<span class="text-danger fw-bold"><i class="bi bi-clock-history me-1"></i>Only ${stock} items left in stock &mdash; order soon!</span>`;
          } else {
            stockMsgEl.innerHTML = `<span class="text-success"><i class="bi bi-check2-circle me-1"></i>In Stock & Ready to Dispatch (1-2 Days)</span>`;
          }
        }

        this.updateAddToBagButton();
      });
    });

    if (stockMsgEl && !this.activeSize) {
      stockMsgEl.innerHTML = `<span class="text-muted"><i class="bi bi-shield-check me-1"></i>Complimentary 30-day returns & exchanges</span>`;
    }
  }

  updateAddToBagButton() {
    const btn = document.getElementById("pdpAddToBagBtn");
    if (!btn) return;

    if (!this.activeSize) {
      btn.disabled = true;
      btn.innerHTML = `<i class="bi bi-bag-plus me-2"></i>Select a Size to Add`;
    } else {
      btn.disabled = false;
      btn.innerHTML = `<i class="bi bi-bag-plus me-2"></i>Add to Shopping Bag &bull; ${CONFIG.CURRENCY_SYMBOL}${(this.product.basePrice * this.selectedQuantity).toFixed(2)}`;
    }
  }

  bindEvents() {
    // 1. Quantity Adjuster
    const qtyInput = document.getElementById("pdpQtyInput");
    const decBtn = document.getElementById("pdpQtyDec");
    const incBtn = document.getElementById("pdpQtyInc");

    if (decBtn && qtyInput) {
      decBtn.addEventListener("click", () => {
        if (this.selectedQuantity > 1) {
          this.selectedQuantity--;
          qtyInput.value = this.selectedQuantity;
          this.updateAddToBagButton();
        }
      });
    }

    if (incBtn && qtyInput) {
      incBtn.addEventListener("click", () => {
        this.selectedQuantity++;
        qtyInput.value = this.selectedQuantity;
        this.updateAddToBagButton();
      });
    }

    // 2. Add to Bag Click
    const addBtn = document.getElementById("pdpAddToBagBtn");
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        if (!this.activeSize) return;

        const variant = this.product.variants.find(
          v => v.color === this.activeColor.name && v.size === this.activeSize
        );

        if (variant) {
          const mainImg = document.getElementById("pdpMainImage")?.src;
          cart.addItem(this.product, variant, this.selectedQuantity, mainImg);
        }
      });
    }

    // 3. Sizing Guide Modal Unit Toggle
    const inchesBtn = document.getElementById("unitInchesBtn");
    const cmBtn = document.getElementById("unitCmBtn");

    if (inchesBtn && cmBtn) {
      inchesBtn.addEventListener("click", () => {
        inchesBtn.classList.add("active");
        cmBtn.classList.remove("active");
        this.activeUnit = "inches";
        this.renderSizeGuideTable();
      });

      cmBtn.addEventListener("click", () => {
        cmBtn.classList.add("active");
        inchesBtn.classList.remove("active");
        this.activeUnit = "cm";
        this.renderSizeGuideTable();
      });
    }
  }

  renderSizeGuideTable() {
    const tableBody = document.getElementById("sizeGuideTableBody");
    const unitLabel = document.getElementById("sizeGuideUnitLabel");
    if (!tableBody) return;

    if (unitLabel) unitLabel.textContent = this.activeUnit === "inches" ? "(All measurements in Inches)" : "(All measurements in Centimeters)";

    const data = MOCK_SIZE_GUIDE[this.activeUnit] || [];
    tableBody.innerHTML = data.map(row => `
      <tr>
        <td class="fw-bold">${row.size}</td>
        <td>${row.chest}</td>
        <td>${row.waist}</td>
        <td>${row.hips}</td>
        <td>${row.length}</td>
      </tr>
    `).join("");
  }

  async loadRecommendations() {
    const recContainer = document.getElementById("pdpRecommendationsGrid");
    if (!recContainer) return;

    const allRes = await API.getProducts({ category: "all" });
    if (!allRes.success) return;

    const others = allRes.data.filter(p => p.id !== this.product.id).slice(0, 3);
    recContainer.innerHTML = others.map(p => `
      <div class="col-6 col-md-4 mb-4">
        <div class="product-card">
          <div class="product-image-container">
            <a href="product.html?slug=${p.slug}">
              <img src="${p.colors[0].images[0]}" alt="${p.title}" class="product-image" loading="lazy">
            </a>
          </div>
          <div class="product-meta">
            <span class="product-category-label">${p.category}</span>
            <a href="product.html?slug=${p.slug}" class="product-title">${p.title}</a>
            <div class="product-price-wrapper">
              <span class="price-current">${CONFIG.CURRENCY_SYMBOL}${p.basePrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    `).join("");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new PDPController();
});
