const STORAGE_KEY = 'code-a-cuisine.liked-recipes';

/**
 * Reads the recipe ids this browser has already liked. Any storage failure
 * (disabled cookies, private mode, a full quota, a corrupt entry) is treated
 * the same as "nothing liked yet" rather than surfaced to the visitor.
 */
function readLikedIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Whether this browser has already liked the given recipe. */
export function hasLiked(id: string): boolean {
  return readLikedIds().includes(id);
}

/**
 * Marks a recipe as liked by this browser, so a reload keeps the heart
 * disabled. Only call this after the server write actually succeeded — a
 * failed like must not be remembered as done.
 */
export function markLiked(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...readLikedIds(), id]));
  } catch {
    // ponytail: storage unavailable (private mode / full) — the like still
    // succeeded server-side, only the "already liked" memory is lost, so a
    // reload in this browser could offer the heart again.
  }
}
