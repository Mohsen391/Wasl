/* Wasl storefront: a self-contained demo catalog and cart, with no network/API calls. */
const products = [
  {
    id: 1, name: "65W GaN Fast Charger", category: "Charging", price: 6500, tag: "Best seller",
    description: "A compact, three-port power hub with smart power sharing and a cool-running GaN core.",
    features: ["65W GaN III fast charging", "Two USB-C ports and one USB-A", "Thermal guard tested at 50°C"],
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBakQSy4UVz8zZCMlZ8MqwQkFYeQdPGy_m83ZvLbRcUdAHRcYu7mdAt7T_XdZxfDUR8Lkk-4fE5G_GbY551RMaoCAuEdvuKmGyLq38gGOSBK-TNRqzonwjImTZwu8pUVbNUcnnYiDXqma_6X2BkMSWZcaGTbS_x6El0lagwXWyGURhdD43gmQ-R7QptedM-vi3oHuP5TmlVdWfUB98iE3jM84yJ8_uGyIJopeAQcR9EOB3K-M36_HLE"
  },
  {
    id: 2, name: "Braided USB-C Cable 1m", category: "Cables", price: 2500,
    description: "A tough, flexible daily cable wrapped in a heat-resistant braided jacket.",
    features: ["Reinforced braided outer jacket", "USB-C to USB-C connection", "Built for everyday bending and travel"],
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBeZt94wPz-j19kZ6rigVmAbWrm8lrq1iwlGF8OU-pHZvnWnUysje33OlFKvlsVfLTeVu66N0birjAAd4plJANwLOtHgMTqlAo4-YCdYaTKeZMLlv2JOtYskKbcjiW-Fs1JsnVK6SA9I63wdQtfY8RQ2UrzFXbr5aee54AeWL8ZtVCofSzAjOKZi7hRakIVUB6wjGNgYzC0eFHOkgLdM_xLV9ntM68z4gyABC1OLKV1h_oqabbEp8I8"
  },
  {
    id: 3, name: "Wireless Charging Pad", category: "Charging", price: 7900,
    description: "A low-profile wireless charging surface with a soft-touch, non-slip finish.",
    features: ["Qi wireless charging", "Non-slip soft-touch surface", "Low-profile desk-friendly design"],
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB-E3RDcTvevzU3T3qXa8rKDqoPRvPVN6MkyMPQakQ6mMi1UNHVKAHnjtCaQ65vIcXi6ZMFZ-gh9BqHimKnJMZxjOIZWI-i4Cs327JMKyxmgPLsNA4uaXbzwN5Vflj9v6bZoR3IiK2mJIa-cKkWIOPwJuijQjzUq71pt0544LlAXOqGvZQ5IoiCvmAqzUD3mEB7A9atET1HlWWijXutWXDeyCzGbX8OmXbqkmmjpPCFlotSymcmzqup"
  },
  {
    id: 4, name: "20,000mAh Power Bank", category: "Charging", price: 12500, tag: "New",
    description: "High-capacity backup power with enough headroom for a full day away from the socket.",
    features: ["20,000mAh everyday capacity", "Fast USB-C charging and recharge", "Durable shell for travel and commutes"],
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC3oanWJHlIvcWBZWYjKyighT2Thm6nBKmG2T4lvmH8bXWgw67-GB0hZLzgwWiAEgwelcuby8Sl1LFzQF0M-fmoswWjswFE2RV8VPIcpcpewh0JwFUg61kMbC0ntPfFGmW3TZupaz95nrwXPbY4Fbj0wSI_WqiM2Uc0tsDw82kStOTq9x2q_WUD19IPkTlVwS0kT_iaVZkeLFW2M3_MopcLl-NLdX6wxDVCpfybDLEHxlJeNnfqhYuB"
  },
  {
    id: 5, name: "Wireless Earbuds", category: "Audio", price: 14900,
    description: "Pocket-sized wireless audio with a secure fit and a charging case made for daily use.",
    features: ["Clear wireless audio", "Compact pocket charging case", "Comfort-fit tips for daily wear"],
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCqJfVD6hjHBy0hLWIAyiZGHtaWtwg4qzFHs9NfI5a8u-RX9NwthXfXuslAeREGXlgBZKld_YVcp__1QKR7MYw9lR_QOVpyzymXMre4bb0WvsFRvKUVJg0mK3CT8OpplUDuuFpMXGkVE_EUJYCZqoZeK6lWe__SXX9VKtZtINd7GBrLkpOZEGIIVtvL_z7n-b8OvqP8TBBWDwH9UitqDhkYvWEh4v3Ro0wzXhl8xVl7FpAuQc_K2f1M"
  },
  {
    id: 6, name: "Shockproof Phone Case", category: "Protection", price: 3500,
    description: "A dependable everyday case with protective corners and a comfortable grip.",
    features: ["Shock-absorbing reinforced corners", "Raised camera and screen edges", "Lightweight, grippy finish"],
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDnQD2TKlTR5Y8_ZI8753a8J8w--RO3bC4AhvsDInxSWCCThUeaMuxbwY0kNUl_-d7YSFVFPvM3AfIsw5WTVlwKHEJcJGhJLpjzmhsaLNJiuDA4kCETmzGcADm2HY1jXPpEQbnmKtUhRJDUeJjzZ-wMAtSqApfDCI8TDzQGrZaWXfbDGWbEfaX8o1iyKG2-py6gCM0Qyd1ukZd1fRCSwGlkX-SKhbn7RhcT8E0mkBDiuRyr7ZQSM1pL"
  },
  {
    id: 7, name: "Foldable Laptop Stand", category: "Desk", price: 9900,
    description: "A sturdy, fold-flat stand that brings your screen up and your workspace into line.",
    features: ["Folds flat for easy storage", "Stable non-slip support", "Raises screen for a more comfortable setup"],
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAnpBBM2iFGBEFjoBY6Ffq2bH5p_qs_BzAOVHkL6LQotAC_8k4x3DpDjQamoriehjQOoJp3fXrxXhXnNAtiCqYIYa0BiVZy6NiAhnulI-1jQdkEr4Tuu46ki3y29kBh8gk84hbsnAUxQ-CTeY80Bam_BbFt6HBJkfAeGRkdtjb8PyH0Beh4CTGzJqBPrtbJuXHv1btc0C6g9SWb-buREZVyuZpuZYNAwVQz1gwXYI2RdH779TvSOLEF"
  },
  {
    id: 8, name: "Car Phone Mount", category: "Car", price: 4500,
    description: "Keep navigation in view with a secure mount ready for Kuwait's hot commutes.",
    features: ["Secure, easy-adjust phone grip", "Heat-ready materials for cabin use", "Quick-view angle for navigation"],
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCqTIl8heV3PfYBIyrhORl2H4E8Yd-Vj7kOj0szRiGIqbJpeGxvGO7hh5L6C_x6WR69RbHhXaPIyvhM7fKV1aXaoZPOqvrgjo_1sIOTmmqpUcsXWF25W_jr2EAmcal4DuYRyRhr5n-V7zV8YXxI7pk-w1aki81iwinAZKP8LoyIg7tn2om7HxK4njzVlBBxbzS2lkDWRfUrw3nFpxrVcNkuhRxrZQGzMui7kNiL4dxNW-fWrBtF6yLY"
  }
];

