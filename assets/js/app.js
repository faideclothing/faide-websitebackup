:root{
  --bg:#000;
  --panel: rgba(255,255,255,.06);
  --panel2: rgba(255,255,255,.08);
  --stroke: rgba(255,255,255,.12);
  --text:#fff;
  --muted: rgba(255,255,255,.65);
  --shadow: 0 18px 60px rgba(0,0,0,.65);
  --r: 22px;
}

*{box-sizing:border-box}
html,body{height:100%}
body{
  margin:0;
  background: radial-gradient(1200px 800px at 50% 0%, rgba(255,255,255,.08), transparent 45%), var(--bg);
  color:var(--text);
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  letter-spacing: .2px;
}

a{color:inherit; text-decoration:none}
img{max-width:100%; display:block}
button{font-family:inherit}

.nav{
  position:sticky; top:0; z-index:50;
  display:flex; align-items:center; justify-content:space-between;
  padding:16px 18px;
  background: rgba(0,0,0,.55);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(255,255,255,.06);
}

.brand img{height:28px; width:auto; opacity:.95}

.icon-btn{
  width:44px; height:44px;
  border-radius:14px;
  border:1px solid rgba(255,255,255,.10);
  background: rgba(255,255,255,.05);
  color:#fff;
  display:grid; place-items:center;
}
.icon-btn:active{transform:scale(.98)}
.icon-btn.close{font-size:18px}

.icon-lines{
  width:18px; height:12px; position:relative; display:block;
}
.icon-lines::before,.icon-lines::after, .icon-lines{
  content:"";
  border-top:2px solid rgba(255,255,255,.85);
  position:absolute; left:0; right:0;
}
.icon-lines{top:2px}
.icon-lines::before{top:4px}
.icon-lines::after{top:10px}

/* HERO */
.hero{
  padding:56px 18px 26px;
  min-height: 62vh;
  display:flex; align-items:center; justify-content:center;
  text-align:center;
}
.hero-inner{max-width:720px}
.hero h1{
  margin:0 0 12px;
  font-size: clamp(44px, 10vw, 78px);
  line-height: .95;
  font-weight: 800;
}
.hero p{
  margin:0 0 18px;
  color:var(--muted);
  font-size: 18px;
}
.cta{
  display:inline-flex;
  align-items:center; justify-content:center;
  padding:14px 18px;
  border-radius: 18px;
  background:#fff;
  color:#000;
  font-weight:700;
  min-width: 160px;
  border:1px solid rgba(255,255,255,.08);
}
.cta:active{transform:scale(.99)}
.cta.full{width:100%}

/* SECTIONS */
.section{
  padding: 18px 18px 8px;
}
.section-head h2{
  margin: 0;
  font-size: 34px;
  letter-spacing: .2px;
}
.section-head p{
  margin: 6px 0 16px;
  color: var(--muted);
}

/* GRID */
.grid{
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.product{
  border-radius: 22px;
  background: rgba(255,255,255,.04);
  border:1px solid rgba(255,255,255,.08);
  overflow:hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,.45);
}
.product .img{
  aspect-ratio: 1/1;
  background: rgba(255,255,255,.06);
  display:grid; place-items:center;
}
.product .img img{
  width:100%; height:100%;
  object-fit: cover;
}
.product .meta{
  padding: 12px 12px 14px;
}
.product .title{
  font-weight: 800;
  font-size: 18px;
  margin:0 0 4px;
}
.product .price{
  color: var(--muted);
  margin:0 0 10px;
}
.product .actions{
  display:flex; gap:10px;
}
.product .add{
  flex:1;
  height: 44px;
  border-radius: 16px;
  border:1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.06);
  color:#fff;
  font-weight: 700;
}
.product .add:active{transform:scale(.99)}

/* LOOKBOOK */
.lookbook{
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap:14px;
}
.look-card{
  border-radius: 22px;
  overflow:hidden;
  border:1px solid rgba(255,255,255,.10);
  background: rgba(255,255,255,.03);
  position:relative;
  min-height: 180px;
}
.look-card img{
  width:100%; height:100%;
  object-fit: cover;
  opacity: .85;
}
.look-label{
  position:absolute; top:10px; left:10px;
  padding:8px 10px;
  border-radius: 14px;
  border:1px solid rgba(255,255,255,.12);
  background: rgba(0,0,0,.45);
  backdrop-filter: blur(10px);
  font-weight:700;
}

/* ABOUT CARD */
.card{
  border-radius: var(--r);
  background: rgba(255,255,255,.05);
  border: 1px solid rgba(255,255,255,.10);
  padding: 16px 16px;
  box-shadow: var(--shadow);
}
.card h3{margin:0 0 6px}
.card p{margin:0; color:var(--muted); line-height:1.45}
.spacer{height:14px}

