/*************************************************************
 * SINGLE shared helper
 *************************************************************/
function clickOnEnterSpace(el, fn) {
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fn();
    }
  });
}

/*************************************************************
 * CONFIG (Element SDK)
 *************************************************************/
const defaultConfig = {
  brand_name: "FAIDE",
  hero_title: "NEW DROP",
  hero_description: "New drops, exclusive releases, and updates are announced on our social platforms.",
  about_headline: "About FAIDE",
  about_description:
    "FAIDE is a luxury streetwear brand built for those who move in silence. Designed with intention. Worn with purpose.",
  background_color: "#000000",
  surface_color: "#111111",
  text_color: "#ffffff",
  primary_accent: "#a855f7",
  secondary_accent: "#9333ea",
  font_family: "Inter",
  font_size: 16
};

function setCSSVar(name, value) {
  if (!value) return;
  document.documentElement.style.setProperty(name, value);
}

async function onConfigChange(config) {
  const heroTitle = config.hero_title || defaultConfig.hero_title;
  const heroDescription = config.hero_description || defaultConfig.hero_description;

  const aboutHeadline = config.about_headline || defaultConfig.about_headline;
  const aboutDescription = config.about_description || defaultConfig.about_description;

  const backgroundColor = config.background_color || defaultConfig.background_color;
  const surfaceColor = config.surface_color || defaultConfig.surface_color;
  const textColor = config.text_color || defaultConfig.text_color;
  const primaryAccent = config.primary_accent || defaultConfig.primary_accent;
  const secondaryAccent = config.secondary_accent || defaultConfig.secondary_accent;
  const customFont = config.font_family || defaultConfig.font_family;

  const heroTitleEl = document.getElementById("hero-title");
  const heroDescEl = document.getElementById("hero-description");
  if (heroTitleEl) heroTitleEl.textContent = heroTitle;
  if (heroDescEl) heroDescEl.textContent = heroDescription;

  const aboutTitleEl = document.getElementById("about-title");
  const aboutDescEl = document.getElementById("about-description");
  if (aboutTitleEl) aboutTitleEl.textContent = aboutHeadline;
  if (aboutDescEl) aboutDescEl.textContent = aboutDescription;

  setCSSVar("--bg", backgroundColor);
  setCSSVar("--surface", surfaceColor);
  setCSSVar("--text", textColor);
  setCSSVar("--primary", primaryAccent);
  setCSSVar("--secondary", secondaryAccent);

  document.body.style.fontFamily = `${customFont}, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;

  const heroTitleNode = document.querySelector(".hero-title");
  if (heroTitleNode) heroTitleNode.style.textShadow = `0 0 40px ${primaryAccent}80`;
}

function mapToCapabilities(config) {
  return {
    recolorables: [
      { get: () => config.background_color || defaultConfig.background_color, set: (v) => window.elementSdk?.setConfig?.({ background_color: (config.background_color = v) }) },
      { get: () => config.surface_color || defaultConfig.surface_color, set: (v) => window.elementSdk?.setConfig?.({ surface_color: (config.surface_color = v) }) },
      { get: () => config.text_color || defaultConfig.text_color, set: (v) => window.elementSdk?.setConfig?.({ text_color: (config.text_color = v) }) },
      { get: () => config.primary_accent || defaultConfig.primary_accent, set: (v) => window.elementSdk?.setConfig?.({ primary_accent: (config.primary_accent = v) }) },
      { get: () => config.secondary_accent || defaultConfig.secondary_accent, set: (v) => window.elementSdk?.setConfig?.({ secondary_accent: (config.secondary_accent = v) }) },
    ],
    borderables: [],
    fontEditable: { get: () => config.font_family || defaultConfig.font_family, set: (v) => window.elementSdk?.setConfig?.({ font_family: (config.font_family = v) }) },
    fontSizeable: { get: () => config.font_size || defaultConfig.font_size, set: (v) => window.elementSdk?.setConfig?.({ font_size: (config.font_size = v) }) },
  };
}

function mapToEditPanelValues(config) {
  return new Map([
    ["brand_name", config.brand_name || defaultConfig.brand_name],
    ["hero_title", config.hero_title || defaultConfig.hero_title],
    ["hero_description", config.hero_description || defaultConfig.hero_description],
    ["about_headline", config.about_headline || defaultConfig.about_headline],
    ["about_description", config.about_description || defaultConfig.about_description]
  ]);
}

async function waitForElementSdk(timeoutMs = 2500) {
  const start = Date.now();
  while (!window.elementSdk) {
    if (Date.now() - start > timeoutMs) return false;
    await new Promise(r => setTimeout(r, 50));
  }
  return true;
}

(async () => {
  const ready = await waitForElementSdk();
  if (ready) {
    window.elementSdk.init({ defaultConfig, onConfigChange, mapToCapabilities, mapToEditPanelValues });
  } else {
    onConfigChange({ ...defaultConfig });
  }
})();

/*************************************************************
 * PRODUCT ALT IMAGES (used by Product Modal)
 *************************************************************/
function buildVariantSrc(baseSrc, n) {
  const qIndex = baseSrc.indexOf("?");
  const clean = qIndex >= 0 ? baseSrc.slice(0, qIndex) : baseSrc;
  const query = qIndex >= 0 ? baseSrc.slice(qIndex) : "";

  const dot = clean.lastIndexOf(".");
  if (dot < 0) return baseSrc;
  const left = clean.slice(0, dot);
  const ext = clean.slice(dot);
  return `${left}${n}${ext}${query}`;
}

function imageExists(src, timeoutMs = 900) {
  return new Promise((resolve) => {
    const img = new Image();
    let done = false;

    const finish = (ok) => {
      if (done) return;
      done = true;
      resolve(ok);
    };

    const t = setTimeout(() => finish(false), timeoutMs);

    img.onload = () => { clearTimeout(t); finish(true); };
    img.onerror = () => { clearTimeout(t); finish(false); };
    img.src = src;
  });
}

/*************************************************************
 * CART MEMORY (localStorage)
 *************************************************************/
const CART_STORAGE_KEY = "faide_cart_v1";
function loadCartFromStorage(){
  try{
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  }catch(_){
    return [];
  }
}
function saveCartToStorage(nextCart){
  try{
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(nextCart || []));
  }catch(_){}
}

/*************************************************************
 * CART + WHATSAPP CHECKOUT
 *************************************************************/
const WHATSAPP_NUMBER = "27695603929";
let cart = [];

function showCartToast(message) {
  const toast = document.getElementById("cartToast");
  const messageEl = document.getElementById("cartMessage");
  if (!toast || !messageEl) return;
  messageEl.textContent = message;
  toast.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}

function checkoutOnWhatsApp() {
  if (!cart || cart.length === 0) return showCartToast("Your cart is empty.");

  const lines = [];
  lines.push("Hi FAIDE, I want to place an order:");
  lines.push("");

  let total = 0;

  cart.forEach((item, i) => {
    const lineTotal = item.price * item.quantity;
    total += lineTotal;
    lines.push(`${i + 1}) ${item.name} | Size: ${item.size} | Color: ${item.color} | Qty: ${item.quantity} | R${lineTotal.toFixed(2)}`);
  });

  lines.push("");
  lines.push(`TOTAL: R${total.toFixed(2)}`);
  lines.push("");
  lines.push("Name:");
  lines.push("(Type here)");
  lines.push("");
  lines.push("Delivery address:");
  lines.push("(Type here)");

  const message = encodeURIComponent(lines.join("\n"));
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank", "noopener,noreferrer");
}

/*************************************************************
 * POLICY MODAL
 *************************************************************/
const policyModal = document.getElementById("policy-modal");
const modalTitle = document.getElementById("modal-title");
const modalContent = document.getElementById("modal-content");
const closeModal = document.getElementById("close-modal");

const policies = {
  privacy: {
    title: "Privacy Policy",
    content: `
      <p style="margin-bottom:14px;"><strong>FAIDE Privacy Policy</strong></p>
      <p style="margin-bottom:14px;">We respect your privacy. This policy explains what information we collect, why we collect it, and how we use it.</p>
      <h3 style="color:#fff; font-size:1.05rem; margin:18px 0 8px;">What we collect</h3>
      <ul style="margin-left:18px; margin-bottom:14px;">
        <li>Contact details you provide (name, phone number, email).</li>
        <li>Order details (items, size, color, quantity, delivery address).</li>
        <li>Basic site analytics (to improve performance and experience).</li>
      </ul>
      <h3 style="color:#fff; font-size:1.05rem; margin:18px 0 8px;">How we use it</h3>
      <ul style="margin-left:18px; margin-bottom:14px;">
        <li>To process and fulfill your order.</li>
        <li>To communicate about your order (shipping updates, questions).</li>
        <li>To improve the website and product experience.</li>
      </ul>
      <h3 style="color:#fff; font-size:1.05rem; margin:18px 0 8px;">Your choices</h3>
      <p style="margin-bottom:14px;">You can request to update or delete your information by contacting us at <a style="color:var(--primary); text-decoration:none;" href="mailto:faideclothingsa@gmail.com">faideclothingsa@gmail.com</a>.</p>
    `
  },
  terms: {
    title: "Terms of Service",
    content: `
      <p style="margin-bottom:14px;"><strong>FAIDE Terms of Service</strong></p>
      <p style="margin-bottom:14px;">By using this website and placing an order, you agree to the terms below.</p>
      <h3 style="color:#fff; font-size:1.05rem; margin:18px 0 8px;">Orders</h3>
      <ul style="margin-left:18px; margin-bottom:14px;">
        <li>Orders are confirmed via WhatsApp after you submit your cart.</li>
        <li>We may contact you if we need size/color confirmation or address clarification.</li>
      </ul>
      <h3 style="color:#fff; font-size:1.05rem; margin:18px 0 8px;">Pricing</h3>
      <p style="margin-bottom:14px;">Prices are listed in ZAR (R). We reserve the right to correct errors and update pricing.</p>
      <h3 style="color:#fff; font-size:1.05rem; margin:18px 0 8px;">Availability</h3>
      <p style="margin-bottom:14px;">Stock availability may change. If an item is unavailable, we’ll offer an alternative or refund.</p>
    `
  },
  returns: {
    title: "Returns & Exchanges",
    content: `
      <p style="margin-bottom:14px;"><strong>Returns & Exchanges</strong></p>
      <p style="margin-bottom:14px;">If something isn’t right, we’ll work with you.</p>
      <h3 style="color:#fff; font-size:1.05rem; margin:18px 0 8px;">Eligibility</h3>
      <ul style="margin-left:18px; margin-bottom:14px;">
        <li>Items must be unworn, unwashed, and in original condition.</li>
        <li>Request must be made within 7 days of delivery.</li>
      </ul>
      <h3 style="color:#fff; font-size:1.05rem; margin:18px 0 8px;">Exchanges</h3>
      <p style="margin-bottom:14px;">Size exchanges are accepted if stock is available.</p>
      <h3 style="color:#fff; font-size:1.05rem; margin:18px 0 8px;">How to request</h3>
      <p style="margin-bottom:14px;">Contact us on WhatsApp or email with your order details.</p>
    `
  },
  shipping: {
    title: "Shipping Policy",
    content: `
      <p style="margin-bottom:14px;"><strong>Shipping Policy</strong></p>
      <p style="margin-bottom:14px;">We ship orders within South Africa. Delivery times depend on your location.</p>
      <h3 style="color:#fff; font-size:1.05rem; margin:18px 0 8px;">Processing time</h3>
      <p style="margin-bottom:14px;">Orders are typically processed within 1–3 business days after confirmation.</p>
      <h3 style="color:#fff; font-size:1.05rem; margin:18px 0 8px;">Delivery</h3>
      <ul style="margin-left:18px; margin-bottom:14px;">
        <li>Estimated delivery: 2–7 business days (varies by region).</li>
        <li>Tracking may be provided depending on courier service.</li>
      </ul>
      <p style="margin-bottom:14px;">Questions? Email <a style="color:var(--primary); text-decoration:none;" href="mailto:faideclothingsa@gmail.com">faideclothingsa@gmail.com</a></p>
    `
  },
};

let lastFocusedEl = null;

function showPolicy(policyType) {
  const policy = policies[policyType];
  if (!policy) return;
  lastFocusedEl = document.activeElement;

  if (modalTitle) modalTitle.textContent = policy.title;
  if (modalContent) modalContent.innerHTML = policy.content;
  if (policyModal) policyModal.style.display = "block";

  document.body.classList.add("lock-scroll");
  setTimeout(() => closeModal?.focus(), 0);
}

function hidePolicy() {
  if (policyModal) policyModal.style.display = "none";
  document.body.classList.remove("lock-scroll");
  if (lastFocusedEl && typeof lastFocusedEl.focus === "function") lastFocusedEl.focus();
}

function onClick(id, fn) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener("click", (e) => { e.preventDefault(); fn(); });
}

onClick("privacy-link", () => showPolicy("privacy"));
onClick("terms-link", () => showPolicy("terms"));
onClick("returns-link", () => showPolicy("returns"));
onClick("shipping-link", () => showPolicy("shipping"));

closeModal?.addEventListener("click", hidePolicy);
policyModal?.addEventListener("click", (e) => { if (e.target === policyModal) hidePolicy(); });

/*************************************************************
 * Helpers: Nav scroll + active state
 *************************************************************/
function getNavOffsetPx() {
  const nav = document.querySelector(".navbar");
  const navH = nav?.getBoundingClientRect?.().height || parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 86;
  return Math.round(navH + 18);
}

function scrollToSectionId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.pageYOffset - getNavOffsetPx();
  window.scrollTo({ top, behavior: "smooth" });
}

/*************************************************************
 * Qty stepper
 *************************************************************/
function setupQtyStepper(rootEl, { onChange } = {}) {
  const valueEl = rootEl.querySelector("[data-qty-value]");
  const incBtn = rootEl.querySelector('[data-qty-btn="inc"]');
  const decBtn = rootEl.querySelector('[data-qty-btn="dec"]');
  if (!valueEl || !incBtn || !decBtn) return;

  let qty = 1;
  let holdTimer = null;
  let holdInterval = null;
  let speed = 180;

  const render = () => {
    valueEl.textContent = String(qty);
    onChange?.(qty);
  };

  const setQty = (next) => {
    qty = Math.max(1, next);
    render();
  };

  const step = (dir) => setQty(qty + dir);

  const stopHold = () => {
    clearTimeout(holdTimer);
    clearInterval(holdInterval);
    holdTimer = null;
    holdInterval = null;
    speed = 180;
  };

  const startHold = (dir) => {
    stopHold();
    holdTimer = setTimeout(() => {
      holdInterval = setInterval(() => {
        step(dir);
        if (speed > 65) speed -= 10;
      }, speed);
    }, 260);
  };

  const bindBtn = (btn, dir) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      step(dir);
    });

    const start = (e) => {
      e.preventDefault();
      e.stopPropagation();
      startHold(dir);
      step(dir);
    };

    btn.addEventListener("mousedown", start);
    btn.addEventListener("touchstart", start, { passive: false });

    ["mouseup", "mouseleave", "touchend", "touchcancel"].forEach((ev) => {
      btn.addEventListener(ev, stopHold, { passive: true });
    });
  };

  bindBtn(incBtn, +1);
  bindBtn(decBtn, -1);

  return { getQty: () => qty, setQty };
}

/*************************************************************
 * MAIN DOM READY
 *************************************************************/
document.addEventListener("DOMContentLoaded", async () => {
  const shopNowBtn = document.getElementById("shop-now-btn");
  shopNowBtn?.addEventListener("click", () => scrollToSectionId("shop"));

  const navbar = document.querySelector(".navbar");
  const navLinks = document.querySelectorAll(".nav-links a");

  function handleShrink() {
    if (!navbar) return;
    navbar.classList.toggle("shrink", window.scrollY > 20);
  }
  handleShrink();
  window.addEventListener("scroll", handleShrink, { passive: true });

  const sectionIds = ["drop", "lookbook", "shop", "about"];
  const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

  const linkById = new Map();
  navLinks.forEach(a => {
    const href = a.getAttribute("href") || "";
    if (href.startsWith("#")) linkById.set(href.slice(1), a);
  });

  function setActive(id) {
    navLinks.forEach(a => a.classList.remove("active"));
    linkById.get(id)?.classList.add("active");
  }

  let navLock = false;
  let navUnlockTimer = null;

  navLinks.forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href") || "";
      if (!href.startsWith("#")) return;
      const id = href.slice(1);
      if (!id) return;

      e.preventDefault();

      navLock = true;
      clearTimeout(navUnlockTimer);
      setActive(id);
      scrollToSectionId(id);

      navUnlockTimer = setTimeout(() => { navLock = false; }, 650);
    });
  });

  let raf = null;
  function updateActiveFromScroll() {
    if (navLock) return;

    const refY = window.scrollY + getNavOffsetPx() + 10;
    let current = sections[0]?.id || "drop";

    for (const sec of sections) {
      if (!sec) continue;
      const top = sec.offsetTop;
      if (top <= refY) current = sec.id;
    }
    setActive(current);
  }

  function onScroll() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = null;
      updateActiveFromScroll();
    });
  }
  updateActiveFromScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => { updateActiveFromScroll(); }, { passive: true });

  /*************************************************************
   * CART
   *************************************************************/
  const products = document.querySelectorAll(".product");
  const floatingCart = document.getElementById("floating-cart");
  const cartSidebar = document.getElementById("cart-sidebar");
  const cartOverlay = document.getElementById("cart-overlay");
  const closeCart = document.getElementById("close-cart");
  const cartItemsEl = document.getElementById("cart-items");
  const cartTotalEl = document.getElementById("cart-total");
  const cartCountEl = document.getElementById("cart-count");
  const checkoutBtn = document.getElementById("checkout-btn");

  cart = loadCartFromStorage();

  function openCart() {
    cartSidebar?.classList.add("active");
    cartOverlay?.classList.add("active");
    document.body.classList.add("lock-scroll");
  }

  function closeCartPanel() {
    cartSidebar?.classList.remove("active");
    cartOverlay?.classList.remove("active");
    document.body.classList.remove("lock-scroll");
  }

  floatingCart?.addEventListener("click", openCart);
  closeCart?.addEventListener("click", closeCartPanel);
  cartOverlay?.addEventListener("click", closeCartPanel);

  checkoutBtn?.addEventListener("click", (e) => {
    if (checkoutBtn.disabled) {
      e.preventDefault();
      return showCartToast("Add items to checkout.");
    }
    checkoutOnWhatsApp();
  });

  function setCheckoutState() {
    const empty = cart.length === 0;
    if (!checkoutBtn) return;
    checkoutBtn.disabled = empty;
    checkoutBtn.title = empty ? "Add items to checkout" : "Proceed to WhatsApp checkout";
  }

  function updateCartUI() {
    if (!cartItemsEl || !cartTotalEl || !cartCountEl) return;

    saveCartToStorage(cart);

    cartItemsEl.innerHTML = "";
    let total = 0;
    let itemCount = 0;

    if (cart.length === 0) {
      cartItemsEl.innerHTML =
        '<li style="text-align:center;color:#666;border:none;background:transparent;padding:14px 0;">Your cart is empty</li>';
      cartTotalEl.textContent = "0.00";
      cartCountEl.textContent = "0";
      setCheckoutState();
      return;
    }

    cart.forEach((item, idx) => {
      const lineTotal = item.price * item.quantity;
      total += lineTotal;
      itemCount += item.quantity;

      const li = document.createElement("li");
      li.className = "cart-item";

      li.innerHTML = `
        <img class="cart-item-img" src="${item.image || ""}" alt="${item.name}" onerror="this.style.display='none';" />
        <div class="cart-item-info">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-meta">Size: ${item.size} • Color: ${item.color}</div>
          <div class="cart-item-price">R${lineTotal.toFixed(2)}</div>
        </div>
        <div class="cart-item-actions">
          <div class="qty-stepper" aria-label="Quantity controls">
            <div class="qty-stepper-inner">
              <button type="button" class="qty-btn" data-action="dec" aria-label="Decrease quantity">−</button>
              <div class="qty-value" aria-label="Quantity">${item.quantity}</div>
              <button type="button" class="qty-btn" data-action="inc" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <button type="button" class="remove-btn" data-action="remove" aria-label="Remove item">Remove</button>
        </div>
      `;

      li.querySelector('[data-action="dec"]').addEventListener("click", () => {
        item.quantity = Math.max(1, item.quantity - 1);
        updateCartUI();
      });

      li.querySelector('[data-action="inc"]').addEventListener("click", () => {
        item.quantity += 1;
        updateCartUI();
      });

      li.querySelector('[data-action="remove"]').addEventListener("click", () => {
        cart.splice(idx, 1);
        updateCartUI();
      });

      cartItemsEl.appendChild(li);
    });

    cartTotalEl.textContent = total.toFixed(2);
    cartCountEl.textContent = String(itemCount);

    setCheckoutState();
  }

  products.forEach((product) => {
    const stepperRoot = product.querySelector('.qty-stepper-ui[data-qty-root="card"]');
    const stepper = stepperRoot ? setupQtyStepper(stepperRoot) : null;

    const sizeButtons = product.querySelectorAll(".size-btn");
    const colorOptions = product.querySelectorAll(".color");
    const addToCartBtn = product.querySelector(".add-to-cart");

    const updateAddBtn = () => {
      if (!addToCartBtn) return;
      const selectedSize = product.querySelector(".size-btn.selected");
      const selectedColor = product.querySelector(".color.selected");
      addToCartBtn.disabled = !(selectedSize && selectedColor);
    };

    sizeButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        sizeButtons.forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        product.classList.add("expanded");
        updateAddBtn();
      });
    });

    colorOptions.forEach((color) => {
      const select = (e) => {
        e?.stopPropagation?.();
        colorOptions.forEach((c) => c.classList.remove("selected"));
        color.classList.add("selected");
        product.classList.add("expanded");
        updateAddBtn();
      };
      color.addEventListener("click", select);
      clickOnEnterSpace(color, select);
    });

    updateAddBtn();

    if (!addToCartBtn) return;

    addToCartBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const productName = product.getAttribute("data-name") || "Item";
      const price = parseFloat(product.getAttribute("data-price") || "0");

      const selectedSize = product.querySelector(".size-btn.selected");
      const selectedColor = product.querySelector(".color.selected");

      if (!selectedSize) return showCartToast("Select a size first.");
      if (!selectedColor) return showCartToast("Select a color first.");

      let quantity = stepper?.getQty?.() ?? 1;
      quantity = Math.max(1, Number.isFinite(quantity) ? quantity : 1);

      const size = selectedSize.textContent.trim();
      const colorName = selectedColor.getAttribute("data-color") || "Color";

      const imgEl = product.querySelector(".product-img");
      const image = imgEl?.getAttribute("src") || "";

      const itemKey = `${productName}-${size}-${colorName}`;
      const existing = cart.find((item) => item.key === itemKey);

      if (existing) existing.quantity += quantity;
      else cart.push({ key: itemKey, name: productName, price, size, color: colorName, quantity, image });

      updateCartUI();
      showCartToast(`Added ${quantity}x ${productName} (${size}) in ${colorName}`);

      stepper?.setQty?.(1);
    });
  });

  updateCartUI();

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;

    if (policyModal && policyModal.style.display === "block") hidePolicy();
    if (cartSidebar?.classList.contains("active")) {
      cartSidebar.classList.remove("active");
      cartOverlay?.classList.remove("active");
      document.body.classList.remove("lock-scroll");
    }
  });

  /*************************************************************
   * SHOP PRODUCT MODAL (WITH THUMBS)
   *************************************************************/
  const pm = {
    modal: document.getElementById("product-modal"),
    close: document.getElementById("pm-close"),
    img: document.getElementById("pm-img"),
    thumbs: document.getElementById("pm-thumbs"),
    subtitle: document.getElementById("pm-subtitle"),

    label: document.getElementById("pm-label"),
    name: document.getElementById("pm-name"),
    category: document.getElementById("pm-category"),
    colorsCount: document.getElementById("pm-colors"),
    price: document.getElementById("pm-price"),

    sizes: document.getElementById("pm-sizes"),
    colorsRow: document.getElementById("pm-colors-row"),
    add: document.getElementById("pm-add"),
  };

  let pmSources = [];
  let pmIndex = 0;
  let pmActiveProductEl = null;

  const pmStepperRoot = document.querySelector('.qty-stepper-ui[data-qty-root="pm"]');
  const pmStepper = pmStepperRoot ? setupQtyStepper(pmStepperRoot) : null;

  function pmRenderThumbs() {
    if (!pm.thumbs) return;
    pm.thumbs.innerHTML = "";
    pmSources.slice(0, 4).forEach((src, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "thumb" + (i === pmIndex ? " active" : "");
      btn.setAttribute("aria-label", `View image ${i + 1}`);
      btn.innerHTML = `<img src="${src}" alt="" loading="lazy" />`;
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        pmSetImage(i);
      });
      pm.thumbs.appendChild(btn);
    });
  }

  function pmOpen() {
    if (!pm.modal) return;
    pm.modal.classList.add("active");
    pm.modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("lock-scroll");
    pm.close?.focus();
  }

  function pmClose() {
    if (!pm.modal) return;
    pm.modal.classList.remove("active");
    pm.modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lock-scroll");
    pmActiveProductEl = null;
  }

  let __pmSwapToken = 0;
  function pmSetImage(i) {
    if (!pmSources.length || !pm.img) return;
    const token = ++__pmSwapToken;

    pmIndex = (i + pmSources.length) % pmSources.length;
    const nextSrc = pmSources[pmIndex];

    if (pm.img.getAttribute("src") === nextSrc) {
      if (pm.subtitle) pm.subtitle.textContent = `${pmIndex + 1} / ${pmSources.length}`;
      pmRenderThumbs();
      return;
    }

    pm.img.style.opacity = "0.25";
    requestAnimationFrame(() => {
      if (token !== __pmSwapToken) return;
      pm.img.src = nextSrc;
      if (pm.subtitle) pm.subtitle.textContent = `${pmIndex + 1} / ${pmSources.length}`;
      pmRenderThumbs();
      setTimeout(() => {
        if (token !== __pmSwapToken) return;
        pm.img.style.opacity = "1";
      }, 60);
    });
  }

  async function pmBuildImagesFromProduct(productEl) {
    const imgEl = productEl.querySelector(".product-img");
    const base = imgEl?.getAttribute("src") || "";
    if (!base) return [""];
    const candidates = [base, buildVariantSrc(base, 2), buildVariantSrc(base, 3), buildVariantSrc(base, 4)];
    const checks = await Promise.all(candidates.map((s, i) => (i === 0 ? Promise.resolve(true) : imageExists(s))));
    return candidates.filter((_, i) => checks[i]).slice(0, 4);
  }

  function pmUpdateAddState() {
    const selectedSize = pm.sizes.querySelector(".size-btn.selected");
    const selectedColor = pm.colorsRow.querySelector(".color.selected");
    pm.add.disabled = !(selectedSize && selectedColor);
  }

  function pmRenderSizes(productEl) {
    const original = Array.from(productEl.querySelectorAll(".size-btn")).map(b => b.textContent.trim());
    const sizes = original.length ? original : ["S", "M", "L", "XL"];

    pm.sizes.innerHTML = "";
    sizes.forEach((s) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "size-btn";
      btn.textContent = s;
      btn.addEventListener("click", () => {
        Array.from(pm.sizes.querySelectorAll(".size-btn")).forEach(x => x.classList.remove("selected"));
        btn.classList.add("selected");
        pmUpdateAddState();
      });
      pm.sizes.appendChild(btn);
    });
  }

  function pmRenderColors(productEl) {
    const original = Array.from(productEl.querySelectorAll(".color")).map(c => ({
      className: c.className,
      colorName: c.getAttribute("data-color") || "Color"
    }));

    const colors = original.length ? original : [
      { className: "color black", colorName: "Black" },
      { className: "color white", colorName: "White" },
    ];

    pm.colorsRow.innerHTML = "";
    colors.forEach((c) => {
      const div = document.createElement("div");
      div.className = c.className;
      div.setAttribute("role", "button");
      div.setAttribute("tabindex", "0");
      div.setAttribute("aria-label", c.colorName);
      div.setAttribute("data-color", c.colorName);

      const select = () => {
        Array.from(pm.colorsRow.querySelectorAll(".color")).forEach(x => x.classList.remove("selected"));
        div.classList.add("selected");
        pmUpdateAddState();
      };

      div.addEventListener("click", select);
      clickOnEnterSpace(div, select);

      pm.colorsRow.appendChild(div);
    });
  }

  function pmFillMeta(productEl) {
    const name = productEl.getAttribute("data-name") || "Item";
    const price = productEl.querySelector(".price")?.textContent?.trim() || "";
    const label = productEl.querySelector(".product-label")?.textContent?.trim() || "";

    const category = productEl.querySelector(".product-category")?.textContent?.trim() || "";
    const colorsCount = productEl.querySelector(".product-colors-count")?.textContent?.trim() || "";

    pm.label.textContent = label;
    pm.name.textContent = name;
    pm.category.textContent = category;
    pm.colorsCount.textContent = colorsCount;
    pm.price.textContent = price;

    pmStepper?.setQty?.(1);
    pm.add.disabled = true;
  }

  async function openProductModal(productEl) {
    pmActiveProductEl = productEl;

    pmFillMeta(productEl);
    pmRenderSizes(productEl);
    pmRenderColors(productEl);

    pmSources = await pmBuildImagesFromProduct(productEl);
    pmSetImage(0);

    pmOpen();
  }

  let pmTouchStartX = null;
  pm.img?.addEventListener("touchstart", (e) => {
    if (!e.touches || e.touches.length !== 1) return;
    pmTouchStartX = e.touches[0].clientX;
  }, { passive: true });

  pm.img?.addEventListener("touchend", (e) => {
    if (pmTouchStartX == null) return;
    const endX = e.changedTouches?.[0]?.clientX ?? pmTouchStartX;
    const diff = endX - pmTouchStartX;
    pmTouchStartX = null;

    if (Math.abs(diff) < 35) return;
    if (diff < 0) pmSetImage(pmIndex + 1);
    else pmSetImage(pmIndex - 1);
  }, { passive: true });

  pm.close?.addEventListener("click", pmClose);
  pm.modal?.addEventListener("click", (e) => { if (e.target === pm.modal) pmClose(); });

  document.addEventListener("keydown", (e) => {
    if (!pm.modal?.classList.contains("active")) return;
    if (e.key === "Escape") pmClose();
    if (e.key === "ArrowRight") pmSetImage(pmIndex + 1);
    if (e.key === "ArrowLeft") pmSetImage(pmIndex - 1);
  });

  pm.add?.addEventListener("click", () => {
    if (!pmActiveProductEl) return;

    const productName = pmActiveProductEl.getAttribute("data-name") || "Item";
    const price = parseFloat(pmActiveProductEl.getAttribute("data-price") || "0");

    const selectedSize = pm.sizes.querySelector(".size-btn.selected");
    const selectedColor = pm.colorsRow.querySelector(".color.selected");

    if (!selectedSize) return showCartToast("Select a size first.");
    if (!selectedColor) return showCartToast("Select a color first.");

    let quantity = pmStepper?.getQty?.() ?? 1;
    quantity = Math.max(1, Number.isFinite(quantity) ? quantity : 1);

    const size = selectedSize.textContent.trim();
    const colorName = selectedColor.getAttribute("data-color") || "Color";
    const image = pmSources[pmIndex] || (pmActiveProductEl.querySelector(".product-img")?.getAttribute("src") || "");

    const itemKey = `${productName}-${size}-${colorName}`;
    const existing = cart.find((item) => item.key === itemKey);

    if (existing) existing.quantity += quantity;
    else cart.push({ key: itemKey, name: productName, price, size, color: colorName, quantity, image });

    updateCartUI();
    showCartToast(`Added ${quantity}x ${productName} (${size}) in ${colorName}`);
    pmClose();
  });

  products.forEach((productEl) => {
    productEl.addEventListener("click", (e) => {
      const interactive = e.target.closest("button, input, .color, a, .sizes, .colors, .options, .thumb-row");
      if (interactive) return;
      openProductModal(productEl);
    });
  });

  /*************************************************************
   * LOOKBOOK FULLSCREEN GALLERY + ZOOM
   *************************************************************/
  const lookbookCards = Array.from(document.querySelectorAll(".lookbook-card"));
  const galleryModal = document.getElementById("gallery-modal");
  const galleryImg = document.getElementById("gallery-img");
  const galleryClose = document.getElementById("gallery-close");
  const galleryCounter = document.getElementById("gallery-counter");
  const galleryTitle = document.getElementById("gallery-title");
  const galleryViewport = document.getElementById("gallery-viewport");

  const galleryItems = lookbookCards
    .map((card) => {
      const img = card.querySelector("img");
      const title = card.querySelector(".lookbook-card-title")?.textContent?.trim() || "Look";
      return img?.getAttribute("src") ? { src: img.getAttribute("src"), title } : null;
    })
    .filter(Boolean);

  let galleryIndex = 0;

  let scale = 1;
  let tx = 0;
  let ty = 0;

  let dragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragStartTx = tx;
  let dragStartTy = ty;

  let pinchStartDist = 0;
  let pinchStartScale = 1;
  let pinchMid = { x: 0, y: 0 };

  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

  function applyTransform() {
    if (!galleryImg) return;
    galleryImg.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`;
    galleryImg.classList.toggle("zoomed", scale > 1.01);
  }

  function resetZoom() {
    scale = 1;
    tx = 0;
    ty = 0;
    applyTransform();
  }

  function setGallery(index) {
    if (!galleryItems.length) return;
    galleryIndex = (index + galleryItems.length) % galleryItems.length;

    const item = galleryItems[galleryIndex];
    galleryImg.src = item.src;
    galleryImg.alt = item.title;
    galleryTitle.textContent = item.title;
    galleryCounter.textContent = `${galleryIndex + 1} / ${galleryItems.length}`;

    resetZoom();
  }

  function openGallery(index) {
    if (!galleryItems.length) return;
    setGallery(index);

    galleryModal.classList.add("active");
    galleryModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("lock-scroll");

    galleryClose?.focus();
  }

  function closeGallery() {
    galleryModal.classList.remove("active");
    galleryModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lock-scroll");
    resetZoom();
  }

  lookbookCards.forEach((card, idx) => {
    card.addEventListener("click", () => openGallery(idx));
    clickOnEnterSpace(card, () => openGallery(idx));
  });

  galleryClose?.addEventListener("click", closeGallery);

  galleryModal?.addEventListener("click", (e) => {
    if (e.target === galleryModal) closeGallery();
  });

  document.addEventListener("keydown", (e) => {
    if (!galleryModal?.classList.contains("active")) return;
    if (e.key === "Escape") closeGallery();
  });

  function toggleZoomAt(clientX, clientY) {
    if (!galleryViewport) return;

    const rect = galleryViewport.getBoundingClientRect();
    const x = clientX - rect.left - rect.width / 2;
    const y = clientY - rect.top - rect.height / 2;

    if (scale <= 1.01) {
      scale = 2.2;
      tx = -x;
      ty = -y;
    } else {
      resetZoom();
      return;
    }

    tx = clamp(tx, -rect.width * (scale - 1) * 0.5, rect.width * (scale - 1) * 0.5);
    ty = clamp(ty, -rect.height * (scale - 1) * 0.5, rect.height * (scale - 1) * 0.5);

    applyTransform();
  }

  galleryImg?.addEventListener("dblclick", (e) => {
    e.preventDefault();
    toggleZoomAt(e.clientX, e.clientY);
  });

  function distance(t1, t2) {
    const dx = t2.clientX - t1.clientX;
    const dy = t2.clientY - t1.clientY;
    return Math.hypot(dx, dy);
  }

  let lastTap = 0;

  galleryViewport?.addEventListener("touchstart", (e) => {
    if (!galleryModal?.classList.contains("active")) return;

    const now = Date.now();
    if (e.touches.length === 1) {
      if (now - lastTap < 260) {
        const t = e.touches[0];
        toggleZoomAt(t.clientX, t.clientY);
        lastTap = 0;
        return;
      }
      lastTap = now;
    }

    if (e.touches.length === 1) {
      if (scale > 1.01) {
        dragging = true;
        dragStartX = e.touches[0].clientX;
        dragStartY = e.touches[0].clientY;
        dragStartTx = tx;
        dragStartTy = ty;
      }
    }

    if (e.touches.length === 2) {
      pinchStartDist = distance(e.touches[0], e.touches[1]);
      pinchStartScale = scale;
      pinchMid = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2
      };
    }
  }, { passive: true });

  galleryViewport?.addEventListener("touchmove", (e) => {
    if (!galleryModal?.classList.contains("active") || !galleryViewport) return;

    if (e.touches.length === 2) {
      const d = distance(e.touches[0], e.touches[1]);
      const next = clamp(pinchStartScale * (d / pinchStartDist), 1, 3);

      const rect = galleryViewport.getBoundingClientRect();
      const cx = pinchMid.x - rect.left - rect.width / 2;
      const cy = pinchMid.y - rect.top - rect.height / 2;

      const ratio = next / scale;
      tx = (tx - cx) * ratio + cx;
      ty = (ty - cy) * ratio + cy;
      scale = next;

      tx = clamp(tx, -rect.width * (scale - 1) * 0.5, rect.width * (scale - 1) * 0.5);
      ty = clamp(ty, -rect.height * (scale - 1) * 0.5, rect.height * (scale - 1) * 0.5);

      applyTransform();
      return;
    }

    if (e.touches.length === 1 && scale > 1.01 && dragging) {
      const t = e.touches[0];
      const dx = t.clientX - dragStartX;
      const dy = t.clientY - dragStartY;

      const rect = galleryViewport.getBoundingClientRect();
      tx = clamp(dragStartTx + dx, -rect.width * (scale - 1) * 0.5, rect.width * (scale - 1) * 0.5);
      ty = clamp(dragStartTy + dy, -rect.height * (scale - 1) * 0.5, rect.height * (scale - 1) * 0.5);

      applyTransform();
    }
  }, { passive: true });

  galleryViewport?.addEventListener("touchend", () => {
    dragging = false;
  }, { passive: true });
});
