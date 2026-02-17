/* FAIDE app.js — Nike-like interactions (Quick View + Cart Drawer)
   Works with your existing HTML IDs/classes.
*/

(() => {
  // -----------------------------
  // Helpers
  // -----------------------------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const lockScroll = (lock) => {
    document.documentElement.style.overflow = lock ? "hidden" : "";
    document.body.style.overflow = lock ? "hidden" : "";
  };

  const formatZAR = (value) => {
    // Keep your Rand style (Rxxx.xx) — no palette changes.
    const num = Number(value || 0);
    return num.toFixed(2);
  };

  // -----------------------------
  // Elements (from your HTML)
  // -----------------------------
  const shopNowBtn = $("#shop-now-btn");
  const navLinks = $$(".nav-links a");

  // Lookbook modal
  const galleryModal = $("#gallery-modal");
  const galleryClose = $("#gallery-close");
  const galleryImg = $("#gallery-img");
  const galleryTitle = $("#gallery-title");
  const galleryCounter = $("#gallery-counter");
  const lookbookCards = $$(".lookbook-card");

  // Product modal (Quick View)
  const productModal = $("#product-modal");
  const pmClose = $("#pm-close");
  const pmImg = $("#pm-img");
  const pmThumbs = $("#pm-thumbs");
  const pmLabel = $("#pm-label");
  const pmName = $("#pm-name");
  const pmCategory = $("#pm-category");
  const pmColorsText = $("#pm-colors");
  const pmPrice = $("#pm-price");
  const pmSizes = $("#pm-sizes");
  const pmColorsRow = $("#pm-colors-row");
  const pmAdd = $("#pm-add");
  const pmSubtitle = $("#pm-subtitle");

  // Cart
  const floatingCart = $("#floating-cart");
  const cartSidebar = $("#cart-sidebar");
  const cartOverlay = $("#cart-overlay");
  const closeCartBtn = $("#close-cart");
  const cartCount = $("#cart-count");
  const cartItemsList = $("#cart-items");
  const cartTotal = $("#cart-total");
  const checkoutBtn = $("#checkout-btn");

  // Toast
  const cartToast = $("#cartToast");
  const cartMessage = $("#cartMessage");

  // Policy modal (optional)
  const policyModal = $("#policy-modal");
  const closePolicy = $("#close-modal");
  const modalContent = $("#modal-content");
  const modalTitle = $("#modal-title");

  // Products (cards)
  const productCards = $$(".product");

  // -----------------------------
  // State
  // -----------------------------
  const STORAGE_KEY = "faide_cart_v1";
  let cart = loadCart();
  let activeModal = null; // "gallery" | "product" | "cart" | "policy"
  let lastFocusedEl = null;

  // Quick View state
  let currentProduct = null; // { id, name, price, category, label, imagesByColor, sizes, colors }
  let pmSelectedSize = null;
  let pmSelectedColor = null;
  let pmQty = 1;

  // -----------------------------
  // Product Data (map to your current items)
  // You can expand images per color later without changing HTML.
  // -----------------------------
  const PRODUCT_DB = {
    "FAIDE Essentials Tank": {
      label: "Just In",
      category: "UNISEX Tank Top",
      price: 199.99,
      colors: ["Black", "White"],
      sizes: ["S", "M", "L", "XL"],
      imagesByColor: {
        Black: ["/images/tank-top.png"],
        White: ["/images/tank-top.png"],
      },
    },
    "FAIDE Signature Tee": {
      label: "Bestseller",
      category: "UNISEX Short-Sleeve Top",
      price: 349.99,
      colors: ["Black", "White", "Grey"],
      sizes: ["S", "M", "L", "XL"],
      imagesByColor: {
        Black: ["/images/tshirt.png"],
        White: ["/images/tshirt.png"],
        Grey: ["/images/tshirt.png"],
      },
    },
    "FAIDE Long Sleeve": {
      label: "Member Exclusive",
      category: "UNISEX Long Sleeve",
      price: 549.99,
      colors: ["Black", "White"],
      sizes: ["S", "M", "L", "XL"],
      imagesByColor: {
        Black: ["/images/longsleeve.png"],
        White: ["/images/longsleeve.png"],
      },
    },
    "FAIDE Luxury Hoodie": {
      label: "Premium",
      category: "UNISEX Pullover Hoodie",
      price: 699.99,
      colors: ["Black", "Grey"],
      sizes: ["S", "M", "L", "XL"],
      imagesByColor: {
        Black: ["/images/hoodie.png"],
        Grey: ["/images/hoodie.png"],
      },
    },
  };

  // -----------------------------
  // Smooth scroll behavior (Nike-like)
  // -----------------------------
  const smoothScrollTo = (target) => {
    const el = typeof target === "string" ? $(target) : target;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  navLinks.forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (href && href.startsWith("#")) {
        e.preventDefault();
        smoothScrollTo(href);
      }
    });
  });

  if (shopNowBtn) {
    shopNowBtn.addEventListener("click", () => smoothScrollTo("#shop"));
  }

  // Optional: Nike-like navbar hide/show on scroll
  const navbar = $(".navbar");
  let lastScrollY = window.scrollY;
  window.addEventListener("scroll", () => {
    if (!navbar) return;
    const y = window.scrollY;
    const goingDown = y > lastScrollY;
    lastScrollY = y;

    // Keep it subtle (no color changes)
    navbar.style.transform =
      goingDown && y > 80 ? "translateY(-110%)" : "translateY(0)";
  }, { passive: true });

  // -----------------------------
  // Modal utilities (focus + ESC + overlay)
  // -----------------------------
  const setActiveModal = (name, on) => {
    activeModal = on ? name : null;
  };

  const openModal = (el, name) => {
    if (!el) return;
    lastFocusedEl = document.activeElement;
    el.style.display = name === "policy" ? "block" : ""; // policy uses inline display:none
    el.setAttribute("aria-hidden", "false");
    setActiveModal(name, true);
    lockScroll(true);
    // Focus first close button inside modal
    const closeBtn = el.querySelector("button");
    if (closeBtn) closeBtn.focus();
  };

  const closeModal = (el, name) => {
    if (!el) return;
    if (name === "policy") el.style.display = "none";
    el.setAttribute("aria-hidden", "true");
    setActiveModal(name, false);
    lockScroll(false);
    if (lastFocusedEl) lastFocusedEl.focus();
  };

  const closeAll = () => {
    if (galleryModal && activeModal === "gallery") closeModal(galleryModal, "gallery");
    if (productModal && activeModal === "product") closeModal(productModal, "product");
    if (cartSidebar && activeModal === "cart") closeCart();
    if (policyModal && activeModal === "policy") closeModal(policyModal, "policy");
  };

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll();
  });

  // -----------------------------
  // Lookbook (Quick Gallery)
  // -----------------------------
  const openLookbook = (index) => {
    const card = lookbookCards[index];
    if (!card) return;
    const img = $("img", card);
    if (!img) return;

    if (galleryImg) galleryImg.src = img.getAttribute("src") || "";
    if (galleryTitle) galleryTitle.textContent = `Look ${index + 1}`;
    if (galleryCounter) galleryCounter.textContent = `${index + 1} / ${lookbookCards.length}`;

    openModal(galleryModal, "gallery");
  };

  lookbookCards.forEach((card, i) => {
    const handler = () => openLookbook(i);
    card.addEventListener("click", handler);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") handler();
    });
  });

  if (galleryClose) galleryClose.addEventListener("click", () => closeModal(galleryModal, "gallery"));
  if (galleryModal) {
    galleryModal.addEventListener("click", (e) => {
      if (e.target === galleryModal) closeModal(galleryModal, "gallery");
    });
  }

  // -----------------------------
  // Quick View (Product modal) - Nike-like
  // -----------------------------
  const buildColorDots = (colors, selected) => {
    if (!pmColorsRow) return;
    pmColorsRow.innerHTML = "";

    colors.forEach((c) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "color";
      dot.setAttribute("aria-label", c);
      dot.setAttribute("data-color", c);
      dot.style.border = c === selected ? "2px solid #fff" : "";

      // Reuse your existing color classes if present
      // black/white/grey
      const lc = c.toLowerCase();
      if (lc.includes("black")) dot.classList.add("black");
      else if (lc.includes("white")) dot.classList.add("white");
      else if (lc.includes("grey") || lc.includes("gray")) dot.classList.add("grey");

      pmColorsRow.appendChild(dot);
    });
  };

  const buildSizes = (sizes, selected) => {
    if (!pmSizes) return;
    pmSizes.innerHTML = "";
    sizes.forEach((s) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "size-btn";
      btn.textContent = s;
      btn.dataset.size = s;
      if (s === selected) btn.classList.add("active");
      pmSizes.appendChild(btn);
    });
  };

  const buildThumbs = (images, activeSrc) => {
    if (!pmThumbs) return;
    pmThumbs.innerHTML = "";
    images.forEach((src) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "thumb";
      b.setAttribute("aria-label", "Change image");
      const im = document.createElement("img");
      im.src = src;
      im.alt = "Thumbnail";
      b.appendChild(im);

      if (src === activeSrc) b.style.outline = "2px solid rgba(255,255,255,0.9)";
      b.addEventListener("click", () => {
        if (pmImg) pmImg.src = src;
        buildThumbs(images, src);
      });

      pmThumbs.appendChild(b);
    });
  };

  const updatePmAddState = () => {
    const ok = Boolean(pmSelectedSize && pmSelectedColor);
    if (pmAdd) {
      pmAdd.disabled = !ok;
      pmAdd.title = ok ? "" : "Select size & color first";
    }
  };

  const openProductQuickView = (productName) => {
    const data = PRODUCT_DB[productName];
    if (!data) return;

    currentProduct = {
      id: productName,
      name: productName,
      ...data,
    };

    // Reset selections like Nike Quick View does
    pmSelectedSize = null;
    pmSelectedColor = data.colors[0] || null;
    pmQty = 1;

    // Fill UI
    if (pmLabel) pmLabel.textContent = data.label || "";
    if (pmName) pmName.textContent = productName;
    if (pmCategory) pmCategory.textContent = data.category || "";
    if (pmColorsText) pmColorsText.textContent = `${data.colors.length} Colors`;
    if (pmPrice) pmPrice.textContent = `R${formatZAR(data.price)}`;
    if (pmSubtitle) pmSubtitle.textContent = "Quick View";

    // Images
    const imgs = (data.imagesByColor[pmSelectedColor] || []).slice();
    const main = imgs[0] || "";
    if (pmImg) pmImg.src = main;
    buildThumbs(imgs, main);

    // Controls
    buildSizes(data.sizes, pmSelectedSize);
    buildColorDots(data.colors, pmSelectedColor);

    // Qty UI inside modal (data-qty-root="pm")
    const pmQtyRoot = productModal?.querySelector('[data-qty-root="pm"]');
    if (pmQtyRoot) {
      const v = pmQtyRoot.querySelector("[data-qty-value]");
      if (v) v.textContent = String(pmQty);
    }

    updatePmAddState();
    openModal(productModal, "product");
  };

  // Open quick view when product card is clicked (Nike-style)
  productCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      // If user clicks a button inside, let that control handle itself
      const isInteractive = e.target.closest("button,a,input,select,textarea");
      if (isInteractive) return;

      const name = card.dataset.name || $("h3", card)?.textContent?.trim();
      if (name) openProductQuickView(name);
    });
  });

  // Product modal interactions (sizes/colors/add/qty)
  if (productModal) {
    productModal.addEventListener("click", (e) => {
      const sizeBtn = e.target.closest(".size-btn");
      const colorBtn = e.target.closest(".color");
      const addBtn = e.target.closest("#pm-add");
      const closeBtn = e.target.closest("#pm-close");
      const qtyBtn = e.target.closest('[data-qty-root="pm"] [data-qty-btn]');

      if (closeBtn) {
        closeModal(productModal, "product");
        return;
      }

      if (sizeBtn && sizeBtn.dataset.size) {
        pmSelectedSize = sizeBtn.dataset.size;
        buildSizes(currentProduct.sizes, pmSelectedSize);
        updatePmAddState();
        return;
      }

      if (colorBtn && colorBtn.dataset.color) {
        pmSelectedColor = colorBtn.dataset.color;
        buildColorDots(currentProduct.colors, pmSelectedColor);

        const imgs = (currentProduct.imagesByColor[pmSelectedColor] || []).slice();
        const main = imgs[0] || "";
        if (pmImg) pmImg.src = main;
        buildThumbs(imgs, main);

        updatePmAddState();
        return;
      }

      if (qtyBtn) {
        const dir = qtyBtn.getAttribute("data-qty-btn");
        pmQty = clamp(pmQty + (dir === "inc" ? 1 : -1), 1, 99);
        const root = qtyBtn.closest('[data-qty-root="pm"]');
        const v = root?.querySelector("[data-qty-value]");
        if (v) v.textContent = String(pmQty);
        return;
      }

      if (addBtn) {
        if (!currentProduct) return;
        if (!pmSelectedSize || !pmSelectedColor) return;

        addToCart({
          id: currentProduct.id,
          name: currentProduct.name,
          price: currentProduct.price,
          size: pmSelectedSize,
          color: pmSelectedColor,
          qty: pmQty,
          image: (currentProduct.imagesByColor[pmSelectedColor] || [])[0] || "",
        });

        showToast("Added to cart!");
        // Nike often keeps quick view open; we’ll keep it open too.
        return;
      }
    });

    // click outside closes
    productModal.addEventListener("click", (e) => {
      if (e.target === productModal) closeModal(productModal, "product");
    });
  }

  // -----------------------------
  // Card-level “Add to Bag” (optional Nike-like gating)
  // This keeps your current card UI working properly.
  // -----------------------------
  productCards.forEach((card) => {
    const addBtn = $(".add-to-cart", card);
    const sizeBtns = $$(".sizes .size-btn", card);
    const colorDots = $$(".colors .color", card);
    const qtyRoot = card.querySelector('[data-qty-root="card"]');

    let selectedSize = null;
    let selectedColor = null;
    let qty = 1;

    const name = card.dataset.name;
    const data = PRODUCT_DB[name];

    const setAddEnabled = () => {
      const ok = Boolean(selectedSize && selectedColor);
      if (addBtn) addBtn.disabled = !ok;
    };

    // size select
    sizeBtns.forEach((b) => {
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        selectedSize = b.dataset.size;
        sizeBtns.forEach((x) => x.classList.toggle("active", x === b));
        setAddEnabled();
      });
    });

    // color select
    colorDots.forEach((d) => {
      d.addEventListener("click", (e) => {
        e.stopPropagation();
        selectedColor = d.dataset.color;
        colorDots.forEach((x) => (x.style.outline = x === d ? "2px solid rgba(255,255,255,0.9)" : ""));
        setAddEnabled();
      });
    });

    // qty stepper
    if (qtyRoot) {
      qtyRoot.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-qty-btn]");
        if (!btn) return;
        e.stopPropagation();
        const dir = btn.getAttribute("data-qty-btn");
        qty = clamp(qty + (dir === "inc" ? 1 : -1), 1, 99);
        const v = qtyRoot.querySelector("[data-qty-value]");
        if (v) v.textContent = String(qty);
      });
    }

    // add to cart
    if (addBtn) {
      addBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!data || !selectedSize || !selectedColor) return;

        addToCart({
          id: name,
          name,
          price: data.price,
          size: selectedSize,
          color: selectedColor,
          qty,
          image: (data.imagesByColor[selectedColor] || [])[0] || $("img", card)?.src || "",
        });

        showToast("Added to cart!");
      });
    }

    setAddEnabled();
  });

  // -----------------------------
  // Cart logic (Nike-like drawer)
  // -----------------------------
  function loadCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveCart() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }

  function addToCart(item) {
    // Merge same item by id+size+color
    const key = `${item.id}__${item.size}__${item.color}`;
    const existing = cart.find((x) => `${x.id}__${x.size}__${x.color}` === key);
    if (existing) existing.qty += item.qty;
    else cart.push({ ...item });

    saveCart();
    renderCart();
    openCart(); // Nike usually opens cart after adding; if you don’t want this, remove this line.
  }

  function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    renderCart();
  }

  function updateCartQty(index, delta) {
    const item = cart[index];
    if (!item) return;
    item.qty = clamp(item.qty + delta, 1, 99);
    saveCart();
    renderCart();
  }

  function calcTotals() {
    const count = cart.reduce((a, b) => a + (b.qty || 0), 0);
    const total = cart.reduce((a, b) => a + (Number(b.price) * (b.qty || 0)), 0);
    return { count, total };
  }

  function renderCart() {
    const { count, total } = calcTotals();
    if (cartCount) cartCount.textContent = String(count);
    if (cartTotal) cartTotal.textContent = formatZAR(total);
    if (checkoutBtn) checkoutBtn.disabled = count === 0;

    if (!cartItemsList) return;
    cartItemsList.innerHTML = "";

    cart.forEach((item, idx) => {
      const li = document.createElement("li");
      li.className = "cart-item";

      li.innerHTML = `
        <div class="cart-item-row" style="display:flex; gap:12px; align-items:flex-start;">
          <div style="width:64px; height:64px; border-radius:12px; overflow:hidden; border:1px solid var(--border); flex:0 0 auto;">
            <img src="${item.image || ""}" alt="${item.name}" style="width:100%; height:100%; object-fit:cover;" />
          </div>

          <div style="flex:1; min-width:0;">
            <div style="display:flex; justify-content:space-between; gap:10px;">
              <div style="min-width:0;">
                <div style="font-weight:900; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.name}</div>
                <div style="color:#9a9a9a; font-weight:700; margin-top:4px;">${item.color} • Size ${item.size}</div>
              </div>
              <div style="font-weight:900; color:#fff; white-space:nowrap;">R${formatZAR(item.price)}</div>
            </div>

            <div style="display:flex; align-items:center; justify-content:space-between; margin-top:10px;">
              <div class="qty-stepper-ui" data-cart-qty="${idx}">
                <button type="button" class="qty-btn-ui" data-cart-dec aria-label="Decrease quantity">−</button>
                <div class="qty-value-ui">${item.qty}</div>
                <button type="button" class="qty-btn-ui" data-cart-inc aria-label="Increase quantity">+</button>
              </div>

              <button type="button" class="gallery-btn" data-cart-remove="${idx}" style="color:#bbb;">Remove</button>
            </div>
          </div>
        </div>
      `;
      cartItemsList.appendChild(li);
    });
  }

  function openCart() {
    if (!cartSidebar || !cartOverlay) return;
    cartSidebar.classList.add("open");
    cartOverlay.classList.add("show");
    setActiveModal("cart", true);
    lockScroll(true);
  }

  function closeCart() {
    if (!cartSidebar || !cartOverlay) return;
    cartSidebar.classList.remove("open");
    cartOverlay.classList.remove("show");
    setActiveModal("cart", false);
    lockScroll(false);
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  if (floatingCart) {
    floatingCart.addEventListener("click", () => {
      lastFocusedEl = document.activeElement;
      openCart();
    });
  }
  if (closeCartBtn) closeCartBtn.addEventListener("click", closeCart);
  if (cartOverlay) cartOverlay.addEventListener("click", closeCart);

  // Cart controls (event delegation)
  if (cartItemsList) {
    cartItemsList.addEventListener("click", (e) => {
      const removeBtn = e.target.closest("[data-cart-remove]");
      const decBtn = e.target.closest("[data-cart-dec]");
      const incBtn = e.target.closest("[data-cart-inc]");
      if (removeBtn) return removeFromCart(Number(removeBtn.dataset.cartRemove));
      const stepper = e.target.closest("[data-cart-qty]");
      if (!stepper) return;
      const idx = Number(stepper.dataset.cartQty);
      if (decBtn) updateCartQty(idx, -1);
      if (incBtn) updateCartQty(idx, +1);
    });
  }

  // -----------------------------
  // Toast
  // -----------------------------
  let toastTimer = null;
  function showToast(text) {
    if (!cartToast) return;
    if (cartMessage) cartMessage.textContent = text || "Added to cart!";
    cartToast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => cartToast.classList.remove("show"), 1600);
  }

  // -----------------------------
  // Policies (optional)
  // You can plug content into modal-content; this keeps your current UI.
  // -----------------------------
  const privacyLink = $("#privacy-link");
  const shippingLink = $("#shipping-link");
  const termsLink = $("#terms-link");
  const returnsLink = $("#returns-link");

  const POLICY_TEXT = {
    Privacy: "Add your Privacy Policy text here.",
    Shipping: "Add your Shipping Policy text here.",
    Terms: "Add your Terms of Service text here.",
    Returns: "Add your Return & Exchange policy text here.",
  };

  const openPolicy = (title) => {
    if (!policyModal) return;
    if (modalTitle) modalTitle.textContent = title;
    if (modalContent) modalContent.textContent = POLICY_TEXT[title] || "";
    openModal(policyModal, "policy");
  };

  privacyLink?.addEventListener("click", (e) => { e.preventDefault(); openPolicy("Privacy"); });
  shippingLink?.addEventListener("click", (e) => { e.preventDefault(); openPolicy("Shipping"); });
  termsLink?.addEventListener("click", (e) => { e.preventDefault(); openPolicy("Terms"); });
  returnsLink?.addEventListener("click", (e) => { e.preventDefault(); openPolicy("Returns"); });
  closePolicy?.addEventListener("click", () => closeModal(policyModal, "policy"));

  policyModal?.addEventListener("click", (e) => {
    if (e.target === policyModal) closeModal(policyModal, "policy");
  });

  // -----------------------------
  // Init
  // -----------------------------
  renderCart();
})();