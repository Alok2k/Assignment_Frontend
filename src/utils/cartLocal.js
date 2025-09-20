// src/utils/cartLocal.js
const CART_KEY_PREFIX = "cart_local_";
const ANON_KEY = `${CART_KEY_PREFIX}anon`;

function safeParse(raw) {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn("cartLocal: JSON parse failed", e);
    return null;
  }
}

function getCurrentUserId() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return "anon";
    const u = JSON.parse(raw);
    return u?.id ?? u?.userId ?? u?._id ?? "anon";
  } catch (e) {
    return "anon";
  }
}

function getKeyForUser(userId) {
  return `${CART_KEY_PREFIX}${userId || getCurrentUserId() || "anon"}`;
}

function emitUpdate(detail = {}) {
  try {
    window.dispatchEvent(new CustomEvent("cartUpdated", { detail }));
  } catch (e) {
    try {
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (_e) {}
  }
}

/** Read cart array for the current user */
export function getLocalCart() {
  try {
    const key = getKeyForUser();
    const raw = localStorage.getItem(key);
    const parsed = safeParse(raw);
    if (!parsed) return [];
    if (Array.isArray(parsed)) return parsed;
    // If saved as map, convert to array:
    if (parsed && typeof parsed === "object") {
      return Object.keys(parsed).map(k => parsed[k]);
    }
    return [];
  } catch (e) {
    console.error("getLocalCart error", e);
    return [];
  }
}

/** Return map { [productId]: item } for quicker lookups */
export function getLocalCartMap() {
  const arr = getLocalCart();
  const map = {};
  for (const it of arr) {
    if (it && it.productId) map[String(it.productId)] = it;
  }
  return map;
}

/** Write cart array for the current user */
export function setLocalCartArray(arr = []) {
  try {
    const key = getKeyForUser();
    const safe = Array.isArray(arr) ? arr : [];
    localStorage.setItem(key, JSON.stringify(safe));
    emitUpdate({ at: Date.now(), cart: safe, userId: getCurrentUserId() });
  } catch (e) {
    console.error("setLocalCartArray error", e);
  }
}

/** Merge two arrays by productId (sum qty) */
function mergeArrays(a = [], b = []) {
  const map = {};
  [...a, ...b].forEach(it => {
    if (!it || !it.productId) return;
    const id = String(it.productId);
    if (!map[id]) map[id] = { ...it, qty: Number(it.qty || 0) };
    else map[id].qty = Number(map[id].qty || 0) + Number(it.qty || 0);
  });
  return Object.keys(map).map(k => ({ ...map[k] }));
}

/** Add / change quantity (product may be object or id): returns updated array */
export function addToLocalCart(product, qty = 1) {
  try {
    const cart = getLocalCart(); // array
    const isString = typeof product === "string" || typeof product === "number";
    const productId = isString ? String(product) : String(product?.id ?? product?._id ?? product?.productId ?? "");
    if (!productId) {
      console.warn("addToLocalCart: missing product id");
      return cart;
    }

    const name = isString ? "" : (product.name || product.title || product.display_name || "");
    const price = isString ? 0 : (typeof product.price !== 'undefined' ? product.price : (product.mrp ?? 0));
    const image = isString ? "" : (product.image || product.images?.front || product.imageUrl || "");

    const idx = cart.findIndex(it => String(it.productId) === productId);
    if (idx >= 0) {
      const newQty = Math.max(0, Number(cart[idx].qty || 0) + Number(qty || 0));
      if (newQty === 0) cart.splice(idx, 1);
      else cart[idx] = {
        ...cart[idx],
        qty: newQty,
        name: name || cart[idx].name,
        price: Number(price || cart[idx].price || 0),
        image: image || cart[idx].image
      };
    } else {
      const initialQty = Math.max(0, Number(qty || 0));
      if (initialQty > 0) {
        cart.push({ productId, name, price: Number(price || 0), image, qty: initialQty });
      }
    }

    setLocalCartArray(cart);
    return cart;
  } catch (e) {
    console.error("addToLocalCart error", e);
    return getLocalCart();
  }
}

/** Decrease quantity (calls addToLocalCart with negative delta) */
export function decreaseFromLocalCart(productId, qty = 1) {
  return addToLocalCart(String(productId), -Math.abs(Number(qty || 1)));
}

/** Remove item completely */
export function removeFromLocalCart(productId) {
  try {
    const id = String(productId);
    const arr = getLocalCart().filter(it => String(it.productId) !== id);
    setLocalCartArray(arr);
    return arr;
  } catch (e) {
    console.error("removeFromLocalCart error", e);
    return getLocalCart();
  }
}

/** Clear current user's cart */
export function clearLocalCart() {
  try {
    setLocalCartArray([]);
  } catch (e) {
    console.error("clearLocalCart error", e);
  }
}

/** Migrate anonymous cart -> user cart (on login). Merges quantities. */
export function migrateAnonCartToUser(userId) {
  try {
    const anonRaw = safeParse(localStorage.getItem(ANON_KEY)) || [];
    const userKey = getKeyForUser(userId);
    const userRaw = safeParse(localStorage.getItem(userKey)) || [];
    const merged = mergeArrays(userRaw, anonRaw);
    localStorage.setItem(userKey, JSON.stringify(merged));
    // cleanup anon cart
    localStorage.removeItem(ANON_KEY);
    // emit update for the new user key
    emitUpdate({ at: Date.now(), cart: merged, userId });
    return merged;
  } catch (e) {
    console.error("migrateAnonCartToUser error", e);
    return getLocalCart();
  }
}

/** Helpers: totals */
export function getLocalCartCount() {
  return getLocalCart().reduce((s, it) => s + (Number(it.qty || 0)), 0);
}
export function getLocalCartTotal() {
  return getLocalCart().reduce((s, it) => s + (Number(it.price || 0) * Number(it.qty || 0)), 0);
}
