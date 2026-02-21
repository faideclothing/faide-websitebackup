// FAIDE Store - simple frontend cart (no payments)
document.addEventListener("DOMContentLoaded", () => {
  const money = (n) => `R ${Number(n).toLocaleString("en-ZA")}`;

  // Products using YOUR image names
  const PRODUCTS = [
    {
      id: "tee",
      name: "FAIDE Tee",
      price: 799,
      images: ["/images/tshirt.png", "/images/tshirt1.png", "/images/tshirt2.png", "/images/tshirt3.png"],
      desc: "Premium cotton tee. Clean fit. Built for daily wear."
    },
    {
      id: "hoodie",
      name: "FAIDE Hoodie",
      price: 1499,
      images: ["/images/hoodie.png", "/images/hoodie1.png", "/images/hoodie2.png", "/images/hoodie3.png"],
      desc: "Heavyweight hoodie. Soft handfeel. Minimal branding."
    },
    {
      id: "longsleeve",
      name: "FAIDE Long Sleeve",
      price: 999,
      images: ["/images/longsleeve.png", "/images/longsleeve1.png", "/images/longsleeve2.png", "/images/longsleeve3.png"],
      desc: "Long sleeve essential. Clean lines. Premium feel."
    },
    {
      id: "tank",
      name: "FAIDE Tank",
      price: 699,
      images: ["/images/tank-top.png", "/images/tank-top1.png", "/images/tank-top2.png", "/images/tank-top3.png"],
      desc: "Summer cut tank. Lightweight. Street-ready."
    }
  ];

  const SIZES = ["XS", "S", "M", "L", "XL"];

  // Elements
  const productGrid = document.getElementById("productGrid");
  const shopNow = document.getElementById("shopNow");

  // Drawer
  const drawer = document.getElementById("drawer");
  const menuBtn = document.getElementById("menuBtn");
  const closeDrawer = document.getElementById("closeDrawer");
  const drawerBackdrop = document.getElementById("drawerBackdrop");

  // Product modal
  const productModal = document.getElementById("productModal");
  const modalBackdrop = document.getElementById("modalBackdrop");
  const closeModal = document.getElementById("closeModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalImage = document.getElementById("modalImage");
  const modalPrice = document.getElementById("modalPrice");
  const modalDesc = document.getElementById("modalDesc");
  const thumbs = document.getElementById("thumbs");
  const sizeRow = document.getElementById("sizeRow");
  const addToCartBtn = document.getElementById("addToCartBtn");

  // Cart modal
  const cartModal = document.getElementById("cartModal");
  const cartBackdrop = document.getElementById("cartBackdrop");
  const closeCart = document.getElementById("closeCart");
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  const cartCount = document.getElementById("cartCount");
  const cartCount2 = document.getElementById("cartCount2");
  const openCart = document.getElementById("openCart");
  const cartFab = document.getElementById("cartFab");
  const clearCartBtn = document.getElementById("clearCartBtn");
  const checkoutBtn = document.getElementById("checkoutBtn");

  // Instagram link placeholder
  const igLink = document.getElementById("igLink");
  igLink.addEventListener("click", (e) => {
    e.preventDefault();
    alert("Link your Instagram here 🔥 (we can add the real link next)");
  });

  // State
  let selectedProduct = null;
  let selectedSize = "M";
  let cart = JSON.parse(localStorage.getItem("faide_cart") || "[]");

  const saveCart = () => localStorage.setItem("faide_cart", JSON.stringify(cart));

  const cartQty = () => cart.reduce((sum, i) => sum + i.qty, 0);

  const cartSum = () => cart.reduce((sum, i) => sum + (i.price * i.qty), 0);

  const updateCartBadge = () => {
    const c = cartQty();
    cartCount.textContent = String(c);
    cartCount2.textContent = String(c);
  };

  // Build products
  function renderProducts() {
    productGrid.innerHTML = "";
    PRODUCTS.forEach(p => {
      const card = document.createElement("div");
      card.className = "product";
      card.innerHTML = `
        <div class="img"><img src="${p.images[0]}" alt="${p.name}"></div>
        <div class="meta">
          <h3>${p.name}</h3>
          <div class="p">${money(p.price)}</div>
        </div>
      `;
      card.addEventListener("click", () => openProduct(p));
      productGrid.appendChild(card);
    });
  }

  // Drawer
  const showDrawer = () => { drawer.classList.add("show"); drawer.setAttribute("aria-hidden", "false"); };
  const hideDrawer = () => { drawer.classList.remove("show"); drawer.setAttribute("aria-hidden", "true"); };

  menuBtn.addEventListener("click", showDrawer);
  closeDrawer.addEventListener("click", hideDrawer);
  drawerBackdrop.addEventListener("click", hideDrawer);

  // Smooth scroll for menu links
  drawer.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", () => hideDrawer());
  });

  // Shop now scroll
  shopNow.addEventListener("click", () => {
    document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
  });

  // Product modal
  const showProductModal = () => { productModal.classList.add("show"); productModal.setAttribute("aria-hidden", "false"); };
  const hideProductModal = () => { productModal.classList.remove("show"); productModal.setAttribute("aria-hidden", "true"); };

  closeModal.addEventListener("click", hideProductModal);
  modalBackdrop.addEventListener("click", hideProductModal);

  function openProduct(p) {
    selectedProduct = p;
    selectedSize = "M";
    modalTitle.textContent = p.name;
    modalPrice.textContent = money(p.price);
    modalDesc.textContent = p.desc;

    // Main image
    modalImage.src = p.images[0];

    // Thumbnails
    thumbs.innerHTML = "";
    p.images.forEach((src) => {
      const t = document.createElement("button");
      t.className = "thumb";
      t.innerHTML = `<img src="${src}" alt="thumb">`;
      t.addEventListener("click", () => (modalImage.src = src));
      thumbs.appendChild(t);
    });

    // Sizes
    sizeRow.innerHTML = "";
    SIZES.forEach((s) => {
      const b = document.createElement("button");
      b.className = "size" + (s === selectedSize ? " active" : "");
      b.textContent = s;
      b.addEventListener("click", () => {
        selectedSize = s;
        sizeRow.querySelectorAll(".size").forEach(x => x.classList.remove("active"));
        b.classList.add("active");
      });
      sizeRow.appendChild(b);
    });

    showProductModal();
  }

  addToCartBtn.addEventListener("click", () => {
    if (!selectedProduct) return;

    const key = `${selectedProduct.id}_${selectedSize}`;
    const existing = cart.find(i => i.key === key);

    if (existing) existing.qty += 1;
    else {
      cart.push({
        key,
        id: selectedProduct.id,
        name: selectedProduct.name,
        size: selectedSize,
        price: selectedProduct.price,
        image: selectedProduct.images[0],
        qty: 1
      });
    }

    saveCart();
    updateCartBadge();
    hideProductModal();
    showCart();
  });

  // Cart modal
  const showCart = () => { cartModal.classList.add("show"); cartModal.setAttribute("aria-hidden", "false"); renderCart(); };
  const hideCart = () => { cartModal.classList.remove("show"); cartModal.setAttribute("aria-hidden", "true"); };

  openCart.addEventListener("click", () => { hideDrawer(); showCart(); });
  cartFab.addEventListener("click", showCart);
  closeCart.addEventListener("click", hideCart);
  cartBackdrop.addEventListener("click", hideCart);

  function renderCart() {
    cartItems.innerHTML = "";

    if (cart.length === 0) {
      cartItems.innerHTML = `<div class="cart-item"><div><h4>Your cart is empty</h4><div class="small">Add items from the shop.</div></div></div>`;
      cartTotal.textContent = money(0);
      return;
    }

    cart.forEach((item) => {
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div>
          <h4>${item.name}</h4>
          <div class="small">Size: ${item.size}</div>
          <div class="small">${money(item.price)}</div>
        </div>
        <div class="right">
          <strong>${money(item.price * item.qty)}</strong>
          <div class="qty-row">
            <button class="qty-btn" data-act="minus">−</button>
            <button class="qty-btn" data-act="plus">+</button>
          </div>
        </div>
      `;

      row.querySelector('[data-act="minus"]').addEventListener("click", () => {
        item.qty -= 1;
        if (item.qty <= 0) cart = cart.filter(x => x.key !== item.key);
        saveCart();
        updateCartBadge();
        renderCart();
      });

      row.querySelector('[data-act="plus"]').addEventListener("click", () => {
        item.qty += 1;
        saveCart();
        updateCartBadge();
        renderCart();
      });

      cartItems.appendChild(row);
    });

    cartTotal.textContent = money(cartSum());
  }

  clearCartBtn.addEventListener("click", () => {
    cart = [];
    saveCart();
    updateCartBadge();
    renderCart();
  });

  checkoutBtn.addEventListener("click", () => {
    alert("Checkout coming soon 🔥 Next we can add PayFast / Stripe.");
  });

  // Init
  renderProducts();
  updateCartBadge();
});