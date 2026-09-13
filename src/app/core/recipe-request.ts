import { Injectable, effect, signal } from '@angular/core';

import { Unit } from '../components/unit-select/unit-select';

/** Ingredient as stored in the running recipe request. */
export interface RequestIngredient {
  id: string;
  name: string;
  amount: number;
  unit: Unit;
}

/** Cooking time preference keys. */
export type CookingTime = 'quick' | 'medium' | 'complex';
/** Cuisine preference keys. */
export type Cuisine = 'german' | 'italian' | 'indian' | 'japanese' | 'gourmet' | 'fusion';
/** Diet preference keys. */
export type Diet = 'vegetarian' | 'vegan' | 'keto' | 'no-preference';

/** Full recipe request payload — the JSON structure later sent to n8n. */
export interface RecipeRequest {
  ingredients: RequestIngredient[];
  portions: number;
  helpers: number;
  cookingTime: CookingTime | null;
  cuisine: Cuisine | null;
  diet: Diet | null;
}

const STORAGE_KEY = 'code-a-cuisine.recipe-request';
const PORTIONS_MIN = 1;
const PORTIONS_MAX = 12;
const HELPERS_MIN = 1;
const HELPERS_MAX = 3;
const AMOUNT_MAX = 9999;
const MAX_INGREDIENTS = 20;

const DEFAULT_REQUEST: RecipeRequest = {
  ingredients: [],
  portions: 2,
  helpers: 1,
  cookingTime: null,
  cuisine: null,
  diet: null,
};

/**
 * Reads a previously stored request from `sessionStorage`, falling back to
 * the defaults if there is none or it can't be parsed (e.g. a fresh tab, or
 * a stale/corrupt entry from an older build).
 */
function loadStoredRequest(): RecipeRequest {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_REQUEST;
  try {
    return { ...DEFAULT_REQUEST, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_REQUEST;
  }
}

/** Clamps a number between `min` and `max` (inclusive). */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Normalizes an ingredient name for duplicate detection: trims surrounding
 * whitespace and ignores casing, so "Pasta", " pasta " and "PASTA" match.
 */
function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Holds the in-progress recipe request (ingredients + preferences) shared
 * between the generator steps. Mirrors its state to `sessionStorage` on
 * every change, so a reload or back-navigation keeps it while a fresh tab
 * starts empty. The exported interfaces double as the JSON payload later
 * sent to the n8n webhook.
 */
@Injectable({ providedIn: 'root' })
export class RecipeRequestService {
  private readonly stored = loadStoredRequest();

  /** Ingredients, newest first. */
  readonly ingredients = signal<RequestIngredient[]>(this.stored.ingredients);
  /** Number of portions, 1–12. */
  readonly portions = signal(this.stored.portions);
  /** Number of people cooking, 1–3. */
  readonly helpers = signal(this.stored.helpers);
  /** Chosen cooking time preference, if any. */
  readonly cookingTime = signal<CookingTime | null>(this.stored.cookingTime);
  /** Chosen cuisine preference, if any. */
  readonly cuisine = signal<Cuisine | null>(this.stored.cuisine);
  /** Chosen diet preference, if any. */
  readonly diet = signal<Diet | null>(this.stored.diet);

  constructor() {
    effect(() => {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this.toRequest()));
    });
  }

  /** Current state as the plain JSON payload that will later go to n8n. */
  toRequest(): RecipeRequest {
    return {
      ingredients: this.ingredients(),
      portions: this.portions(),
      helpers: this.helpers(),
      cookingTime: this.cookingTime(),
      cuisine: this.cuisine(),
      diet: this.diet(),
    };
  }

  /**
   * Adds an ingredient. Merges into an existing row with the same
   * (case-/whitespace-insensitive) name and the same unit — amounts add up,
   * capped at 9999 — and moves the merged row to the top. A different unit
   * always becomes its own row. New rows are rejected once the list holds
   * 20 ingredients; merging into an existing row is still allowed.
   */
  addIngredient(name: string, amount: number, unit: Unit): void {
    const key = normalizeName(name);
    const current = this.ingredients();
    const existing = current.find((i) => normalizeName(i.name) === key && i.unit === unit);

    if (existing) {
      const merged: RequestIngredient = {
        ...existing,
        amount: clamp(existing.amount + amount, 1, AMOUNT_MAX),
      };
      this.ingredients.set([merged, ...current.filter((i) => i.id !== existing.id)]);
      return;
    }

    if (current.length >= MAX_INGREDIENTS) return;

    this.ingredients.set([
      { id: crypto.randomUUID(), name: name.trim(), amount, unit },
      ...current,
    ]);
  }

  /**
   * Applies an edit (amount/unit only) to the ingredient with `id`. If the
   * result collides with another row (same name and unit), the two are
   * merged (capped at 9999) and the collision target keeps its position —
   * the edited row is removed rather than the merged row jumping to the top.
   */
  updateIngredient(id: string, amount: number, unit: Unit): void {
    const current = this.ingredients();
    const editing = current.find((i) => i.id === id);
    if (!editing) return;

    const key = normalizeName(editing.name);
    const collision = current.find(
      (i) => i.id !== id && normalizeName(i.name) === key && i.unit === unit,
    );

    if (collision) {
      const merged: RequestIngredient = {
        ...collision,
        amount: clamp(collision.amount + amount, 1, AMOUNT_MAX),
      };
      this.ingredients.set(
        current.filter((i) => i.id !== id).map((i) => (i.id === collision.id ? merged : i)),
      );
      return;
    }

    this.ingredients.set(current.map((i) => (i.id === id ? { ...i, amount, unit } : i)));
  }

  /** Removes an ingredient immediately, no confirmation. */
  removeIngredient(id: string): void {
    this.ingredients.set(this.ingredients().filter((i) => i.id !== id));
  }

  /** Increments portions, staying within [1, 12]. */
  incrementPortions(): void {
    this.portions.set(clamp(this.portions() + 1, PORTIONS_MIN, PORTIONS_MAX));
  }

  /** Decrements portions, staying within [1, 12]. */
  decrementPortions(): void {
    this.portions.set(clamp(this.portions() - 1, PORTIONS_MIN, PORTIONS_MAX));
  }

  /** Increments the number of helpers, staying within [1, 3]. */
  incrementHelpers(): void {
    this.helpers.set(clamp(this.helpers() + 1, HELPERS_MIN, HELPERS_MAX));
  }

  /** Decrements the number of helpers, staying within [1, 3]. */
  decrementHelpers(): void {
    this.helpers.set(clamp(this.helpers() - 1, HELPERS_MIN, HELPERS_MAX));
  }

  /** Whether the request has everything needed to generate a recipe. */
  isComplete(): boolean {
    return (
      this.ingredients().length > 0 &&
      this.cookingTime() !== null &&
      this.cuisine() !== null &&
      this.diet() !== null
    );
  }
}
