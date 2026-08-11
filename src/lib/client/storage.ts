// Safari Private Browsing (also some embedded/third-party-cookie-blocked
// webviews) throws a SecurityError on *any* localStorage access — not just
// when full, on the property access itself. A bare call anywhere in the
// module graph used to take the whole boot script down with it: an uncaught
// throw during a static import's module-scope evaluation fails the entire
// importing chain, not just the one line. These wrap every access so a
// blocked store degrades to an in-memory fallback for the session instead of
// killing the page. `localStorage` is read inside the try on every call —
// never hoisted — since accessing the property is itself what throws.
const memory = new Map<string, string>();

export function getItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return memory.has(key) ? memory.get(key)! : null;
  }
}

export function setItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    memory.set(key, value);
  }
}

export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    memory.delete(key);
  }
}
