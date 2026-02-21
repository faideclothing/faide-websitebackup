const PRODUCTS = [
  { id: "tee", name: "FAIDE Tee", price: 799, image: "images/tshirt.png", size: "M" },
  { id: "hoodie", name: "FAIDE Hoodie", price: 1499, image: "images/hoodie.png", size: "M" },
  { id: "longsleeve", name: "FAIDE Long Sleeve", price: 999, image: "images/longsleeve.png", size: "M" },
  { id: "tank", name: "FAIDE Tank", price: 699, image: "images/tank-top.png", size: "M" },
];

const $ = (s) => document.querySelector(s);

const productGrid = $("#productGrid");
const yearEl = $("#year");

const menuBtn = $("#menuBtn");
const menuOverlay = $("#menuOverlay");
const menuClose = $("#menuClose");

const fabCart = $("#fabCart");
const cartModal = $("#cartModal");
const cartClose = $("#cartClose");

const openCartFromMenu = $("#openCartFromMenu");
const menuCartCount = $("#menuCartCount");
const fabCount = $("#fabCount");

const cartItems = $("#cartItems");
const cartSubtotal = $("#cartSubtotal");
const clearCartBtn = $("#clearCartBtn");
const checkoutBtn = $("#checkoutBtn");

yearEl.textContent = new Date().getFullYear();

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem("faide_cart") || "[]");
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem("faide_cart", JSON.stringify(cart));
}

function cartCount(cart) {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function cartTotal(cart) {
  return cart.reduce((sum, item) => sum + item.qty * item.price, 0);
}

function formatR(amount) {
  return `R ${amount}`;
}

function renderProducts() {
  productGrid.innerHTML = PRODUCTS.map((p) => {
    return `
      <div class="product">
        <div class="img">
          <img src="${p.image}" alt="${p.name}" />
        </div>
        <div class="meta">
          <p class="title">${p.name}</p>
          <p class="price">${formatR(p.price)}</p>
          <div class="actions">
            <button class="add" data-add="${p.id}">Add to cart</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  productGrid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    addToCart(btn.dataset.add);
  });
}

function syncBadges() {
  const cart = loadCart();
  const c = cartCount(cart);
  fabCount.textContent = c;
  menuCartCount.textContent = c;
}

function addToCart(productId) {
  const p = PRODUCTS.find((x) => x.id === productId);
  if (!p) return;

  const cart = loadCart();
  const existing = cart.find((x) => x.id === productId);
  if (existing) existing.qty += 1;
  else cart.push({ ...p, qty: 1 });

  saveCart(cart);
  syncBadges();
}

function updateQty(productId, delta) {
  const cart = loadCart();
  const item = cart.find((x) => x.id === productId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    const idx = cart.findIndex((x) => x.id === productId);
    cart.splice(idx, 1);
  }

  saveCart(cart);
  renderCart();
  syncBadges();
}

function renderCart() {
  const cart = loadCart();

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="card" style="padding:14px">
        <div style="font-weight:900; font-size:18px; margin-bottom:6px;">Your cart is empty</div>
        <div style="color:rgba(255,255,255,.65)">Add items from the shop.</div>
      </div>
    `;
  } else {
    cartItems.innerHTML = cart
      .map(
        (item) => `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" />
          <div class="cart-mid">
            <div class="cart-title">${item.name}</div>
            <p class="cart-sub">Size: ${item.size || "M"}</p>
            <p class="cart-sub">${formatR(item.price)}</p>
          </div>
          <div class="cart-right">
            <div class="cart-price">${formatR(item.price * item.qty)}</div>
            <div class="qty">
              <button aria-label="Decrease" data-dec="${item.id}">−</button>
              <button aria-label="Increase" data-inc="${item.id}">+</button>
            </div>
          </div>
        </div>
      `
      )
      .join("");
  }

  cartSubtotal.textContent = formatR(cartTotal(cart));

  // bind +/- inside cart
  cartItems.onclick = (e) => {
    const dec = e.target.closest("[data-dec]");
    const inc = e.target.closest("[data-inc]");
    if (dec) updateQty(dec.dataset.dec, -1);
    if (inc) updateQty(inc.dataset.inc, +1);
  };
}

function openMenu() {
  menuOverlay.classList.add("open");
  menuOverlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeMenu() {
  menuOverlay.classList.remove("open");
  menuOverlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function openCart() {
  renderCart();
  cartModal.classList.add("open");
  cartModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeCart() {
  cartModal.classList.remove("open");
  cartModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

/* Menu events */
menuBtn.addEventListener("click", openMenu);
menuClose.addEventListener("click", closeMenu);
menuOverlay.addEventListener("click", (e) => {
  if (e.target === menuOverlay) closeMenu();
});
document.querySelectorAll("[data-close-menu]").forEach((a) => {
  a.addEventListener("click", closeMenu);
});

/* Cart events */
fabCart.addEventListener("click", openCart);
openCartFromMenu.addEventListener("click", () => {
  closeMenu();
  openCart();
});
cartClose.addEventListener("click", closeCart);
cartModal.addEventListener("click", (e) => {
  if (e.target === cartModal) closeCart();
});

clearCartBtn.addEventListener("click", () => {
  saveCart([]);
  renderCart();
  syncBadges();
});

checkoutBtn.addEventListener("click", () => {
  alert("Checkout coming soon 🔥");
});

/* Init */
renderProducts();
syncBadges();