const formatPrice = (mils) => `KWD ${(mils / 1000).toFixed(3)}`;
const productById = (id) => products.find((product) => product.id === Number(id));
const icon = {
  bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  minus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>',
  heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.7c0 5.1-8.8 11-8.8 11s-8.8-5.9-8.8-11a4.7 4.7 0 0 1 8.8-2.2 4.7 4.7 0 0 1 8.8 2.2Z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6m4-6v6M5.5 7l1 13h11l1-13M9 7V4h6v3"/></svg>',
  delivery: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h11v11H3zM14 11h4l3 3v4h-7z"/><circle cx="7.5" cy="19" r="1.8"/><circle cx="17.5" cy="19" r="1.8"/></svg>'
};

const state = {
  category: "all",
  search: "",
  favoritesOnly: false,
  favorites: new Set(),
  cart: new Map(),
  quickProduct: null,
  lastFocus: null,
  orderReceived: false
};

const grid = document.querySelector("#product-grid");
const searchInput = document.querySelector("#product-search");
const clearSearch = document.querySelector("#clear-search");
const noResults = document.querySelector("#no-results");
const resultsSummary = document.querySelector("#results-summary");
const cartDrawer = document.querySelector("#cart-drawer");
const quickModal = document.querySelector("#quick-modal");
const overlay = document.querySelector("#overlay");
const toast = document.querySelector("#toast");
const announcement = document.querySelector("#announcement");
const storeView = document.querySelector("#store-view");
const checkoutView = document.querySelector("#checkout-view");
const checkoutForm = document.querySelector("#checkout-form");
const checkoutLayout = document.querySelector("#checkout-content");
const checkoutEmpty = document.querySelector("#checkout-empty");
const checkoutSuccess = document.querySelector("#checkout-success");
let toastTimer;

