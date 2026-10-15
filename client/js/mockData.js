// Mock Data Repository for Apparel E-Commerce (Frontend-First Iteration)
// High-res apparel images curated for luxury, streetwear, and contemporary fashion aesthetics

export const MOCK_CATEGORIES = [
  { id: 1, name: "Outerwear", slug: "outerwear", count: 4 },
  { id: 2, name: "Knitwear", slug: "knitwear", count: 3 },
  { id: 3, name: "Tops & Shirts", slug: "tops-shirts", count: 4 },
  { id: 4, name: "Trousers & Denim", slug: "trousers-denim", count: 3 },
  { id: 5, name: "Accessories", slug: "accessories", count: 2 }
];

export const MOCK_PRODUCTS = [
  {
    id: 1,
    title: "Double-Breasted Wool Trench Coat",
    slug: "double-breasted-wool-trench-coat",
    category: "Outerwear",
    categorySlug: "outerwear",
    gender: "women",
    basePrice: 285.00,
    compareAtPrice: 340.00,
    isFeatured: true,
    isNew: true,
    rating: 4.9,
    reviewCount: 38,
    description: "Architectural silhouette cut from heavyweight 100% melton wool. Features storm flap detailing, horn button closures, a wide notched lapel, and a belted waist that cinches for a tailored drape.",
    details: {
      fabric: "100% Premium Melton Wool (650 GSM); Lining: 100% Cupro",
      care: "Dry clean only. Store on shaped wooden hanger.",
      fit: "Relaxed oversized cut. Model is 5'10\" (178cm) wearing size S.",
      origin: "Tailored in Portugal"
    },
    colors: [
      {
        name: "Camel Dune",
        hex: "#C19A6B",
        images: [
          "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80",
          "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1000&q=80",
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80"
        ]
      },
      {
        name: "Obsidian Black",
        hex: "#1A1A1A",
        images: [
          "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80",
          "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1000&q=80"
        ]
      }
    ],
    variants: [
      { id: 101, sku: "W-TRN-CAM-XS", color: "Camel Dune", size: "XS", stock: 4, price: 285.00 },
      { id: 102, sku: "W-TRN-CAM-S", color: "Camel Dune", size: "S", stock: 8, price: 285.00 },
      { id: 103, sku: "W-TRN-CAM-M", color: "Camel Dune", size: "M", stock: 6, price: 285.00 },
      { id: 104, sku: "W-TRN-CAM-L", color: "Camel Dune", size: "L", stock: 2, price: 285.00 },
      { id: 105, sku: "W-TRN-CAM-XL", color: "Camel Dune", size: "XL", stock: 0, price: 285.00 },
      { id: 106, sku: "W-TRN-BLK-XS", color: "Obsidian Black", size: "XS", stock: 3, price: 285.00 },
      { id: 107, sku: "W-TRN-BLK-S", color: "Obsidian Black", size: "S", stock: 5, price: 285.00 },
      { id: 108, sku: "W-TRN-BLK-M", color: "Obsidian Black", size: "M", stock: 7, price: 285.00 },
      { id: 109, sku: "W-TRN-BLK-L", color: "Obsidian Black", size: "L", stock: 0, price: 285.00 }
    ]
  },
  {
    id: 2,
    title: "Chunky Ribbed Cashmere Turtleneck",
    slug: "chunky-ribbed-cashmere-turtleneck",
    category: "Knitwear",
    categorySlug: "knitwear",
    gender: "unisex",
    basePrice: 195.00,
    compareAtPrice: 230.00,
    isFeatured: true,
    isNew: true,
    rating: 4.8,
    reviewCount: 42,
    description: "An heirloom-grade knit constructed from 4-ply Mongolian cashmere. Features pronounced English fisherman ribbing, dropped shoulders, and a cozy fold-over turtleneck collar.",
    details: {
      fabric: "100% Grade-A Mongolian Cashmere (4-ply)",
      care: "Hand wash cold with wool detergent or gentle dry clean. Dry flat.",
      fit: "Generous unisex drape. Sized for relaxed layering.",
      origin: "Spun in Italy"
    },
    colors: [
      {
        name: "Oatmeal Heather",
        hex: "#D6CFC7",
        images: [
          "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=80",
          "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1000&q=80"
        ]
      },
      {
        name: "Sage Green",
        hex: "#8A9A86",
        images: [
          "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=80"
        ]
      }
    ],
    variants: [
      { id: 201, sku: "U-KNT-OAT-S", color: "Oatmeal Heather", size: "S", stock: 5, price: 195.00 },
      { id: 202, sku: "U-KNT-OAT-M", color: "Oatmeal Heather", size: "M", stock: 9, price: 195.00 },
      { id: 203, sku: "U-KNT-OAT-L", color: "Oatmeal Heather", size: "L", stock: 4, price: 195.00 },
      { id: 204, sku: "U-KNT-SGE-S", color: "Sage Green", size: "S", stock: 3, price: 195.00 },
      { id: 205, sku: "U-KNT-SGE-M", color: "Sage Green", size: "M", stock: 6, price: 195.00 },
      { id: 206, sku: "U-KNT-SGE-L", color: "Sage Green", size: "L", stock: 1, price: 195.00 }
    ]
  },
  {
    id: 3,
    title: "Heavyweight Boxy Cotton Tee",
    slug: "heavyweight-boxy-cotton-tee",
    category: "Tops & Shirts",
    categorySlug: "tops-shirts",
    gender: "unisex",
    basePrice: 55.00,
    compareAtPrice: null,
    isFeatured: true,
    isNew: false,
    rating: 4.7,
    reviewCount: 95,
    description: "The definitive everyday boxy tee. Cut from ultra-dense 300 GSM combed organic cotton with a reinforced 1.25\" ribbed collar that never sags.",
    details: {
      fabric: "100% GOTS Certified Organic Combed Cotton (300 GSM)",
      care: "Machine wash cold inside out. Hang dry or tumble dry low.",
      fit: "Boxy, dropped shoulders with structured drape.",
      origin: "Made in Los Angeles"
    },
    colors: [
      {
        name: "Chalk White",
        hex: "#F8F8F6",
        images: [
          "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80",
          "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80"
        ]
      },
      {
        name: "Vintage Washed Black",
        hex: "#2B2B2B",
        images: [
          "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80"
        ]
      },
      {
        name: "Earthy Terracotta",
        hex: "#BD6B53",
        images: [
          "https://images.unsplash.com/photo-1527719327859-c6ce80353573?auto=format&fit=crop&w=1000&q=80"
        ]
      }
    ],
    variants: [
      { id: 301, sku: "U-TEE-WHT-XS", color: "Chalk White", size: "XS", stock: 12, price: 55.00 },
      { id: 302, sku: "U-TEE-WHT-S", color: "Chalk White", size: "S", stock: 18, price: 55.00 },
      { id: 303, sku: "U-TEE-WHT-M", color: "Chalk White", size: "M", stock: 24, price: 55.00 },
      { id: 304, sku: "U-TEE-WHT-L", color: "Chalk White", size: "L", stock: 15, price: 55.00 },
      { id: 305, sku: "U-TEE-WHT-XL", color: "Chalk White", size: "XL", stock: 8, price: 55.00 },
      { id: 306, sku: "U-TEE-BLK-S", color: "Vintage Washed Black", size: "S", stock: 10, price: 55.00 },
      { id: 307, sku: "U-TEE-BLK-M", color: "Vintage Washed Black", size: "M", stock: 14, price: 55.00 },
      { id: 308, sku: "U-TEE-BLK-L", color: "Vintage Washed Black", size: "L", stock: 11, price: 55.00 },
      { id: 309, sku: "U-TEE-TER-M", color: "Earthy Terracotta", size: "M", stock: 6, price: 55.00 }
    ]
  },
  {
    id: 4,
    title: "Relaxed Pleated Wool Trousers",
    slug: "relaxed-pleated-wool-trousers",
    category: "Trousers & Denim",
    categorySlug: "trousers-denim",
    gender: "men",
    basePrice: 165.00,
    compareAtPrice: 195.00,
    isFeatured: true,
    isNew: true,
    rating: 4.9,
    reviewCount: 27,
    description: "Modern tailoring with dual front reverse pleats, extended tab waistband, and a gentle taper that breaks cleanly over loafers or chunky leather boots.",
    details: {
      fabric: "100% Tropical Virgin Wool; Interior pocketing: 100% Cotton Twill",
      care: "Dry clean only. Press with warm iron over pressing cloth.",
      fit: "High-rise, relaxed thigh, soft ankle taper.",
      origin: "Tailored in Italy"
    },
    colors: [
      {
        name: "Charcoal Melange",
        hex: "#3F4246",
        images: [
          "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=1000&q=80",
          "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80"
        ]
      },
      {
        name: "Warm Khaki",
        hex: "#C3B091",
        images: [
          "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=1000&q=80"
        ]
      }
    ],
    variants: [
      { id: 401, sku: "M-TRS-CHR-30", color: "Charcoal Melange", size: "S", stock: 5, price: 165.00 },
      { id: 402, sku: "M-TRS-CHR-32", color: "Charcoal Melange", size: "M", stock: 8, price: 165.00 },
      { id: 403, sku: "M-TRS-CHR-34", color: "Charcoal Melange", size: "L", stock: 4, price: 165.00 },
      { id: 404, sku: "M-TRS-KHK-32", color: "Warm Khaki", size: "M", stock: 6, price: 165.00 },
      { id: 405, sku: "M-TRS-KHK-34", color: "Warm Khaki", size: "L", stock: 3, price: 165.00 }
    ]
  },
  {
    id: 5,
    title: "Oversized Denim Trucker Jacket",
    slug: "oversized-denim-trucker-jacket",
    category: "Outerwear",
    categorySlug: "outerwear",
    gender: "unisex",
    basePrice: 175.00,
    compareAtPrice: 210.00,
    isFeatured: false,
    isNew: false,
    rating: 4.6,
    reviewCount: 31,
    description: "Constructed from 14.5 oz Japanese raw selvedge denim. Treated with a subtle stone enzyme wash for a broken-in vintage patina with antique copper hardware.",
    details: {
      fabric: "100% Kuroki Mills Japanese Selvedge Cotton Denim (14.5 oz)",
      care: "Wash sparingly. Cold wash inside out, line dry.",
      fit: "Drop-shoulder boxy fit with slightly cropped body length.",
      origin: "Crafted in Okayama, Japan"
    },
    colors: [
      {
        name: "Vintage Indigo",
        hex: "#34495E",
        images: [
          "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=1000&q=80",
          "https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=1000&q=80"
        ]
      },
      {
        name: "Faded Bone",
        hex: "#E5E1D8",
        images: [
          "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=80"
        ]
      }
    ],
    variants: [
      { id: 501, sku: "U-JCK-IND-S", color: "Vintage Indigo", size: "S", stock: 6, price: 175.00 },
      { id: 502, sku: "U-JCK-IND-M", color: "Vintage Indigo", size: "M", stock: 10, price: 175.00 },
      { id: 503, sku: "U-JCK-IND-L", color: "Vintage Indigo", size: "L", stock: 3, price: 175.00 },
      { id: 504, sku: "U-JCK-BNE-M", color: "Faded Bone", size: "M", stock: 5, price: 175.00 }
    ]
  },
  {
    id: 6,
    title: "Relaxed Linen Camp Collar Shirt",
    slug: "relaxed-linen-camp-collar-shirt",
    category: "Tops & Shirts",
    categorySlug: "tops-shirts",
    gender: "men",
    basePrice: 98.00,
    compareAtPrice: 120.00,
    isFeatured: true,
    isNew: false,
    rating: 4.8,
    reviewCount: 54,
    description: "Breathable airy French flax linen featuring an open Cuban camp collar, clean French seams, straight split hem, and genuine mother-of-pearl buttons.",
    details: {
      fabric: "100% Normandy French Flax Linen (180 GSM)",
      care: "Machine wash delicate cold. Line dry or tumble dry delicate.",
      fit: "Relaxed resort silhouette with straight hem.",
      origin: "Woven in Portugal"
    },
    colors: [
      {
        name: "Ecru Flax",
        hex: "#E8E2D5",
        images: [
          "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80",
          "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80"
        ]
      },
      {
        name: "Dusty Olive",
        hex: "#556B2F",
        images: [
          "https://images.unsplash.com/photo-1622445268045-8f6735a4bf6b?auto=format&fit=crop&w=1000&q=80"
        ]
      }
    ],
    variants: [
      { id: 601, sku: "M-SHT-ECR-S", color: "Ecru Flax", size: "S", stock: 8, price: 98.00 },
      { id: 602, sku: "M-SHT-ECR-M", color: "Ecru Flax", size: "M", stock: 12, price: 98.00 },
      { id: 603, sku: "M-SHT-ECR-L", color: "Ecru Flax", size: "L", stock: 7, price: 98.00 },
      { id: 604, sku: "M-SHT-OLV-M", color: "Dusty Olive", size: "M", stock: 9, price: 98.00 }
    ]
  },
  {
    id: 7,
    title: "Silk-Blend Bias Cut Slip Dress",
    slug: "silk-blend-bias-cut-slip-dress",
    category: "Tops & Shirts",
    categorySlug: "tops-shirts",
    gender: "women",
    basePrice: 180.00,
    compareAtPrice: 220.00,
    isFeatured: true,
    isNew: true,
    rating: 4.9,
    reviewCount: 19,
    description: "Gracefully draped on the true diagonal bias to skim natural curves. Features delicate adjustable spaghetti straps, a soft cowl neckline, and a fluid midi-length hem.",
    details: {
      fabric: "70% Mulberry Silk, 30% EcoVero Viscose",
      care: "Hand wash cold inside out with silk detergent or dry clean.",
      fit: "Skimming bias cut that contours without clinging.",
      origin: "Crafted in Milan"
    },
    colors: [
      {
        name: "Champagne Pearl",
        hex: "#F1E9DB",
        images: [
          "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?auto=format&fit=crop&w=1000&q=80",
          "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=80"
        ]
      },
      {
        name: "Midnight Navy",
        hex: "#1A2536",
        images: [
          "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=80"
        ]
      }
    ],
    variants: [
      { id: 701, sku: "W-DRS-CHM-XS", color: "Champagne Pearl", size: "XS", stock: 3, price: 180.00 },
      { id: 702, sku: "W-DRS-CHM-S", color: "Champagne Pearl", size: "S", stock: 6, price: 180.00 },
      { id: 703, sku: "W-DRS-CHM-M", color: "Champagne Pearl", size: "M", stock: 5, price: 180.00 },
      { id: 704, sku: "W-DRS-NAV-S", color: "Midnight Navy", size: "S", stock: 4, price: 180.00 },
      { id: 705, sku: "W-DRS-NAV-M", color: "Midnight Navy", size: "M", stock: 2, price: 180.00 }
    ]
  },
  {
    id: 8,
    title: "Minimalist Italian Leather Tote",
    slug: "minimalist-italian-leather-tote",
    category: "Accessories",
    categorySlug: "accessories",
    gender: "unisex",
    basePrice: 220.00,
    compareAtPrice: 260.00,
    isFeatured: false,
    isNew: true,
    rating: 5.0,
    reviewCount: 16,
    description: "Sculpted from vegetable-tanned Tuscan full-grain leather. Unlined interior with a removable zippered clutch pouch, magnetic top clasp, and reinforced shoulder straps.",
    details: {
      fabric: "100% Tuscan Full-Grain Vegetable-Tanned Cowhide",
      care: "Wipe clean with soft microfiber cloth. Condition annually.",
      fit: "Fits up to 16\" MacBook Pro + daily essentials.",
      origin: "Handcrafted in Florence, Italy"
    },
    colors: [
      {
        name: "Cognac Tan",
        hex: "#9E5B32",
        images: [
          "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80",
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80"
        ]
      },
      {
        name: "Jet Matte Black",
        hex: "#111111",
        images: [
          "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=80"
        ]
      }
    ],
    variants: [
      { id: 801, sku: "U-BAG-COG-ONE", color: "Cognac Tan", size: "ONE SIZE", stock: 9, price: 220.00 },
      { id: 802, sku: "U-BAG-BLK-ONE", color: "Jet Matte Black", size: "ONE SIZE", stock: 6, price: 220.00 }
    ]
  }
];

