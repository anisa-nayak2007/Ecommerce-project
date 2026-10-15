// Merchant Admin Console Controller
import { API } from "./api.js";
import { CONFIG } from "./config.js";

class AdminController {
  constructor() {
    this.uploadedImages = [];
    this.generatedVariants = [];
    this.init();
  }

  async init() {
    this.bindDropzone();
    this.bindMatrixGenerator();
    this.bindProductForm();
    await this.loadInventoryTable();
    await this.loadOrdersTable();
  }

  // 1. File Upload Drag & Drop Preview
  bindDropzone() {
    const dropzone = document.getElementById("adminUploadDropzone");
    const fileInput = document.getElementById("adminFileInput");
    const previewContainer = document.getElementById("adminImagePreviewGrid");

    if (!dropzone || !fileInput) return;

    dropzone.addEventListener("click", () => fileInput.click());

    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("dragover");
    });

    dropzone.addEventListener("dragleave", () => {
      dropzone.classList.remove("dragover");
    });

    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone.classList.remove("dragover");
      if (e.dataTransfer.files.length) {
        this.handleFiles(e.dataTransfer.files);
      }
    });

    fileInput.addEventListener("change", (e) => {
      if (e.target.files.length) {
        this.handleFiles(e.target.files);
      }
    });
  }

  handleFiles(files) {
    const previewContainer = document.getElementById("adminImagePreviewGrid");
    if (!previewContainer) return;

    Array.from(files).forEach(file => {
      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target.result;
        this.uploadedImages.push({ name: file.name, url });

        const thumb = document.createElement("div");
        thumb.className = "position-relative d-inline-block me-2 mb-2";
        thumb.innerHTML = `
          <img src="${url}" class="upload-preview-thumb">
          <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 p-0 px-1 rounded-circle" style="transform: translate(30%, -30%); font-size: 0.6rem;">&times;</button>
        `;
        thumb.querySelector("button").addEventListener("click", () => {
          this.uploadedImages = this.uploadedImages.filter(img => img.url !== url);
          thumb.remove();
        });
        previewContainer.appendChild(thumb);
      };
      reader.readAsDataURL(file);
    });
  }

  // 2. Variant Matrix Generator
  bindMatrixGenerator() {
    const btn = document.getElementById("generateMatrixBtn");
    const tableBody = document.getElementById("variantMatrixTableBody");
    if (!btn || !tableBody) return;

    btn.addEventListener("click", () => {
      const selectedColors = Array.from(document.querySelectorAll("input[name='adminColors']:checked")).map(cb => ({
        name: cb.value,
        hex: cb.dataset.hex
      }));

      const selectedSizes = Array.from(document.querySelectorAll("input[name='adminSizes']:checked")).map(cb => cb.value);

      if (selectedColors.length === 0 || selectedSizes.length === 0) {
        alert("Please select at least one color and one size.");
        return;
      }

      this.generatedVariants = [];
      const title = document.getElementById("adminProductTitle")?.value || "ITEM";
      const codePrefix = title.split(" ").map(w => w[0]).join("").toUpperCase().substring(0, 3) || "APP";

      let html = "";
      selectedColors.forEach(color => {
        selectedSizes.forEach(size => {
          const sku = `${codePrefix}-${color.name.substring(0, 3).toUpperCase()}-${size}`;
          this.generatedVariants.push({
            color: color.name,
            colorHex: color.hex,
            size: size,
            sku: sku,
            stock: 10
          });

          html += `
            <tr data-sku="${sku}">
              <td>
                <span class="d-inline-flex align-items-center gap-1">
                  <span class="swatch-circle" style="background-color: ${color.hex};"></span>
                  <span class="small fw-semibold">${color.name}</span>
                </span>
              </td>
              <td><span class="badge bg-secondary">${size}</span></td>
              <td><input type="text" class="form-control form-control-sm variant-sku-input" value="${sku}"></td>
              <td><input type="number" class="form-control form-control-sm variant-stock-input" value="10" min="0" style="width: 80px;"></td>
            </tr>
          `;
        });
      });

      tableBody.innerHTML = html;
      document.getElementById("variantMatrixContainer")?.classList.remove("d-none");
    });
  }

  // 3. Save New Product
  bindProductForm() {
    const form = document.getElementById("adminProductForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const title = document.getElementById("adminProductTitle").value.trim();
      const category = document.getElementById("adminProductCategory").value;
      const gender = document.getElementById("adminProductGender").value;
      const basePrice = parseFloat(document.getElementById("adminProductPrice").value);
      const description = document.getElementById("adminProductDescription").value.trim();

      if (!title || isNaN(basePrice)) {
        alert("Please provide a title and base price.");
        return;
      }

      // Collect variants from table
      const rows = document.querySelectorAll("#variantMatrixTableBody tr");
      const variants = [];
      const colorsMap = new Map();

      rows.forEach(row => {
        const sku = row.querySelector(".variant-sku-input").value;
        const stock = parseInt(row.querySelector(".variant-stock-input").value) || 0;
        const matched = this.generatedVariants.find(v => v.sku === row.dataset.sku);
        if (matched) {
          variants.push({
            id: Math.floor(1000 + Math.random() * 9000),
            sku,
            color: matched.color,
            size: matched.size,
            stock,
            price: basePrice
          });

          if (!colorsMap.has(matched.color)) {
            colorsMap.set(matched.color, {
              name: matched.color,
              hex: matched.colorHex,
              images: this.uploadedImages.length > 0 
                ? this.uploadedImages.map(img => img.url)
                : ["https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80"]
            });
          }
        }
      });

      if (variants.length === 0) {
        alert("Please generate and configure the variant matrix first.");
        return;
      }

      const newProduct = {
        title,
        category,
        categorySlug: category.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        gender,
        basePrice,
        compareAtPrice: null,
        isFeatured: false,
        isNew: true,
        rating: 5.0,
        reviewCount: 1,
        description,
        details: {
          fabric: "High-grade tailored fabric",
          care: "Specialist clean",
          fit: "Contemporary silhouette",
          origin: "Local Studio"
        },
        colors: Array.from(colorsMap.values()),
        variants
      };

      const res = await API.adminCreateProduct(newProduct);
      if (res.success) {
        alert(`Successfully created: ${title}!`);
        form.reset();
        document.getElementById("adminImagePreviewGrid").innerHTML = "";
        document.getElementById("variantMatrixContainer").classList.add("d-none");
        this.uploadedImages = [];
        await this.loadInventoryTable();
      } else {
        alert("Error creating product: " + res.message);
      }
    });
  }

  // 4. Load Inventory Management Table
  async loadInventoryTable() {
    const tableBody = document.getElementById("adminInventoryTableBody");
    if (!tableBody) return;

    const res = await API.getProducts();
    if (!res.success) return;

    let html = "";
    res.data.forEach(prod => {
      prod.variants.forEach(v => {
        const stockBadge = v.stock > 3 
          ? `<span class="badge bg-success-subtle text-success">In Stock (${v.stock})</span>`
          : v.stock > 0 
          ? `<span class="badge bg-warning-subtle text-warning">Low Stock (${v.stock})</span>`
          : `<span class="badge bg-danger-subtle text-danger">Sold Out</span>`;

        html += `
          <tr data-variant-id="${v.id}">
            <td><span class="small font-monospace">${v.sku}</span></td>
            <td><strong>${prod.title}</strong></td>
            <td>${v.color}</td>
            <td><span class="badge bg-light text-dark border">${v.size}</span></td>
            <td class="text-nowrap">${stockBadge}</td>
            <td>
              <div class="input-group input-group-sm" style="max-width: 130px;">
                <input type="number" class="form-control admin-stock-input" value="${v.stock}" min="0">
                <button class="btn btn-outline-dark admin-save-stock-btn" type="button" data-variant-id="${v.id}">Save</button>
              </div>
            </td>
          </tr>
        `;
      });
    });

    tableBody.innerHTML = html;

    // Attach save stock handlers
    tableBody.querySelectorAll(".admin-save-stock-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const variantId = e.currentTarget.dataset.variantId;
        const row = e.currentTarget.closest("tr");
        const newStock = row.querySelector(".admin-stock-input").value;
        btn.disabled = true;
        btn.textContent = "...";
        const updateRes = await API.adminUpdateStock(variantId, newStock);
        btn.disabled = false;
        btn.textContent = "Saved!";
        setTimeout(() => { btn.textContent = "Save"; }, 1500);
        await this.loadInventoryTable();
      });
    });
  }

  // 5. Load Recent Customer Orders
  async loadOrdersTable() {
    const tableBody = document.getElementById("adminOrdersTableBody");
    if (!tableBody) return;

    const res = await API.adminGetOrders();
    if (!res.success) return;

    tableBody.innerHTML = res.data.map(order => `
      <tr>
        <td><strong class="font-monospace">${order.orderNumber}</strong></td>
        <td>
          <div class="fw-semibold">${order.customer.name}</div>
          <div class="small text-muted">${order.customer.email}</div>
        </td>
        <td>
          <span class="small text-muted">${order.items.map(i => `${i.title} (${i.size}) &times; ${i.quantity}`).join("<br>")}</span>
        </td>
        <td><strong>${CONFIG.CURRENCY_SYMBOL}${order.total.toFixed(2)}</strong></td>
        <td>
          <select class="form-select form-select-sm admin-order-status-select" data-order-number="${order.orderNumber}">
            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </td>
      </tr>
    `).join("");

    tableBody.querySelectorAll(".admin-order-status-select").forEach(select => {
      select.addEventListener("change", async (e) => {
        const orderNum = e.currentTarget.dataset.orderNumber;
        const newStatus = e.currentTarget.value;
        await API.adminUpdateOrderStatus(orderNum, newStatus);
      });
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new AdminController();
});