function renderProducts() {
  const visible = products.filter((product) => {
    const text = `${product.name} ${product.category} ${product.description} ${product.features.join(" ")}`.toLowerCase();
    return (state.category === "all" || product.category === state.category)
      && text.includes(state.search.trim().toLowerCase())
      && (!state.favoritesOnly || state.favorites.has(product.id));
  });

  grid.innerHTML = visible.map((product) => `
    <article class="product-card" data-product-id="${product.id}">
      <div class="product-art">
        ${product.tag ? `<span class="product-tag ${product.tag === "New" ? "new" : ""}">${product.tag}</span>` : ""}
        <button class="favorite-button" type="button" aria-label="${state.favorites.has(product.id) ? "Remove from" : "Add to"} favorites: ${product.name}" aria-pressed="${state.favorites.has(product.id)}" data-favorite="${product.id}">${icon.heart}</button>
        <button class="image-quick" type="button" aria-label="Quick view ${product.name}" data-quick="${product.id}">
          <img src="${product.image}" alt="${product.name}" loading="lazy" data-product-image="${product.id}">
          <span class="quick-hint">Quick view</span>
        </button>
      </div>
      <div class="product-detail">
        <span class="product-meta">${product.category} · Kuwait ready</span>
        <h3>${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="product-footer">
          <div class="price-stack"><span class="price-caption">Kuwait price</span><span class="price"><small>KWD</small> ${(product.price / 1000).toFixed(3)}</span></div>
          <button class="add-button" type="button" data-add="${product.id}" aria-label="Add ${product.name} to cart">${icon.bag}<span>Add</span></button>
        </div>
      </div>
    </article>`).join("");
  grid.hidden = visible.length === 0;
  noResults.hidden = visible.length !== 0;
  clearSearch.hidden = !state.search;
  const context = state.favoritesOnly ? "favorites" : state.category === "all" ? "essentials" : state.category.toLowerCase() + " picks";
  resultsSummary.textContent = visible.length ? `${visible.length === products.length ? "Eight" : visible.length} ${visible.length === 1 ? "product" : "products"} · ${context}, ready to ship from Kuwait.` : "No matches in this selection.";
}

function updateHeader() {
  const quantity = [...state.cart.values()].reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = [...state.cart.values()].reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  document.querySelector("#cart-count").textContent = quantity;
  document.querySelector("#header-total").textContent = formatPrice(subtotal);
  document.querySelector("#favorite-count").textContent = state.favorites.size;
  const favoriteToggle = document.querySelector("#favorites-toggle");
  favoriteToggle.setAttribute("aria-pressed", String(state.favoritesOnly));
  favoriteToggle.setAttribute("aria-label", state.favoritesOnly ? "Show all products" : "Show favorites");
  favoriteToggle.classList.toggle("is-active", state.favoritesOnly);
}

function renderCart() {
  const items = [...state.cart.values()];
  const quantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const achieved = subtotal >= 10000;
  const remaining = Math.max(0, 10000 - subtotal);
  document.querySelector("#drawer-count").textContent = `(${quantity} ${quantity === 1 ? "item" : "items"})`;
  const content = document.querySelector("#drawer-content");
  const footer = document.querySelector("#drawer-footer");

  if (!items.length) {
    content.innerHTML = `<div class="empty-cart">
      <div class="empty-cart-art"><svg viewBox="0 0 24 24"><path d="M12 22v-5M9 8V2m6 6V2m3 6v5a6 6 0 0 1-12 0V8z"/></svg><span>0</span></div>
      <h3>Your cart is empty</h3><p>Let's find your essentials. Orders placed before 4 PM arrive today across Kuwait.</p>
      <button class="button button-primary" type="button" data-explore>Explore best sellers →</button></div>`;
    footer.innerHTML = "";
    return;
  }

  content.innerHTML = `<section class="delivery-progress" aria-label="Free delivery progress">
      <div class="progress-heading"><span>${icon.delivery} Kuwait same-day delivery</span><span>${achieved ? "FREE DELIVERY UNLOCKED" : `${Math.max(0, 100 - Math.round(subtotal / 100))}% TO GO`}</span></div>
      <p class="progress-copy">${achieved ? "Your order qualifies for free delivery across all 6 Governorates." : `Add <strong>${formatPrice(remaining)}</strong> more for free delivery across all 6 Governorates.`}</p>
      <div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, subtotal / 100)}%"></div></div>
      <div class="progress-caption"><span>KWD 0.000</span><strong>Threshold: KWD 10.000</strong></div>
    </section>
    <div class="cart-list">${items.map(({ product, quantity: count }) => `
      <article class="cart-row">
        <div class="cart-thumb"><img src="${product.image}" alt="" loading="lazy"></div>
        <div class="cart-row-main"><div class="cart-row-heading"><h3>${product.name}</h3><button class="remove-item" type="button" data-remove="${product.id}" aria-label="Remove ${product.name}">${icon.trash}</button></div>
          <div class="cart-row-bottom"><div class="qty-control" aria-label="Quantity">
            <button type="button" data-qty="${product.id}" data-change="-1" aria-label="Decrease quantity of ${product.name}">${icon.minus}</button><span class="qty-value">${count}</span><button type="button" data-qty="${product.id}" data-change="1" aria-label="Increase quantity of ${product.name}">${icon.plus}</button>
          </div><span class="row-price">${formatPrice(product.price * count)}</span></div>
        </div>
      </article>`).join("")}</div>`;
  footer.innerHTML = `<div class="summary-row summary-total"><span>Cart total</span><strong>${formatPrice(subtotal)}</strong></div>
    <button class="checkout-button" type="button" data-checkout><span>${icon.bag} Proceed to checkout</span><strong>${formatPrice(subtotal)}</strong></button>
    <p class="payment-note">Demo checkout · No payment will be taken</p>`;
}

