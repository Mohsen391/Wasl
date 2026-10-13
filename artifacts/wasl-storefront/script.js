/* Wasl storefront: database catalog, accounts, cart, private orders and gifts. */
// The HTML base survives bundling; neither gift paths nor /assets/ are store roots.
const STORE_BASE = new URL(document.querySelector('meta[name="wasl-base"]').content, location.origin);
const API = "/api";
const TOKEN_KEY = "wasl.token";
const USER_KEY = "wasl.user";
const CART_KEY = "wasl.cart";
const MOODS = ["Cozy", "Energetic", "Focus", "Celebrate"];
const GIFT_WRAPS = ["Classic", "Eid", "Birthday", "Minimal"];
const SAFE_VIEWS = ["products", "checkout", "orders"];
const GIFT_MATCH = location.pathname.match(/\/gift\/([^/]+)\/?$/);

/* ---------- Safety helpers ---------- */
const ESC_MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;", "`": "&#96;" };
function esc(value) {
  return String(value ?? "").replace(/[&<>"'`]/g, (ch) => ESC_MAP[ch]);
}
function safeImage(url) {
  if (typeof url !== "string" || !url) return "";
  try {
    const parsed = new URL(url, location.href);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.href : "";
  } catch { return ""; }
}
const formatPrice = (fils) => `KWD ${(Number(fils || 0) / 1000).toFixed(3)}`;
const giftLinkFor = (token) => new URL(`gift/${encodeURIComponent(token)}`, STORE_BASE).href;

const icon = {
  bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  minus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>',
  heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.7c0 5.1-8.8 11-8.8 11s-8.8-5.9-8.8-11a4.7 4.7 0 0 1 8.8-2.2 4.7 4.7 0 0 1 8.8 2.2Z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6m4-6v6M5.5 7l1 13h11l1-13M9 7V4h6v3"/></svg>',
  delivery: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h11v11H3zM14 11h4l3 3v4h-7z"/><circle cx="7.5" cy="19" r="1.8"/><circle cx="17.5" cy="19" r="1.8"/></svg>',
  gift: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="8" width="17" height="4" rx="1"/><path d="M5 12v8h14v-8M12 8v12M12 8S10.5 3.5 8 4.2C6 4.8 7 8 12 8Zm0 0s1.5-4.5 4-3.8C18 4.8 17 8 12 8Z"/></svg>',
  link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>',
  user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>'
};

/* ---------- Gift route: render in isolation, no store data or third-party assets ---------- */
if (GIFT_MATCH) {
  initGiftRoute(decodeURIComponentSafe(GIFT_MATCH[1]));
} else {
  initStore();
}

function decodeURIComponentSafe(value) {
  try { return decodeURIComponent(value); } catch { return ""; }
}

function initGiftRoute(token) {
  document.title = "A gift for you - Wasl";
  const view = document.querySelector("#gift-view");
  const stage = document.querySelector("#gift-stage");
  ["#store-view", "#checkout-view", "#auth-view", "#orders-view", "#contact", ".site-header", "#discount-widget"].forEach((sel) => {
    const el = document.querySelector(sel);
    if (el) el.hidden = true;
  });
  view.hidden = false;
  stage.innerHTML = `<div class="gift-loading" aria-busy="true"><span class="gift-loading-box"></span><p>Finding your gift...</p></div>`;

  const missing = () => {
    stage.innerHTML = `<section class="gift-missing">
      <span class="gift-missing-mark" aria-hidden="true">${icon.gift}</span>
      <span class="section-kicker">WASL GIFTS</span>
      <h1 id="gift-title">This gift link isn't available<span>.</span></h1>
      <p>The link may be incomplete or no longer valid. Ask the sender to copy it again from their Wasl orders.</p>
      <a class="button button-primary" href="${esc(STORE_BASE.href)}">Visit Wasl</a>
    </section>`;
  };
  if (!token || !/^[A-Za-z0-9_-]{8,200}$/.test(token)) { missing(); return; }

  fetch(`${API}/gifts/${encodeURIComponent(token)}`, { referrerPolicy: "no-referrer", credentials: "omit", cache: "no-store" })
    .then(async (res) => {
      if (res.status === 404) { missing(); return; }
      if (!res.ok) throw new Error("bad");
      const raw = await res.json();
      const gift = {
        senderName: typeof raw.senderName === "string" ? raw.senderName : "Someone special",
        giftMessage: typeof raw.giftMessage === "string" ? raw.giftMessage : "",
        giftWrap: GIFT_WRAPS.includes(raw.giftWrap) ? raw.giftWrap : "Classic",
        items: Array.isArray(raw.items) ? raw.items.filter((n) => typeof n === "string").slice(0, 50) : []
      };
      renderGift(stage, gift);
    })
    .catch(() => {
      stage.innerHTML = `<section class="gift-missing">
        <span class="gift-missing-mark" aria-hidden="true">${icon.gift}</span>
        <h1 id="gift-title">We couldn't open the box just yet<span>.</span></h1>
        <p>Something went wrong reaching Wasl. Check your connection and try again.</p>
        <button class="button button-primary" type="button" id="gift-retry">Try again</button>
      </section>`;
      document.querySelector("#gift-retry").addEventListener("click", () => initGiftRoute(token));
    });
}

function renderGift(stage, gift) {
  const wrap = gift.giftWrap.toLowerCase();
  const wrapLine = { classic: "Wrapped in Wasl Classic", eid: "Wrapped for Eid", birthday: "Wrapped for your birthday", minimal: "Wrapped simply" }[wrap];
  stage.innerHTML = `
    <section class="gift-scene" data-wrap="${esc(wrap)}">
      <header class="gift-top">
        <span class="gift-brand">WASL<span>.</span></span>
        <span class="gift-wrap-name">${esc(wrapLine)}</span>
      </header>
      <div class="gift-intro">
        <span class="section-kicker">A GIFT FROM</span>
        <h1 id="gift-title" tabindex="-1">${esc(gift.senderName)}</h1>
      </div>
      <div class="gift-box" id="gift-box">
        <div class="gift-lid"><span class="gift-bow" aria-hidden="true"><i></i><i></i></span></div>
        <div class="gift-body"><span class="gift-ribbon-v" aria-hidden="true"></span></div>
        <article class="gift-card" id="gift-card" aria-hidden="true">
          <span class="section-kicker">FOR YOU</span>
          ${gift.giftMessage ? `<p class="gift-message">${esc(gift.giftMessage)}</p>` : `<p class="gift-message gift-message-empty">A little something, chosen with you in mind.</p>`}
          <span class="gift-sign">From ${esc(gift.senderName)}</span>
          ${gift.items.length ? `<div class="gift-items"><span>Inside the box</span><ul>${gift.items.map((n) => `<li>${esc(n)}</li>`).join("")}</ul></div>` : ""}
        </article>
      </div>
      <button class="button button-primary gift-open" id="gift-open" type="button" aria-controls="gift-card" aria-expanded="false">Unwrap your gift</button>
      <p class="gift-hint" id="gift-hint">Press the button, Enter or Space to unwrap.</p>
      <div class="sr-only" id="gift-live" aria-live="polite"></div>
    </section>`;
  const scene = stage.querySelector(".gift-scene");
  const button = stage.querySelector("#gift-open");
  const card = stage.querySelector("#gift-card");
  const open = () => {
    if (scene.classList.contains("is-open")) return;
    scene.classList.add("is-open");
    card.setAttribute("aria-hidden", "false");
    button.setAttribute("aria-expanded", "true");
    button.hidden = true;
    stage.querySelector("#gift-hint").hidden = true;
    stage.querySelector("#gift-live").textContent = `Gift unwrapped. Message from ${gift.senderName}.`;
    card.setAttribute("tabindex", "-1");
    window.setTimeout(() => card.focus({ preventScroll: true }), 650);
  };
  button.addEventListener("click", open);
  stage.querySelector("#gift-box").addEventListener("click", open);
  window.setTimeout(() => button.focus({ preventScroll: true }), 50);
}