export const MOCK_PROMO_CODES = {
  "SAVE15": { discountPercent: 15, minSpend: 50.00, description: "15% off orders over $50" },
  "WELCOME10": { discountPercent: 10, minSpend: 0.00, description: "10% off your entire order" },
  "FREESHIP": { freeShipping: true, minSpend: 0.00, description: "Complimentary Express Delivery" }
};

export const MOCK_SIZE_GUIDE = {
  inches: [
    { size: "XS", chest: "32-34", waist: "26-28", hips: "34-36", length: "27.5" },
    { size: "S", chest: "35-37", waist: "29-31", hips: "37-39", length: "28.0" },
    { size: "M", chest: "38-40", waist: "32-34", hips: "40-42", length: "29.0" },
    { size: "L", chest: "41-43", waist: "35-37", hips: "43-45", length: "30.0" },
    { size: "XL", chest: "44-46", waist: "38-40", hips: "46-48", length: "30.5" },
    { size: "XXL", chest: "47-49", waist: "41-43", hips: "49-51", length: "31.0" }
  ],
  cm: [
    { size: "XS", chest: "81-86", waist: "66-71", hips: "86-91", length: "70.0" },
    { size: "S", chest: "89-94", waist: "74-79", hips: "94-99", length: "71.0" },
    { size: "M", chest: "97-102", waist: "81-86", hips: "102-107", length: "73.5" },
    { size: "L", chest: "104-109", waist: "89-94", hips: "109-114", length: "76.0" },
    { size: "XL", chest: "112-117", waist: "97-102", hips: "117-122", length: "77.5" },
    { size: "XXL", chest: "119-124", waist: "104-109", hips: "124-129", length: "79.0" }
  ]
};