function updateCart() {
  updateHeader();
  renderCart();
  if (location.hash === "#checkout") renderCheckout();
}

function renderCheckout() {
  const items = [...state.cart.values()];
  const quantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  document.querySelector("#checkout-item-count").textContent = `${quantity} ${quantity === 1 ? "item" : "items"}`;
  document.querySelector("#checkout-items").innerHTML = items.map(({ product, quantity: count }) => `
    <article class="checkout-item">
      <div class="checkout-item-image">${product.image ? `<img src="${product.image}" alt="" loading="lazy">` : ""}</div>
      <div class="checkout-item-info"><strong>${product.name}</strong><small>Qty ${count} · ${formatPrice(product.price)} each</small></div>
      <span class="checkout-item-price">${formatPrice(product.price * count)}</span>
    </article>`).join("");
  document.querySelector("#checkout-subtotal").textContent = formatPrice(subtotal);
  document.querySelector("#checkout-total").textContent = formatPrice(subtotal);

  const showingSuccess = state.orderReceived;
  const showingEmpty = !items.length && !showingSuccess;
  checkoutSuccess.hidden = !showingSuccess;
  checkoutEmpty.hidden = !showingEmpty;
  checkoutLayout.hidden = showingSuccess || showingEmpty;
  checkoutForm.reset();
  clearCheckoutErrors();
}

function setPageFromHash() {
  const checkout = location.hash === "#checkout";
  storeView.hidden = checkout;
  checkoutView.hidden = !checkout;
  document.querySelector("#contact").hidden = checkout;
  document.title = checkout ? "Checkout — Wasl Kuwait" : "Wasl — Tech that keeps up";
  if (checkout) renderCheckout();
}