/* ---------- Store ---------- */
function initStore() {
  const state = {
    products: [],
    catalogStatus: "loading",
    category: "all",
    mood: "all",
    search: "",
    favoritesOnly: false,
    favorites: new Set(),
    cart: new Map(),
    savedCart: readSavedCart(),
    discountApplied: false,
    lastFocus: null,
    orderReceived: false,
    orderReference: null,
    orderTotalFils: null,
    orderGiftToken: null,
    isSubmittingOrder: false,
    token: localStorage.getItem(TOKEN_KEY) || null,
    user: readUser(),
    authMode: "login",
    authNext: "products",
    authBusy: false,
    ordersReq: 0
  };

  const $ = (sel) => document.querySelector(sel);
  const grid = $("#product-grid");
  const searchInput = $("#product-search");
  const clearSearch = $("#clear-search");
  const noResults = $("#no-results");
  const resultsSummary = $("#results-summary");
  const cartDrawer = $("#cart-drawer");
  const quickModal = $("#quick-modal");
  const overlay = $("#overlay");
  const toast = $("#toast");
  const announcement = $("#announcement");
  const storeView = $("#store-view");
  const checkoutView = $("#checkout-view");
  const authView = $("#auth-view");
  const ordersView = $("#orders-view");
  const checkoutForm = $("#checkout-form");
  const checkoutLayout = $("#checkout-content");
  const checkoutEmpty = $("#checkout-empty");
  const checkoutAuth = $("#checkout-auth");
  const checkoutSuccess = $("#checkout-success");
  const checkoutSubmitError = $("#checkout-submit-error");
  const giftToggle = $("#checkout-gift");
  const giftFields = $("#gift-fields");
  const discountWidget = $("#discount-widget");
  const discountTab = $("#discount-tab");
  const discountModalLayer = $("#discount-modal-layer");
  const discountPanel = $("#discount-panel");
  const discountForm = $("#discount-form");
  const discountEmail = $("#discount-email");
  const discountSignupState = $("#discount-signup-state");
  const discountSuccessState = $("#discount-success-state");
  const copyDiscountCodeButton = $("#copy-discount-code");
  const video = $("#wasl-commercial");
  let toastTimer;

  if (video && video.dataset.poster) video.setAttribute("poster", video.dataset.poster);

  function readSavedCart() {
    try {
      const raw = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      return Array.isArray(raw) ? raw.filter((i) => i && typeof i.id === "string" && Number.isInteger(i.quantity) && i.quantity > 0).slice(0, 50) : [];
    } catch { return []; }
  }
  function readUser() {
    try {
      const u = JSON.parse(localStorage.getItem(USER_KEY) || "null");
      return u && typeof u.name === "string" ? { id: String(u.id ?? ""), name: u.name, email: String(u.email ?? "") } : null;
    } catch { return null; }
  }
  function persistCart() {
    const list = state.products.length || state.catalogStatus === "ready"
      ? [...state.cart.values()].map(({ product, quantity }) => ({ id: product.id, quantity }))
      : state.savedCart;
    state.savedCart = list;
    try { localStorage.setItem(CART_KEY, JSON.stringify(list)); } catch { /* storage full or blocked */ }
  }

  const productById = (id) => state.products.find((p) => p.id === String(id));
  const maxQty = (p) => (Number.isInteger(p.stock) ? Math.max(0, Math.min(p.stock, 99)) : 99);

  /* ----- API ----- */
  async function api(path, { method = "GET", body, auth = false } = {}) {
    const requestToken = state.token;
    const headers = { Accept: "application/json" };
    if (body) headers["Content-Type"] = "application/json";
    if (auth && state.token) headers.Authorization = `Bearer ${state.token}`;
    let res;
    try {
      res = await fetch(`${API}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined, credentials: "same-origin" });
    } catch {
      const err = new Error("We couldn't reach Wasl. Check your connection and try again.");
      err.status = 0;
      throw err;
    }
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const err = new Error((data && typeof data.error === "string" && data.error) || (data && typeof data.message === "string" && data.message) || "Something went wrong. Please try again.");
      err.status = res.status;
      err.data = data;
      if (auth && res.status === 401 && requestToken === state.token) handleExpiredSession();
      throw err;
    }
    return data;
  }

  /* ----- Auth state ----- */
  function setSession(token, user) {
    state.token = token;
    state.user = { id: String(user.id ?? ""), name: String(user.name ?? ""), email: String(user.email ?? "") };
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(state.user));
    renderAccountNav();
  }
  function clearSession() {
    state.token = null;
    state.user = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    $("#orders-content").innerHTML = "";
    state.ordersReq++;
    state.orderGiftToken = null;
    state.orderReceived = false;
    state.orderReference = null;
    state.orderTotalFils = null;
    renderAccountNav();
  }
  function handleExpiredSession() {
    const had = !!state.token;
    clearSession();
    if (had) showToast("Your session ended. Please log in again.");
    const view = currentView().view;
    if (view === "orders" || view === "checkout") navigate(`login?next=${view}`, true);
  }
  function logout() {
    clearSession();
    showToast("You've been logged out");
    announce("Logged out");
    const view = currentView().view;
    if (view === "orders") navigate("products", true);
    else if (view === "checkout") renderCheckout(false);
  }
  function renderAccountNav() {
    const nav = $("#account-nav");
    const mobile = $("#mobile-account");
    if (state.user) {
      nav.innerHTML = `<a class="account-link orders-link" href="#orders">My Orders</a>
        <span class="account-user" title="${esc(state.user.email)}">${icon.user}<span>${esc(state.user.name)}</span></span>
        <button class="account-link logout-link" type="button" data-logout>Log out</button>`;
      mobile.innerHTML = `<span class="mobile-user">Signed in as ${esc(state.user.name)}</span><a href="#orders">My Orders</a><button type="button" data-logout>Log out</button>`;
    } else {
      nav.innerHTML = `<a class="account-link" href="#login">Log in</a><a class="account-link account-cta" href="#signup">Sign up</a>`;
      mobile.innerHTML = `<a href="#login">Log in</a><a href="#signup">Sign up</a>`;
    }
  }
  async function verifySession() {
    if (!state.token) { clearSession(); return; }
    const verifyingToken = state.token;
    try {
      const data = await api("/auth/me", { auth: true });
      if (state.token !== verifyingToken) return;
      if (data && data.user) {
        state.user = { id: String(data.user.id ?? ""), name: String(data.user.name ?? ""), email: String(data.user.email ?? "") };
        localStorage.setItem(USER_KEY, JSON.stringify(state.user));
        renderAccountNav();
        if (currentView().view === "orders") loadOrders();
      }
    } catch (err) {
      if (state.token === verifyingToken && (err.status === 401 || err.status === 403 || err.status === 404)) handleExpiredSession();
    }
  }

  /* ----- Catalog ----- */
  function normalizeProduct(p) {
    if (!p || p.id == null) return null;
    return {
      id: String(p.id),
      name: String(p.name ?? "Wasl accessory"),
      description: String(p.description ?? ""),
      category: String(p.category ?? ""),
      features: Array.isArray(p.features) ? p.features.map(String) : [],
      tag: p.tag ? String(p.tag) : "",
      image: safeImage(p.image),
      price: Number.isInteger(p.price) ? p.price : Math.round(Number(p.price) || 0),
      stock: Number.isInteger(p.stock) ? p.stock : null,
      moods: Array.isArray(p.moods) ? p.moods.filter((m) => MOODS.includes(m)) : []
    };
  }
  async function loadProducts() {
    state.catalogStatus = "loading";
    renderProducts();
    try {
      const data = await api("/products");
      if (!Array.isArray(data)) throw new Error("Unexpected response from the catalog.");
      state.products = data.map(normalizeProduct).filter(Boolean);
      state.catalogStatus = "ready";
      restoreCart();
    } catch (err) {
      state.catalogStatus = "error";
      $("#catalog-error-copy").textContent = err.status === 0 ? err.message : "Our inventory service didn't respond. Your cart is safe.";
    }
    renderProducts();
    updateCart();
  }
  function restoreCart() {
    state.cart.clear();
    state.savedCart.forEach(({ id, quantity }) => {
      const product = productById(id);
      if (!product) return;
      const q = Math.min(quantity, maxQty(product));
      if (q > 0) state.cart.set(product.id, { product, quantity: q });
    });
    persistCart();
  }

  function renderProducts() {
    const errorEl = $("#catalog-error");
    const emptyEl = $("#catalog-empty");
    errorEl.hidden = state.catalogStatus !== "error";
    emptyEl.hidden = !(state.catalogStatus === "ready" && state.products.length === 0);
    clearSearch.hidden = !state.search;
    if (state.catalogStatus === "loading") {
      grid.hidden = false;
      noResults.hidden = true;
      grid.setAttribute("aria-busy", "true");
      grid.innerHTML = Array.from({ length: 8 }, () => `<div class="product-card skeleton-card" aria-hidden="true"><div class="product-art skeleton"></div><div class="product-detail"><span class="skeleton skeleton-line short"></span><span class="skeleton skeleton-line"></span><span class="skeleton skeleton-line"></span><span class="skeleton skeleton-line tall"></span></div></div>`).join("");
      resultsSummary.textContent = "Loading the collection from our Kuwait hub...";
      return;
    }
    grid.setAttribute("aria-busy", "false");
    if (state.catalogStatus === "error" || state.products.length === 0) {
      grid.hidden = true;
      grid.innerHTML = "";
      noResults.hidden = true;
      resultsSummary.textContent = state.catalogStatus === "error" ? "The collection is temporarily unavailable." : "No products listed right now.";
      return;
    }
    const query = state.search.trim().toLowerCase();
    const visible = state.products.filter((product) => {
      const text = `${product.name} ${product.category} ${product.description} ${product.features.join(" ")} ${product.moods.join(" ")}`.toLowerCase();
      return (state.category === "all" || product.category === state.category)
        && (state.mood === "all" || product.moods.includes(state.mood))
        && text.includes(query)
        && (!state.favoritesOnly || state.favorites.has(product.id));
    });

    grid.innerHTML = visible.map((product) => {
      const id = esc(product.id);
      const name = esc(product.name);
      const fav = state.favorites.has(product.id);
      const soldOut = product.stock === 0;
      return `
      <article class="product-card" data-product-id="${id}">
        <div class="product-art">
          ${product.tag ? `<span class="product-tag ${product.tag === "New" ? "new" : ""}">${esc(product.tag)}</span>` : ""}
          <button class="favorite-button" type="button" aria-label="${fav ? "Remove from" : "Add to"} favorites: ${name}" aria-pressed="${fav}" data-favorite="${id}">${icon.heart}</button>
          <button class="image-quick" type="button" aria-label="Quick view ${name}" data-quick="${id}">
            ${product.image ? `<img src="${esc(product.image)}" alt="${name}" loading="lazy">` : ""}
            <span class="quick-hint">Quick view</span>
          </button>
        </div>
        <div class="product-detail">
          <span class="product-meta">${esc(product.category)} · Kuwait ready</span>
          <h3>${name}</h3>
          <p class="product-description">${esc(product.description)}</p>
          ${product.moods.length ? `<div class="product-moods">${product.moods.map((m) => `<span data-tone="${esc(m.toLowerCase())}">${esc(m)}</span>`).join("")}</div>` : ""}
          <div class="product-footer">
            <div class="price-stack"><span class="price-caption">${soldOut ? "Sold out" : "Kuwait price"}</span><span class="price"><small>KWD</small> ${(product.price / 1000).toFixed(3)}</span></div>
            <button class="add-button" type="button" data-add="${id}" aria-label="Add ${name} to cart" ${soldOut ? "disabled" : ""}>${icon.bag}<span>${soldOut ? "Sold out" : "Add"}</span></button>
          </div>
        </div>
      </article>`;
    }).join("");
    grid.hidden = visible.length === 0;
    noResults.hidden = visible.length !== 0;
    const parts = [];
    if (state.favoritesOnly) parts.push("favorites");
    else parts.push(state.category === "all" ? "essentials" : `${state.category.toLowerCase()} picks`);
    if (state.mood !== "all") parts.push(`${state.mood.toLowerCase()} mood`);
    resultsSummary.textContent = visible.length
      ? `${visible.length} ${visible.length === 1 ? "product" : "products"} · ${parts.join(", ")}, ready to ship from Kuwait.`
      : "No matches in this selection.";
  }

  /* ----- Totals ----- */
  const cartItems = () => [...state.cart.values()];
  const cartQuantity = () => cartItems().reduce((s, i) => s + i.quantity, 0);
  const cartSubtotal = () => cartItems().reduce((s, i) => s + i.product.price * i.quantity, 0);
  const cartDiscount = (subtotal) => (state.discountApplied ? Math.round(subtotal * 0.1) : 0);
  const cartTotal = (subtotal) => subtotal - cartDiscount(subtotal);

  function updateHeader() {
    $("#cart-count").textContent = cartQuantity();
    $("#header-total").textContent = formatPrice(cartTotal(cartSubtotal()));
    $("#favorite-count").textContent = state.favorites.size;
    const favoriteToggle = $("#favorites-toggle");
    favoriteToggle.setAttribute("aria-pressed", String(state.favoritesOnly));
    favoriteToggle.setAttribute("aria-label", state.favoritesOnly ? "Show all products" : "Show favorites");
    favoriteToggle.classList.toggle("is-active", state.favoritesOnly);
  }

  function renderCart() {
    const items = cartItems();
    const quantity = cartQuantity();
    const subtotal = cartSubtotal();
    const discount = cartDiscount(subtotal);
    const total = subtotal - discount;
    const achieved = subtotal >= 10000;
    const remaining = Math.max(0, 10000 - subtotal);
    $("#drawer-count").textContent = `(${quantity} ${quantity === 1 ? "item" : "items"})`;
    const content = $("#drawer-content");
    const footer = $("#drawer-footer");

    if (!items.length) {
      const waiting = state.catalogStatus === "loading" && state.savedCart.length;
      content.innerHTML = `<div class="empty-cart">
        <div class="empty-cart-art"><svg viewBox="0 0 24 24"><path d="M12 22v-5M9 8V2m6 6V2m3 6v5a6 6 0 0 1-12 0V8z"/></svg><span>0</span></div>
        <h3>${waiting ? "Restoring your cart..." : "Your cart is empty"}</h3><p>${waiting ? "Loading the latest prices from our Kuwait hub." : "Let's find your essentials. Orders placed before 4 PM arrive today across Kuwait."}</p>
        ${waiting ? "" : `<button class="button button-primary" type="button" data-explore>Explore best sellers →</button>`}</div>`;
      footer.innerHTML = "";
      return;
    }

    content.innerHTML = `<section class="delivery-progress" aria-label="Free delivery progress">
        <div class="progress-heading"><span>${icon.delivery} Kuwait same-day delivery</span><span>${achieved ? "FREE DELIVERY UNLOCKED" : `${Math.max(0, 100 - Math.round(subtotal / 100))}% TO GO`}</span></div>
        <p class="progress-copy">${achieved ? "Your order qualifies for free delivery across all 6 Governorates." : `Add <strong>${formatPrice(remaining)}</strong> more for free delivery across all 6 Governorates.`}</p>
        <div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, subtotal / 100)}%"></div></div>
        <div class="progress-caption"><span>KWD 0.000</span><strong>Threshold: KWD 10.000</strong></div>
      </section>
      <div class="cart-list">${items.map(({ product, quantity: count }) => {
        const id = esc(product.id); const name = esc(product.name);
        const atMax = count >= maxQty(product);
        return `
        <article class="cart-row">
          <div class="cart-thumb">${product.image ? `<img src="${esc(product.image)}" alt="" loading="lazy">` : ""}</div>
          <div class="cart-row-main"><div class="cart-row-heading"><h3>${name}</h3><button class="remove-item" type="button" data-remove="${id}" aria-label="Remove ${name}">${icon.trash}</button></div>
            <div class="cart-row-bottom"><div class="qty-control" role="group" aria-label="Quantity of ${name}">
              <button type="button" data-qty="${id}" data-change="-1" aria-label="Decrease quantity of ${name}">${icon.minus}</button><span class="qty-value">${count}</span><button type="button" data-qty="${id}" data-change="1" aria-label="Increase quantity of ${name}" ${atMax ? "disabled" : ""}>${icon.plus}</button>
            </div><span class="row-price">${formatPrice(product.price * count)}</span></div>
          </div>
        </article>`;
      }).join("")}</div>`;
    footer.innerHTML = `<div class="summary-row"><span>Subtotal</span><strong>${formatPrice(subtotal)}</strong></div>
      ${discount ? `<div class="summary-row discount-summary-row"><span>10% discount · WASL10</span><strong>−${formatPrice(discount)}</strong></div>` : ""}
      <div class="summary-row summary-total"><span>Cart total</span><strong>${formatPrice(total)}</strong></div>
      <button class="checkout-button" type="button" data-checkout><span>${icon.bag} ${state.user ? "Proceed to checkout" : "Log in to check out"}</span><strong>${formatPrice(total)}</strong></button>
      <p class="payment-note">Final total confirmed by Wasl at checkout · No payment will be taken</p>`;
  }

  function updateCart() {
    updateHeader();
    renderCart();
    if (currentView().view === "checkout") renderCheckout(false);
  }

  /* ----- Routing (hash views) ----- */
  function currentView() {
    const raw = location.hash.replace(/^#/, "");
    const [name, query = ""] = raw.split("?");
    const params = new URLSearchParams(query);
    const known = ["checkout", "login", "signup", "orders"];
    return { view: known.includes(name) ? name : "store", next: params.get("next") };
  }
  function safeNext(value) {
    return SAFE_VIEWS.includes(value) ? value : "products";
  }
  function navigate(hash, replace = false) {
    const url = `${location.pathname}${location.search}#${hash}`;
    if (replace) history.replaceState(null, "", url); else history.pushState(null, "", url);
    setPageFromHash();
  }

  function setPageFromHash() {
    const { view, next } = currentView();
    const isCheckout = view === "checkout";
    const isAuth = view === "login" || view === "signup";
    const isOrders = view === "orders";
    if (view !== "store" && video) video.pause();
    if (isOrders && !state.token) { navigate("login?next=orders", true); return; }
    if (isAuth && state.token && state.user) { navigate(safeNext(next), true); return; }
    storeView.hidden = view !== "store";
    checkoutView.hidden = !isCheckout;
    authView.hidden = !isAuth;
    ordersView.hidden = !isOrders;
    $("#contact").hidden = view !== "store";
    discountWidget.classList.toggle("is-suppressed", isAuth || isOrders);
    document.title = isCheckout ? "Checkout - Wasl Kuwait" : isAuth ? `${view === "login" ? "Log in" : "Sign up"} - Wasl Kuwait` : isOrders ? "My orders - Wasl Kuwait" : "Wasl — Tech that keeps up";
    document.querySelectorAll(".desktop-nav .nav-link").forEach((l) => l.classList.toggle("is-current", view === "store" && l.getAttribute("href") === "#products"));
    if (isCheckout) renderCheckout(true);
    if (isAuth) renderAuth(view, safeNext(next));
    if (isOrders) loadOrders();
    if (view !== "store") window.scrollTo({ top: 0 });
  }

  /* ----- Auth view ----- */
  function renderAuth(mode, next) {
    state.authMode = mode;
    state.authNext = next;
    const signup = mode === "signup";
    $("#auth-kicker").textContent = signup ? "JOIN WASL" : "WELCOME BACK";
    $("#auth-title").innerHTML = `${signup ? "Create account" : "Log in"}<span>.</span>`;
    $("#auth-lede").textContent = next === "checkout"
      ? "Your cart is saved. Sign in and you'll go straight back to checkout."
      : next === "orders" ? "Log in to see your private order history." : signup ? "Private orders, gift links, and a cart that waits for you." : "Pick up where you left off.";
    $("#auth-name-field").hidden = !signup;
    $("#auth-password").setAttribute("autocomplete", signup ? "new-password" : "current-password");
    $("#auth-password-hint").hidden = !signup;
    $("#auth-submit").textContent = signup ? "Create account" : "Log in";
    const nextQ = next !== "products" ? `?next=${next}` : "";
    $("#auth-switch").innerHTML = signup
      ? `Already have an account? <a href="#login${nextQ}">Log in</a>`
      : `New to Wasl? <a href="#signup${nextQ}">Create an account</a>`;
    $("#auth-error").hidden = true;
    $("#auth-form").querySelectorAll(".field-error").forEach((e) => { e.textContent = ""; });
    $("#auth-form").querySelectorAll("[aria-invalid]").forEach((e) => e.removeAttribute("aria-invalid"));
    $("#auth-password").value = "";
    window.setTimeout(() => $("#auth-title").focus(), 0);
  }

  async function submitAuth(event) {
    event.preventDefault();
    if (state.authBusy) return;
    const signup = state.authMode === "signup";
    const form = $("#auth-form");
    form.querySelectorAll(".field-error").forEach((e) => { e.textContent = ""; });
    form.querySelectorAll("[aria-invalid]").forEach((e) => e.removeAttribute("aria-invalid"));
    const errBox = $("#auth-error");
    errBox.hidden = true;
    const name = $("#auth-name").value.trim();
    const email = $("#auth-email").value.trim().toLowerCase();
    const password = $("#auth-password").value;
    let first = null;
    const fail = (id, msg) => { const f = $(`#${id}`); f.setAttribute("aria-invalid", "true"); $(`#${id}-error`).textContent = msg; if (!first) first = f; };
    if (signup && name.length < 2) fail("auth-name", "Enter your name.");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail("auth-email", "Enter a valid email address.");
    if (!password) fail("auth-password", "Enter your password.");
    else if (signup && password.length < 8) fail("auth-password", "Use at least 8 characters.");
    if (first) { first.focus(); return; }
    state.authBusy = true;
    const btn = $("#auth-submit");
    btn.disabled = true;
    btn.textContent = signup ? "Creating account..." : "Logging in...";
    try {
      const data = await api(signup ? "/auth/signup" : "/auth/login", { method: "POST", body: signup ? { name, email, password } : { email, password } });
      if (!data || typeof data.token !== "string" || !data.user) throw new Error("Unexpected response. Please try again.");
      setSession(data.token, data.user);
      form.reset();
      showToast(signup ? `Welcome to Wasl, ${state.user.name}` : `Welcome back, ${state.user.name}`, "success");
      announce(`Signed in as ${state.user.name}`);
      renderCart();
      navigate(state.authNext, true);
    } catch (err) {
      errBox.textContent = err.status === 401 ? "Invalid email or password" : err.status === 409 ? "An account with this email already exists. Try logging in." : err.message;
      errBox.hidden = false;
    } finally {
      state.authBusy = false;
      btn.disabled = false;
      btn.textContent = signup ? "Create account" : "Log in";
    }
  }

  /* ----- Orders view ----- */
  async function loadOrders() {
    const box = $("#orders-content");
    if (!state.token) return;
    const req = ++state.ordersReq;
    box.innerHTML = `<div class="orders-list" aria-busy="true">${Array.from({ length: 3 }, () => `<div class="order-card skeleton-card" aria-hidden="true"><span class="skeleton skeleton-line short"></span><span class="skeleton skeleton-line"></span><span class="skeleton skeleton-line tall"></span></div>`).join("")}</div>`;
    try {
      const data = await api("/orders", { auth: true });
      if (req !== state.ordersReq || !state.token) return;
      const orders = Array.isArray(data) ? data : [];
      $("#orders-sub").textContent = state.user ? `Signed in as ${state.user.name}. Visible only to you.` : "Visible only to you.";
      if (!orders.length) {
        box.innerHTML = `<section class="checkout-state-card"><div class="checkout-state-icon" aria-hidden="true">${icon.bag}</div><span class="section-kicker">NO ORDERS YET</span><h2>Nothing here yet</h2><p>When you place an order it will appear here, along with gift links for anything you send.</p><a class="button button-primary" href="#products">Start shopping</a></section>`;
        return;
      }
      orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      box.innerHTML = `<div class="orders-list">${orders.map(renderOrderCard).join("")}</div>`;
    } catch (err) {
      if (req !== state.ordersReq) return;
      if (err.status === 401) return;
      box.innerHTML = `<section class="checkout-state-card" role="alert"><div class="checkout-state-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 8v5m0 3.5v.5"/><circle cx="12" cy="12" r="9"/></svg></div><h2>We couldn't load your orders</h2><p>${esc(err.message)}</p><button class="button button-primary" type="button" data-orders-retry>Try again</button></section>`;
    }
  }
  function renderOrderCard(order) {
    const date = new Date(order.createdAt);
    const dateText = Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    const items = Array.isArray(order.items) ? order.items : [];
    const subtotal = Number.isFinite(order.subtotalFils) ? order.subtotalFils : items.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.quantity) || 0), 0);
    const discount = Number(order.discountFils) || 0;
    const total = Number.isFinite(order.total) ? order.total : subtotal - discount;
    const token = order.isGift && typeof order.giftToken === "string" ? order.giftToken : "";
    return `<article class="order-card">
      <header class="order-head">
        <div><span class="order-ref">${esc(order.orderReference || "Order")}</span><span class="order-date">${esc(dateText)}</span></div>
        <div class="order-badges">${order.isGift ? `<span class="gift-badge">${icon.gift} Gift</span>` : ""}<span class="status-badge">${esc(order.status || "pending")}</span></div>
      </header>
      <ul class="order-items">${items.map((i) => `<li><span>${esc(i.name)} <small>× ${esc(i.quantity)}</small></span><strong>${formatPrice((Number(i.price) || 0) * (Number(i.quantity) || 0))}</strong></li>`).join("")}</ul>
      <footer class="order-foot">
        <div class="order-totals">${discount ? `<span>Discount −${formatPrice(discount)}</span>` : ""}<span class="order-total">Total <strong>${formatPrice(total)}</strong></span></div>
        ${token ? `<button class="button button-soft copy-gift" type="button" data-copy-gift="${esc(token)}">${icon.link} Copy gift link</button>` : ""}
      </footer>
    </article>`;
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) { await navigator.clipboard.writeText(text); return true; }
    } catch { /* fall through */ }
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.left = "-9999px";
    document.body.append(field);
    field.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch { ok = false; }
    field.remove();
    return ok;
  }
  async function copyGift(token, button) {
    const ok = await copyText(giftLinkFor(token));
    if (ok) {
      showToast("Gift link copied", "success");
      announce("Gift link copied to clipboard");
      if (button) {
        const prev = button.innerHTML;
        button.innerHTML = `${icon.check} Copied`;
        window.setTimeout(() => { if (button.isConnected) button.innerHTML = prev; }, 1600);
      }
    } else {
      window.prompt("Copy this gift link:", giftLinkFor(token));
    }
  }

  /* ----- Checkout ----- */
  function renderCheckout(resetForm) {
    const items = cartItems();
    const quantity = cartQuantity();
    $("#checkout-item-count").textContent = `${quantity} ${quantity === 1 ? "item" : "items"}`;
    $("#checkout-items").innerHTML = items.map(({ product, quantity: count }) => `
      <article class="checkout-item">
        <div class="checkout-item-image">${product.image ? `<img src="${esc(product.image)}" alt="" loading="lazy">` : ""}</div>
        <div class="checkout-item-info"><strong>${esc(product.name)}</strong><small>Qty ${count} · ${formatPrice(product.price)} each</small></div>
        <span class="checkout-item-price">${formatPrice(product.price * count)}</span>
      </article>`).join("");
    updateCheckoutTotals();

    const loadingCart = state.catalogStatus === "loading" && state.savedCart.length > 0;
    const showingSuccess = state.orderReceived;
    const showingEmpty = !items.length && !showingSuccess && !loadingCart;
    const needsAuth = !showingSuccess && !showingEmpty && !state.token;
    checkoutSuccess.hidden = !showingSuccess;
    if (showingSuccess) {
      $("#order-reference").textContent = state.orderReference ?? "";
      $("#order-confirmation-total").textContent = formatPrice(state.orderTotalFils ?? 0);
      $("#success-gift").hidden = !state.orderGiftToken;
    }
    checkoutEmpty.hidden = !showingEmpty;
    checkoutAuth.hidden = !needsAuth;
    checkoutLayout.hidden = showingSuccess || showingEmpty || needsAuth;
    if (resetForm) {
      checkoutForm.reset();
      if (state.user) {
        $("#checkout-name").value = state.user.name;
        if (state.user.email) $("#checkout-email").value = state.user.email;
      }
      syncGiftFields();
      clearCheckoutErrors();
      checkoutSubmitError.hidden = true;
    }
  }
  function updateCheckoutTotals() {
    const subtotal = cartSubtotal();
    const discount = cartDiscount(subtotal);
    $("#checkout-subtotal").textContent = formatPrice(subtotal);
    $("#checkout-discount-row").hidden = discount === 0;
    $("#checkout-discount").textContent = `−${formatPrice(discount)}`;
    $("#checkout-total").textContent = formatPrice(subtotal - discount);
  }
  function syncGiftFields() {
    const on = giftToggle.checked && !!state.token;
    giftFields.hidden = !on;
    $("#checkout-gift-to").required = on;
    $("#gift-count").textContent = `${$("#checkout-gift-message").value.length} / 300`;
  }
  function openCheckout() {
    if (!state.cart.size) return;
    state.orderReceived = false;
    closeOverlays(false);
    if (!state.token) { navigate("login?next=checkout"); return; }
    if (currentView().view === "checkout") setPageFromHash(); else navigate("checkout");
    window.setTimeout(() => $("#checkout-title").focus(), 0);
  }
  function clearCheckoutErrors() {
    checkoutForm.querySelectorAll(".field-error").forEach((e) => { e.textContent = ""; });
    checkoutForm.querySelectorAll("[aria-invalid='true']").forEach((f) => f.removeAttribute("aria-invalid"));
  }
  function checkoutError(field, message) {
    const error = document.querySelector(`#${field.id}-error`);
    field.setAttribute("aria-invalid", "true");
    if (error) error.textContent = message;
  }

  async function submitOrder(event) {
    event.preventDefault();
    clearCheckoutErrors();
    checkoutSubmitError.hidden = true;
    checkoutSubmitError.textContent = "";
    if (state.isSubmittingOrder) return;
    if (!state.token) { navigate("login?next=checkout"); return; }
    if (!state.cart.size) { renderCheckout(false); return; }
    let firstInvalid = null;
    const flag = (field, msg) => { checkoutError(field, msg); if (!firstInvalid) firstInvalid = field; };
    [...checkoutForm.querySelectorAll("[required]")].forEach((field) => {
      if (field.closest("[hidden]")) return;
      if (!field.value.trim()) flag(field, "This field is required.");
      else if (field.id === "checkout-phone" && !/^[569][0-9]{7}$/.test(field.value.trim())) flag(field, "Enter a valid 8-digit Kuwait mobile number.");
    });
    const email = $("#checkout-email");
    if (email.value.trim() && !email.validity.valid) flag(email, "Enter a valid email address.");
    const isGift = giftToggle.checked;
    const giftMessage = $("#checkout-gift-message").value.trim();
    if (isGift && giftMessage.length > 300) flag($("#checkout-gift-message"), "Keep your message to 300 characters.");
    const wrapInput = checkoutForm.querySelector("input[name='giftWrap']:checked");
    const giftWrap = wrapInput && GIFT_WRAPS.includes(wrapInput.value) ? wrapInput.value : "Classic";
    if (firstInvalid) {
      firstInvalid.focus();
      announce("Please fix the highlighted fields.");
      return;
    }

    const fd = new FormData(checkoutForm);
    const val = (k) => String(fd.get(k) ?? "").trim();
    const payload = {
      items: cartItems().map(({ product, quantity }) => ({ productId: product.id, quantity })),
      delivery: {
        name: val("name"),
        phone: val("phone"),
        ...(val("email") ? { email: val("email") } : {}),
        governorate: val("governorate"),
        area: val("area"),
        block: val("block"),
        street: val("street"),
        building: val("building"),
        ...(val("instructions") ? { instructions: val("instructions") } : {})
      },
      ...(state.discountApplied ? { couponCode: "WASL10" } : {}),
      isGift,
      ...(isGift ? { giftTo: val("giftTo"), ...(giftMessage ? { giftMessage } : {}), giftWrap } : {})
    };

    const submitButton = checkoutForm.querySelector(".place-order-button");
    const original = submitButton.innerHTML;
    state.isSubmittingOrder = true;
    submitButton.disabled = true;
    submitButton.setAttribute("aria-busy", "true");
    submitButton.textContent = "Placing order...";
    try {
      const result = await api("/orders", { method: "POST", body: payload, auth: true });
      if (!result || typeof result.orderReference !== "string") throw new Error("We couldn't confirm your order. Please check My Orders before trying again.");
      state.orderReceived = true;
      state.orderReference = result.orderReference;
      state.orderTotalFils = Number.isFinite(result.totalFils) ? result.totalFils : null;
      state.orderGiftToken = result.isGift && typeof result.giftToken === "string" ? result.giftToken : null;
      state.cart.clear();
      persistCart();
      checkoutForm.reset();
      updateCart();
      window.scrollTo({ top: 0 });
      window.setTimeout(() => checkoutSuccess.focus(), 0);
      announce(`Order ${result.orderReference} saved.`);
    } catch (err) {
      if (err.status === 401) return;
      checkoutSubmitError.textContent = err.message;
      checkoutSubmitError.hidden = false;
      checkoutSubmitError.focus?.();
    } finally {
      state.isSubmittingOrder = false;
      submitButton.disabled = false;
      submitButton.removeAttribute("aria-busy");
      submitButton.innerHTML = original;
    }
  }

  /* ----- Cart & favorites ----- */
  function addToCart(id, button) {
    const product = productById(id);
    if (!product) return;
    const existing = state.cart.get(product.id);
    const next = (existing ? existing.quantity : 0) + 1;
    if (next > maxQty(product)) {
      showToast(product.stock === 0 ? `${product.name} is sold out` : `Only ${maxQty(product)} of ${product.name} available`);
      return;
    }
    state.cart.set(product.id, { product, quantity: next });
    persistCart();
    updateCart();
    announce(`${product.name} added to cart. Cart has ${cartQuantity()} items.`);
    showToast(`${product.name} added to your cart`, "success");
    if (button) {
      const label = button.querySelector("span");
      const previous = label ? label.textContent : "";
      button.classList.add("is-added");
      if (label) label.textContent = "Added";
      button.setAttribute("aria-label", `${product.name} added to cart`);
      window.setTimeout(() => {
        if (!button.isConnected) return;
        button.classList.remove("is-added");
        if (label) label.textContent = previous || "Add";
        button.setAttribute("aria-label", `Add ${product.name} to cart`);
      }, 1000);
    }
  }
  function changeQuantity(id, delta) {
    const item = state.cart.get(String(id));
    if (!item) return;
    const next = item.quantity + delta;
    if (next <= 0) state.cart.delete(item.product.id);
    else if (next > maxQty(item.product)) { showToast(`Only ${maxQty(item.product)} available`); return; }
    else state.cart.set(item.product.id, { ...item, quantity: next });
    persistCart();
    updateCart();
    announce(next <= 0 ? `${item.product.name} removed from cart` : `${item.product.name} quantity ${next}`);
  }
  function toggleFavorite(id) {
    const product = productById(id);
    if (!product) return;
    if (state.favorites.has(product.id)) {
      state.favorites.delete(product.id);
      showToast(`${product.name} removed from favorites`);
      announce(`${product.name} removed from favorites`);
    } else {
      state.favorites.add(product.id);
      showToast(`${product.name} saved to favorites`, "success");
      announce(`${product.name} saved to favorites`);
    }
    updateHeader();
    renderProducts();
  }

  /* ----- Overlays ----- */
  function syncOverlay() {
    const active = cartDrawer.classList.contains("open") || quickModal.classList.contains("open");
    overlay.hidden = !active;
    document.body.classList.toggle("overlay-open", active);
    requestAnimationFrame(() => overlay.classList.toggle("visible", active));
  }
  function openCart() {
    state.lastFocus = document.activeElement;
    quickModal.classList.remove("open");
    quickModal.setAttribute("aria-hidden", "true");
    cartDrawer.classList.add("open");
    cartDrawer.setAttribute("aria-hidden", "false");
    syncOverlay();
    window.setTimeout(() => cartDrawer.querySelector(".close-button").focus(), 40);
  }
  function openQuickView(id) {
    const product = productById(id);
    if (!product) return;
    state.lastFocus = document.activeElement;
    cartDrawer.classList.remove("open");
    cartDrawer.setAttribute("aria-hidden", "true");
    const name = esc(product.name);
    const img = product.image ? esc(product.image) : "";
    const soldOut = product.stock === 0;
    const stockText = soldOut ? "Sold out" : product.stock !== null && product.stock <= 5 ? `Only ${product.stock} left in Kuwait` : "✓ In stock in Kuwait";
    $("#quick-content").innerHTML = `
      <div class="quick-layout">
        <div class="quick-gallery">
          <div class="quick-gallery-top"><span class="quick-cert"><i class="status-dot"></i> &nbsp;Tested for Kuwait conditions</span><span class="quick-code">WASL / KW</span></div>
          <div class="quick-image-wrap">${img ? `<img src="${img}" alt="${name}">` : ""}<div class="quick-image-note">KUWAIT READY<strong>Built for everyday use</strong></div></div>
          <div class="quick-thumbnails">${img ? [1, 2, 3].map((n) => `<button class="quick-thumb ${n === 1 ? "active" : ""}" type="button" aria-label="Product view ${n}"><img src="${img}" alt=""></button>`).join("") : ""}</div>
        </div>
        <div class="quick-details">
          <div><div class="quick-status-row">${product.tag ? `<span class="quick-tag">${esc(product.tag)}</span>` : ""}<span class="quick-stock">${esc(stockText)}</span></div>
            <h2 id="quick-title">${name}</h2><p class="quick-description">${esc(product.description)}</p>
            ${product.moods.length ? `<div class="product-moods quick-moods">${product.moods.map((m) => `<span data-tone="${esc(m.toLowerCase())}">${esc(m)}</span>`).join("")}</div>` : ""}</div>
          <div class="quick-price-block"><div><strong class="quick-price"><small>KWD</small> ${(product.price / 1000).toFixed(3)}</strong><span class="vat-note">Kuwait price · VAT inclusive</span></div><span class="quick-stock">${soldOut ? "Restocking soon" : "Ready to dispatch"}</span></div>
          <ul class="quick-features">${product.features.map((f) => `<li><span class="feature-check">✓</span><span>${esc(f)}</span></li>`).join("")}</ul>
          <div class="quick-action"><button class="quick-add" type="button" data-quick-add="${esc(product.id)}" ${soldOut ? "disabled" : ""}>${soldOut ? "Sold out" : `Add to cart — ${formatPrice(product.price)}`}</button><div class="quick-local-note">${icon.delivery} Order before 4 PM for same-day Kuwait delivery across all 6 governorates.</div></div>
        </div>
      </div>`;
    quickModal.hidden = false;
    quickModal.classList.add("open");
    quickModal.setAttribute("aria-hidden", "false");
    syncOverlay();
    window.setTimeout(() => quickModal.querySelector(".modal-close").focus(), 30);
  }
  function closeOverlays(restoreFocus = true) {
    const wasOpen = cartDrawer.classList.contains("open") || quickModal.classList.contains("open");
    cartDrawer.classList.remove("open");
    cartDrawer.setAttribute("aria-hidden", "true");
    quickModal.classList.remove("open");
    quickModal.setAttribute("aria-hidden", "true");
    syncOverlay();
    if (wasOpen && restoreFocus && state.lastFocus && state.lastFocus.isConnected) state.lastFocus.focus();
  }
  function showToast(message, kind = "") {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.className = `toast show ${kind}`;
    toastTimer = window.setTimeout(() => { toast.className = "toast"; }, 2600);
  }
  function announce(message) {
    announcement.textContent = "";
    window.setTimeout(() => { announcement.textContent = message; }, 20);
  }
  function setChipGroup(selector, attr, value) {
    document.querySelectorAll(selector).forEach((chip) => {
      const active = chip.dataset[attr] === value;
      chip.classList.toggle("active", active);
      chip.setAttribute("aria-pressed", String(active));
    });
  }
  function setCategory(category) {
    state.category = category;
    setChipGroup(".category-chip", "category", category);
    renderProducts();
  }
  function setMood(mood) {
    state.mood = mood;
    setChipGroup(".mood-chip", "mood", mood);
    renderProducts();
  }

  /* ----- Discount (unchanged behavior) ----- */
  function updateDiscountPanel() {
    discountSignupState.hidden = state.discountApplied;
    discountSuccessState.hidden = !state.discountApplied;
    discountTab.setAttribute("aria-label", state.discountApplied ? "Open your 10 percent discount code" : "Open optional 10 percent discount offer");
    discountTab.classList.toggle("discount-applied", state.discountApplied);
  }
  function setDiscountModalOpen(open, restoreFocus = false) {
    discountModalLayer.hidden = !open;
    discountTab.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("discount-modal-open", open);
    if (open) window.setTimeout(() => (state.discountApplied ? copyDiscountCodeButton : discountEmail).focus(), 0);
    else if (restoreFocus) discountTab.focus();
  }
  async function copyDiscountCode() {
    const code = $("#discount-code").textContent;
    if (!(await copyText(code))) {
      $("#discount-copy-feedback").textContent = "Couldn’t copy automatically. Please select and copy WASL10.";
      return;
    }
    announce("Discount code WASL10 copied. Your discount remains applied.");
    setDiscountModalOpen(false, true);
  }

  /* ----- Events ----- */
  grid.addEventListener("click", (event) => {
    const favorite = event.target.closest("[data-favorite]");
    if (favorite) { event.stopPropagation(); toggleFavorite(favorite.dataset.favorite); return; }
    const add = event.target.closest("[data-add]");
    if (add) { addToCart(add.dataset.add, add); return; }
    const quick = event.target.closest("[data-quick]");
    if (quick) openQuickView(quick.dataset.quick);
  });
  $("#category-chips").addEventListener("click", (event) => {
    const chip = event.target.closest("[data-category]");
    if (chip) setCategory(chip.dataset.category);
  });
  $("#mood-chips").addEventListener("click", (event) => {
    const chip = event.target.closest("[data-mood]");
    if (chip) setMood(chip.dataset.mood);
  });
  $("#catalog-retry").addEventListener("click", loadProducts);
  searchInput.addEventListener("input", () => { state.search = searchInput.value; renderProducts(); });
  clearSearch.addEventListener("click", () => {
    searchInput.value = ""; state.search = ""; renderProducts(); searchInput.focus();
  });
  $("#reset-filters").addEventListener("click", () => {
    state.favoritesOnly = false;
    searchInput.value = "";
    state.search = "";
    state.mood = "all";
    setChipGroup(".mood-chip", "mood", "all");
    setCategory("all");
    updateHeader();
  });
  $("#favorites-toggle").addEventListener("click", () => {
    if (currentView().view !== "store") navigate("products");
    state.favoritesOnly = !state.favoritesOnly;
    if (state.favoritesOnly) { state.category = "all"; setChipGroup(".category-chip", "category", "all"); }
    updateHeader();
    renderProducts();
    $("#products").scrollIntoView({ behavior: "smooth", block: "start" });
    if (state.favoritesOnly) showToast(state.favorites.size ? "Showing your saved favorites" : "No favorites saved yet");
  });
  $("#search-focus").addEventListener("click", () => {
    if (currentView().view !== "store") navigate("products");
    $("#products").scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => searchInput.focus(), 300);
  });
  $("#cart-open").addEventListener("click", openCart);
  document.querySelectorAll("[data-close-overlay]").forEach((b) => b.addEventListener("click", () => closeOverlays()));
  overlay.addEventListener("click", () => closeOverlays());
  $("#drawer-content").addEventListener("click", (event) => {
    const qty = event.target.closest("[data-qty]");
    if (qty) { changeQuantity(qty.dataset.qty, Number(qty.dataset.change)); return; }
    const remove = event.target.closest("[data-remove]");
    if (remove) {
      const item = state.cart.get(remove.dataset.remove);
      state.cart.delete(remove.dataset.remove);
      persistCart();
      updateCart();
      if (item) showToast(`${item.product.name} removed from cart`);
      return;
    }
    if (event.target.closest("[data-explore]")) {
      closeOverlays(false);
      if (currentView().view !== "store") navigate("products");
      $("#products").scrollIntoView({ behavior: "smooth" });
    }
  });
  $("#drawer-footer").addEventListener("click", (event) => {
    if (event.target.closest("[data-checkout]")) openCheckout();
  });
  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-logout]")) {
      $("#mobile-nav").classList.remove("open");
      $("#mobile-menu-toggle").setAttribute("aria-expanded", "false");
      logout();
      return;
    }
    const copy = event.target.closest("[data-copy-gift]");
    if (copy) { copyGift(copy.dataset.copyGift, copy); return; }
    if (event.target.closest("[data-orders-retry]")) loadOrders();
  });
  $("#success-copy-gift").addEventListener("click", (e) => { if (state.orderGiftToken) copyGift(state.orderGiftToken, e.currentTarget); });
  $("#auth-form").addEventListener("submit", submitAuth);
  $("#auth-form").addEventListener("input", (event) => {
    const f = event.target;
    if (!(f instanceof HTMLElement) || !f.id) return;
    f.removeAttribute("aria-invalid");
    const e = document.querySelector(`#${f.id}-error`);
    if (e) e.textContent = "";
  });

  discountTab.addEventListener("click", () => setDiscountModalOpen(discountModalLayer.hidden));
  $("#discount-dismiss").addEventListener("click", () => { discountWidget.hidden = true; $("#cart-open").focus(); });
  $("#discount-close").addEventListener("click", () => setDiscountModalOpen(false, true));
  discountModalLayer.addEventListener("click", (event) => { if (event.target === discountModalLayer) setDiscountModalOpen(false, true); });
  copyDiscountCodeButton.addEventListener("click", copyDiscountCode);
  discountForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const emailError = $("#discount-email-error");
    emailError.textContent = "";
    discountEmail.removeAttribute("aria-invalid");
    if (!discountEmail.value.trim() || !discountEmail.validity.valid) {
      emailError.textContent = "Enter a valid email address to claim your discount.";
      discountEmail.setAttribute("aria-invalid", "true");
      discountEmail.focus();
      announce("Enter a valid email address to claim your discount.");
      return;
    }
    // Demo only: do not retain or transmit the email address.
    state.discountApplied = true;
    discountForm.reset();
    updateDiscountPanel();
    $("#discount-copy-feedback").textContent = "";
    copyDiscountCodeButton.focus();
    updateHeader();
    renderCart();
    if (currentView().view === "checkout") updateCheckoutTotals();
    announce("Your discount code is ready to copy. WASL10 is active for this cart.");
  });
  discountForm.addEventListener("input", () => {
    $("#discount-email-error").textContent = "";
    discountEmail.removeAttribute("aria-invalid");
  });

  checkoutForm.addEventListener("submit", submitOrder);
  checkoutForm.addEventListener("input", (event) => {
    const field = event.target;
    if (field === giftToggle || field.id === "checkout-gift-message") syncGiftFields();
    if (!(field instanceof HTMLElement) || !field.id) return;
    checkoutSubmitError.hidden = true;
    const error = document.querySelector(`#${field.id}-error`);
    if (error) error.textContent = "";
    field.removeAttribute("aria-invalid");
  });
  giftToggle.addEventListener("change", () => {
    syncGiftFields();
    if (giftToggle.checked) window.setTimeout(() => $("#checkout-gift-to").focus(), 0);
  });

  window.addEventListener("hashchange", setPageFromHash);
  window.addEventListener("popstate", setPageFromHash);
  window.addEventListener("storage", (event) => {
    if (event.key === TOKEN_KEY && !event.newValue && state.token) handleExpiredSession();
  });

  $("#quick-content").addEventListener("click", (event) => {
    const add = event.target.closest("[data-quick-add]");
    if (add) { addToCart(add.dataset.quickAdd); closeOverlays(false); return; }
    const thumb = event.target.closest(".quick-thumb");
    if (thumb) quickModal.querySelectorAll(".quick-thumb").forEach((item) => item.classList.toggle("active", item === thumb));
  });
  $("#mobile-menu-toggle").addEventListener("click", (event) => {
    const button = event.currentTarget;
    const menu = $("#mobile-nav");
    const open = menu.classList.toggle("open");
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute("aria-label", open ? "Close navigation" : "Toggle navigation");
  });
  $("#mobile-nav").addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      $("#mobile-nav").classList.remove("open");
      $("#mobile-menu-toggle").setAttribute("aria-expanded", "false");
    }
  });
  // Section links should return to the store from other views.
  document.querySelectorAll('.desktop-nav a, #mobile-nav > a, .site-footer a[href^="#"], .brand').forEach((link) => {
    link.addEventListener("click", () => {
      if (currentView().view !== "store") {
        const target = link.getAttribute("href");
        window.setTimeout(() => { const el = target && target.length > 1 ? document.querySelector(target) : null; if (el) el.scrollIntoView(); }, 30);
      }
    });
  });
  document.querySelectorAll("[data-footer-category]").forEach((link) => {
    link.addEventListener("click", () => {
      state.favoritesOnly = false;
      searchInput.value = "";
      state.search = "";
      setCategory(link.dataset.footerCategory);
      updateHeader();
    });
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (cartDrawer.classList.contains("open") || quickModal.classList.contains("open")) closeOverlays();
      if (!discountModalLayer.hidden) setDiscountModalOpen(false, true);
      const menu = $("#mobile-nav");
      if (menu.classList.contains("open")) {
        menu.classList.remove("open");
        $("#mobile-menu-toggle").setAttribute("aria-expanded", "false");
      }
    }
    if (event.key === "Tab" && quickModal.classList.contains("open")) trapFocus(event, quickModal);
    if (event.key === "Tab" && cartDrawer.classList.contains("open")) trapFocus(event, cartDrawer);
    if (event.key === "Tab" && !discountModalLayer.hidden) trapFocus(event, discountPanel);
  });
  function trapFocus(event, container) {
    const focusable = [...container.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), [tabindex="0"]')].filter((el) => el.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  // Remote imagery is progressive enhancement; keep the card intact if an image is unavailable.
  document.addEventListener("error", (event) => {
    const image = event.target;
    if (!(image instanceof HTMLImageElement)) return;
    image.removeAttribute("src");
    image.alt = "";
    image.classList.add("image-unavailable");
  }, true);
  if (video) video.addEventListener("error", () => { $("#commercial-error").hidden = false; });

  renderAccountNav();
  updateDiscountPanel();
  updateCart();
  setPageFromHash();
  loadProducts();
  verifySession();
}