/* CONTACT */
.stack{display:grid; gap:12px}
.input-like{
  border-radius: 18px;
  padding: 14px 14px;
  border:1px solid rgba(255,255,255,.10);
  background: rgba(255,255,255,.05);
  color: rgba(255,255,255,.78);
}

/* FOOTER */
.footer{
  padding: 22px 18px 90px;
  color: rgba(255,255,255,.45);
  text-align:center;
  border-top: 1px solid rgba(255,255,255,.06);
  margin-top: 10px;
}

/* OVERLAY MENU */
.overlay{
  position:fixed; inset:0;
  display:none;
  z-index:100;
  background: rgba(0,0,0,.55);
  backdrop-filter: blur(10px);
}
.overlay.open{display:block}
.overlay-card{
  width:min(520px, 92vw);
  margin: 14vh auto 0;
  border-radius: 28px;
  background: rgba(0,0,0,.78);
  border:1px solid rgba(255,255,255,.10);
  box-shadow: var(--shadow);
  padding: 16px;
}
.overlay-top{
  display:flex; align-items:center; justify-content:space-between;
  margin-bottom: 10px;
}
.overlay-brand{
  font-weight: 900;
  letter-spacing:.6px;
}
.overlay-nav{
  display:grid;
  gap: 12px;
}
.pill{
  height: 60px;
  border-radius: 22px;
  border:1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.05);
  display:flex;
  align-items:center;
  padding: 0 18px;
  font-size: 22px;
}
.pill-white{
  background:#fff;
  color:#000;
  justify-content:center;
  font-weight: 800;
}
.badge{
  margin-left: 10px;
  min-width: 26px;
  height: 26px;
  border-radius: 999px;
  background:#000;
  color:#fff;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  font-size: 14px;
}

/* Floating Cart Button */
.fab{
  position:fixed;
  right: 14px;
  bottom: 14px;
  z-index:60;
  height: 52px;
  padding: 0 14px;
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(0,0,0,.55);
  backdrop-filter: blur(12px);
  color:#fff;
  display:flex;
  align-items:center;
  gap:10px;
}
.fab-badge{
  min-width: 26px;
  height: 26px;
  border-radius: 999px;
  background: rgba(255,255,255,.12);
  display:inline-flex;
  align-items:center;
  justify-content:center;
  font-weight: 800;
}

/* CART MODAL */
.modal{
  position:fixed; inset:0;
  display:none;
  z-index:120;
  background: rgba(0,0,0,.55);
  backdrop-filter: blur(10px);
}
.modal.open{display:block}
.modal-card{
  width:min(560px, 92vw);
  margin: 18vh auto 0;
  border-radius: 28px;
  background: rgba(0,0,0,.78);
  border:1px solid rgba(255,255,255,.10);
  box-shadow: var(--shadow);
  padding: 14px;
}
.modal-head{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding: 6px 6px 10px;
}
.modal-title{
  font-weight: 900;
  font-size: 24px;
}

.cart-items{
  display:grid;
  gap: 10px;
  padding: 8px 4px;
  max-height: 40vh;
  overflow:auto;
}

/* Cart item layout (THIS fixes your R 799 + +/- alignment) */
.cart-item{
  display:grid;
  grid-template-columns: 72px 1fr auto;
  gap: 14px;
  align-items:center;
  padding: 12px;
  border-radius: 22px;
  border:1px solid rgba(255,255,255,.10);
  background: rgba(255,255,255,.04);
}
.cart-item img{
  width: 72px;
  height: 72px;
  border-radius: 16px;
  object-fit: cover;
}
.cart-mid{
  min-width: 0;
}
.cart-title{
  font-weight: 900;
  font-size: 18px;
  margin: 0 0 4px;
  white-space: nowrap;
  overflow:hidden;
  text-overflow: ellipsis;
}
.cart-sub{
  margin:0;
  color: rgba(255,255,255,.65);
  font-size: 14px;
}
.cart-right{
  display:flex;
  flex-direction: column;
  align-items:flex-end;
  gap: 10px;
}
.cart-price{
  font-weight: 900;
  font-size: 18px;
}
.qty{
  display:flex;
  gap: 10px;
}
.qty button{
  width: 44px;
  height: 44px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.06);
  color:#fff;
  font-size: 18px;
  display:grid;
  place-items:center;
}
.qty button:active{transform:scale(.98)}

.cart-summary{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding: 10px 8px 0;
  color: rgba(255,255,255,.75);
}
.cart-summary .sum{
  font-weight: 900;
  font-size: 18px;
  color:#fff;
}

.ghost{
  width:100%;
  height: 48px;
  margin-top: 10px;
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.05);
  color:#fff;
}

/* Small screens */
@media (max-width:360px){
  .grid{gap:12px}
  .product .title{font-size:16px}
}