function openCheckout() {
  if (!state.cart.size) return;
  state.orderReceived = false;
  closeOverlays(false);
  if (location.hash === "#checkout") {
    setPageFromHash();
  } else {
    history.pushState(null, "", `${location.pathname}${location.search}#checkout`);
    setPageFromHash();
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
  window.setTimeout(() => document.querySelector("#checkout-title").focus(), 0);
}

function clearCheckoutErrors() {
  checkoutForm.querySelectorAll(".field-error").forEach((error) => { error.textContent = ""; });
  checkoutForm.querySelectorAll("[aria-invalid='true']").forEach((field) => field.removeAttribute("aria-invalid"));
}

function checkoutError(field, message) {
  const error = document.querySelector(`#${field.id}-error`);
  field.setAttribute("aria-invalid", "true");
  if (error) error.textContent = message;
}

function addToCart(id, button) {
  const product = productById(id);
  if (!product) return;
  const existing = state.cart.get(product.id);
  state.cart.set(product.id, { product, quantity: existing ? existing.quantity + 1 : 1 });
  updateCart();
  announce(`${product.name} added to cart. Cart has ${[...state.cart.values()].reduce((sum, item) => sum + item.quantity, 0)} items.`);
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
  state.quickProduct = product;
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  document.querySelector("#quick-content").innerHTML = `
    <div class="quick-layout">
      <div class="quick-gallery">
        <div class="quick-gallery-top"><span class="quick-cert"><i class="status-dot"></i> &nbsp;Tested for Kuwait conditions</span><span class="quick-code">WASL / KW</span></div>
        <div class="quick-image-wrap"><img src="${product.image}" alt="${product.name}"><div class="quick-image-note">KUWAIT READY<strong>Built for everyday use</strong></div></div>
        <div class="quick-thumbnails"><button class="quick-thumb active" type="button" aria-label="Product view one"><img src="${product.image}" alt=""></button><button class="quick-thumb" type="button" aria-label="Product view two"><img src="${product.image}" alt=""></button><button class="quick-thumb" type="button" aria-label="Product view three"><img src="${product.image}" alt=""></button></div>
      </div>
      <div class="quick-details">
        <div><div class="quick-status-row">${product.tag ? `<span class="quick-tag">${product.tag}</span>` : ""}<span class="quick-stock">✓ In stock in Kuwait</span></div>
          <h2 id="quick-title">${product.name}</h2><p class="quick-description">${product.description}</p></div>
        <div class="quick-price-block"><div><strong class="quick-price"><small>KWD</small> ${(product.price / 1000).toFixed(3)}</strong><span class="vat-note">Kuwait price · VAT inclusive</span></div><span class="quick-stock">Ready to dispatch</span></div>
        <ul class="quick-features">${product.features.map((feature) => `<li><span class="feature-check">✓</span><span>${feature}</span></li>`).join("")}</ul>
        <div class="quick-action"><button class="quick-add" type="button" data-quick-add="${product.id}">Add to cart — ${formatPrice(product.price)}</button><div class="quick-local-note">${icon.delivery} Order before 4 PM for same-day Kuwait delivery across all 6 governorates.</div></div>
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

function setCategory(category) {
  state.category = category;
  document.querySelectorAll(".category-chip").forEach((chip) => {
    const active = chip.dataset.category === category;
    chip.classList.toggle("active", active);
    chip.setAttribute("aria-pressed", String(active));
  });
  renderProducts();
}

grid.addEventListener("click", (event) => {
  const favorite = event.target.closest("[data-favorite]");
  if (favorite) { event.stopPropagation(); toggleFavorite(favorite.dataset.favorite); return; }
  const add = event.target.closest("[data-add]");
  if (add) { addToCart(add.dataset.add, add); return; }
  const quick = event.target.closest("[data-quick]");
  if (quick) openQuickView(quick.dataset.quick);
});
document.querySelector("#category-chips").addEventListener("click", (event) => {
  const chip = event.target.closest("[data-category]");
  if (chip) setCategory(chip.dataset.category);
});
searchInput.addEventListener("input", () => {
  state.search = searchInput.value;
  renderProducts();
});
clearSearch.addEventListener("click", () => {
  searchInput.value = "";
  state.search = "";
  renderProducts();
  searchInput.focus();
});
document.querySelector("#reset-filters").addEventListener("click", () => {
  state.favoritesOnly = false;
  searchInput.value = "";
  state.search = "";
  setCategory("all");
  updateHeader();
});
document.querySelector("#favorites-toggle").addEventListener("click", () => {
  state.favoritesOnly = !state.favoritesOnly;
  if (state.favoritesOnly) {
    state.category = "all";
    document.querySelectorAll(".category-chip").forEach((chip) => {
      chip.classList.toggle("active", chip.dataset.category === "all");
      chip.setAttribute("aria-pressed", String(chip.dataset.category === "all"));
    });
  }
  updateHeader();
  renderProducts();
  document.querySelector("#products").scrollIntoView({ behavior: "smooth", block: "start" });
  if (state.favoritesOnly) showToast(state.favorites.size ? "Showing your saved favorites" : "No favorites saved yet");
});
document.querySelector("#search-focus").addEventListener("click", () => {
  document.querySelector("#products").scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => searchInput.focus(), 300);
});
document.querySelector("#cart-open").addEventListener("click", openCart);
document.querySelectorAll("[data-close-overlay]").forEach((button) => button.addEventListener("click", () => closeOverlays()));
overlay.addEventListener("click", () => closeOverlays());
document.querySelector("#drawer-content").addEventListener("click", (event) => {
  const quantityButton = event.target.closest("[data-qty]");
  if (quantityButton) {
    const id = Number(quantityButton.dataset.qty);
    const item = state.cart.get(id);
    if (!item) return;
    const next = item.quantity + Number(quantityButton.dataset.change);
    if (next <= 0) state.cart.delete(id);
    else state.cart.set(id, { ...item, quantity: next });
    updateCart();
    return;
  }
  const remove = event.target.closest("[data-remove]");
  if (remove) {
    const item = state.cart.get(Number(remove.dataset.remove));
    state.cart.delete(Number(remove.dataset.remove));
    updateCart();
    if (item) showToast(`${item.product.name} removed from cart`);
    return;
  }
  if (event.target.closest("[data-explore]")) {
    closeOverlays(false);
    document.querySelector("#products").scrollIntoView({ behavior: "smooth" });
  }
});
document.querySelector("#drawer-footer").addEventListener("click", (event) => {
  if (!event.target.closest("[data-checkout]")) return;
  openCheckout();
});
checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();
  clearCheckoutErrors();
  if (!state.cart.size) {
    renderCheckout();
    return;
  }
  const fields = [...checkoutForm.querySelectorAll("[required]")];
  let firstInvalid = null;
  fields.forEach((field) => {
    let message = "";
    if (!field.value.trim()) message = "This field is required.";
    else if (field.id === "checkout-phone" && !/^[569][0-9]{7}$/.test(field.value.trim())) {
      message = "Enter a valid 8-digit Kuwait mobile number.";
    } else if (field.type === "email" && !field.validity.valid) {
      message = "Enter a valid email address.";
    }
    if (message) {
      checkoutError(field, message);
      if (!firstInvalid) firstInvalid = field;
    }
  });
  const email = document.querySelector("#checkout-email");
  if (email.value.trim() && !email.validity.valid) {
    checkoutError(email, "Enter a valid email address.");
    if (!firstInvalid) firstInvalid = email;
  }
  if (firstInvalid) {
    firstInvalid.focus();
    announce("Please check the highlighted delivery details.");
    return;
  }

  // Demo only: never persist or transmit entered personal details.
  checkoutForm.reset();
  state.cart.clear();
  state.orderReceived = true;
  updateCart();
  checkoutSuccess.focus();
  announce("Order received. No payment was taken and your details were not saved.");
});
checkoutForm.addEventListener("input", (event) => {
  const field = event.target;
  if (!(field instanceof HTMLElement) || !field.id) return;
  const error = document.querySelector(`#${field.id}-error`);
  if (error) error.textContent = "";
  field.removeAttribute("aria-invalid");
});
window.addEventListener("hashchange", setPageFromHash);
window.addEventListener("popstate", setPageFromHash);
document.querySelector("#quick-content").addEventListener("click", (event) => {
  const add = event.target.closest("[data-quick-add]");
  if (add) {
    addToCart(add.dataset.quickAdd);
    closeOverlays(false);
    return;
  }
  const thumb = event.target.closest(".quick-thumb");
  if (thumb) {
    quickModal.querySelectorAll(".quick-thumb").forEach((item) => item.classList.toggle("active", item === thumb));
  }
});
document.querySelector("#mobile-menu-toggle").addEventListener("click", (event) => {
  const button = event.currentTarget;
  const menu = document.querySelector("#mobile-nav");
  const open = menu.classList.toggle("open");
  button.setAttribute("aria-expanded", String(open));
  button.setAttribute("aria-label", open ? "Close navigation" : "Toggle navigation");
});
document.querySelector("#mobile-nav").addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    document.querySelector("#mobile-nav").classList.remove("open");
    document.querySelector("#mobile-menu-toggle").setAttribute("aria-expanded", "false");
  }
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
    const menu = document.querySelector("#mobile-nav");
    if (menu.classList.contains("open")) {
      menu.classList.remove("open");
      document.querySelector("#mobile-menu-toggle").setAttribute("aria-expanded", "false");
    }
  }
  if (event.key === "Tab" && quickModal.classList.contains("open")) trapFocus(event, quickModal);
  if (event.key === "Tab" && cartDrawer.classList.contains("open")) trapFocus(event, cartDrawer);
});

function trapFocus(event, container) {
  const focusable = [...container.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), [tabindex="0"]')].filter((element) => element.offsetParent !== null);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}

// Remote reference imagery is progressive enhancement; keep the card intact if an image is unavailable.
document.addEventListener("error", (event) => {
  const image = event.target;
  if (!(image instanceof HTMLImageElement)) return;
  image.removeAttribute("src");
  image.alt = "";
  image.classList.add("image-unavailable");
}, true);

renderProducts();
updateCart();
setPageFromHash();