export const MOCK_ORDERS = [
  {
    orderNumber: "ORD-2026-7842",
    date: "2026-10-14T11:20:00Z",
    customer: { name: "Sophia Reynolds", email: "sophia.r@example.com" },
    shippingAddress: "742 Evergreen Terrace, Brooklyn, NY 11201",
    items: [
      { title: "Double-Breasted Wool Trench Coat", color: "Camel Dune", size: "S", qty: 1, price: 285.00, sku: "W-TRN-CAM-S", image: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=200&q=80" },
      { title: "Heavyweight Boxy Cotton Tee", color: "Chalk White", size: "M", qty: 2, price: 55.00, sku: "U-TEE-WHT-M", image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=80" }
    ],
    subtotal: 395.00,
    discount: 59.25,
    shipping: 0.00,
    tax: 28.54,
    total: 364.29,
    status: "processing",
    trackingCarrier: "FedEx Express",
    trackingNumber: "FX-9942-8812-US"
  },
  {
    orderNumber: "ORD-2026-7731",
    date: "2026-10-12T14:45:00Z",
    customer: { name: "Marcus Vance", email: "marcus.v@example.com" },
    shippingAddress: "1204 Pine St, San Francisco, CA 94109",
    items: [
      { title: "Relaxed Pleated Wool Trousers", color: "Charcoal Melange", size: "M", qty: 1, price: 165.00, sku: "M-TRS-CHR-32", image: "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=200&q=80" }
    ],
    subtotal: 165.00,
    discount: 0.00,
    shipping: 5.00,
    tax: 14.45,
    total: 184.45,
    status: "shipped",
    trackingCarrier: "UPS Ground",
    trackingNumber: "1Z9999999999999999"
  }
];
