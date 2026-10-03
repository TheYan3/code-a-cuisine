import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Footer } from '../../components/footer/footer';
import { Header } from '../../components/header/header';
import { LikeButton } from '../../components/like-button/like-button';
import { LikePill } from '../../components/like-pill/like-pill';
import { cuisineMeta } from '../../core/cuisine-meta';
import { hasLiked, markLiked, unmarkLiked } from '../../core/liked-recipes';
import { Recipe, RecipeIngredient } from '../../core/recipe';
import { RecipeApi } from '../../core/recipe-api';

/** Chef badge image per cook, in the colors the Figma design defines. */
const CHEF_BADGES = [
  '/icons/Chef%201.svg',
  '/icons/Chef%202.svg',
  '/icons/chef%203.svg',
  '/icons/chef%204.svg',
];

/**
 * Full view of a single recipe, reached from the results page and from the
 * library. Loads the recipe by its `:id` route parameter, so the page works
 * as a shared link without any state from the generator.
 */
@Component({
  imports: [Footer, Header, RouterLink, LikeButton, LikePill],
  selector: 'app-recipe-detail',
  styleUrl: './recipe-detail.scss',
  templateUrl: './recipe-detail.html',
})
export class RecipeDetail implements OnInit {
  private readonly api = inject(RecipeApi);

  /** Firebase key of the recipe, bound from the `:id` route parameter. */
  readonly id = input<string>('');
  /**
   * Ids of the result set the visitor came from, passed along by the results
   * page. Present means "came from the generator" — that is what the back
   * link points at, ahead of `cuisine`/`page` below.
   */
  readonly ids = input<string>('');
  /**
   * Cuisine key the visitor came from, passed along by a `/library/:cuisine`
   * row. Present (and `ids` absent) means "came from a cuisine page" — the
   * back link returns to that exact cuisine.
   */
  readonly cuisine = input<string>('');
  /** Page the visitor came from within that cuisine, passed along with `cuisine`. */
  readonly page = input<string>('');

  /** The loaded recipe, `null` while loading and when the id is unknown. */
  protected readonly recipe = signal<Recipe | null>(null);
  /** True until the request settled, so the page does not flash "not found". */
  protected readonly loading = signal(true);
  /** Like count shown next to both hearts — starts at the loaded value, then tracks the pending/confirmed change. */
  protected readonly likeCount = signal(0);
  /** Whether this browser has given this recipe its heart — drives both hearts (pill and CTA). */
  protected readonly isLiked = signal(false);
  /** True while a like/unlike write is in flight; further presses are ignored until it settles. */
  private readonly likePending = signal(false);

  /** Display data for `cuisine()`, or `undefined` when it is empty or not a known key. */
  private readonly cuisineInfo = computed(() => cuisineMeta(this.cuisine()));

  /**
   * Where the back link goes: the result set if we came from it, else the
   * cuisine page we came from, else the library overview.
   */
  protected readonly backLink = computed(() => {
    if (this.ids()) return '/generator/results';
    const meta = this.cuisineInfo();
    if (meta) return `/library/${meta.key}`;
    return '/library';
  });

  /** Label of the back link, matching its target. */
  protected readonly backLabel = computed(() => {
    if (this.ids()) return 'Recipe results';
    const meta = this.cuisineInfo();
    if (meta) return meta.label;
    return 'Cookbook';
  });

  /** Query parameters the back link needs to restore the result set or the cuisine page. */
  protected readonly backParams = computed<Record<string, string>>(() => {
    const ids = this.ids();
    if (ids) return { ids };

    const meta = this.cuisineInfo();
    const page = this.page();
    const params: Record<string, string> = {};
    if (meta && page) params['page'] = page;
    return params;
  });

  /** One entry per cook, used to render the chef badges in the header. */
  protected readonly chefs = computed(() => {
    const recipe = this.recipe();
    return recipe ? Array.from({ length: recipe.helpers }, (_, i) => i + 1) : [];
  });

  /**
   * Loads the recipe. Runs in `ngOnInit`, not in the constructor: the router
   * binds route inputs with `setInput` on the already-created component, so
   * `id()` still holds its default at construction time.
   */
  ngOnInit(): void {
    this.api.byId(this.id()).subscribe({
      next: (recipe) => {
        this.recipe.set(recipe);
        this.loading.set(false);
        if (recipe) {
          this.likeCount.set(recipe.likes);
          this.isLiked.set(hasLiked(recipe.id));
        }
      },
      error: () => this.loading.set(false),
    });
  }

  /**
   * The preferences the recipe was generated for, shown as pills next to the
   * nutrition table. "No preference" is left out — it says nothing.
   */
  protected tags(): string[] {
    const recipe = this.recipe();
    if (!recipe) return [];

    const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
    const tags = [capitalize(recipe.cuisine), capitalize(recipe.timeCategory)];
    if (recipe.diet !== 'no-preference') tags.push(capitalize(recipe.diet));

    return tags;
  }

  /** Badge image for a cook; cooks beyond the four designed badges reuse the last one. */
  protected chefBadge(chef: number): string {
    return CHEF_BADGES[Math.min(chef, CHEF_BADGES.length) - 1];
  }

  /**
   * One-line summary of each cook's fixed area, e.g. "Chef 1: pasta · Chef
   * 2: sauce" (User Story 9). Empty with one cook — there is nothing to
   * divide — or when `responsibilities` is missing or the wrong length,
   * which happens for recipes generated before this field existed.
   */
  protected responsibilitySummary(recipe: Recipe): string {
    const { helpers, responsibilities } = recipe;
    if (helpers < 2 || !responsibilities || responsibilities.length !== helpers) return '';
    return responsibilities.map((task, i) => `Chef ${i + 1}: ${task}`).join(' · ');
  }

  /**
   * Fired by both hearts (`app-like-pill` in the header, `app-like-button`
   * under the steps): likes the recipe, or takes the like back when this
   * browser already gave it. Shows the new count and state immediately,
   * then persists the ±1 through `RecipeApi`. A successful write updates
   * the remembered ids in `localStorage` so a reload shows the same heart; a
   * failed write rolls count and state back, since nothing was saved.
   * Presses while a write is in flight are ignored, so each write starts
   * from a settled state.
   */
  protected toggleLike(): void {
    const recipe = this.recipe();
    if (!recipe || this.likePending()) return;

    const like = !this.isLiked();
    const delta = like ? 1 : -1;
    const previousCount = this.likeCount();
    this.likePending.set(true);
    this.likeCount.set(Math.max(0, previousCount + delta));
    this.isLiked.set(like);

    this.api.changeLikes(recipe.id, delta).subscribe({
      next: (newCount) => {
        this.likeCount.set(newCount);
        if (like) markLiked(recipe.id);
        else unmarkLiked(recipe.id);
        this.likePending.set(false);
      },
      error: () => {
        this.likeCount.set(previousCount);
        this.isLiked.set(!like);
        this.likePending.set(false);
      },
    });
  }

  /**
   * Whole-recipe amount for a per-portion nutrition value (User Story 10:
   * nutrition must be shown for the whole recipe), rounded to a whole
   * gram/kcal since the source value is itself only an estimate. Shown in
   * the small line under each per-portion value ("44g total", "960 kcal total").
   */
  protected nutritionTotal(perPortion: number): number {
    const recipe = this.recipe();
    return recipe ? Math.round(perPortion * recipe.portions) : 0;
  }

  /**
   * Share of one macronutrient in the recipe's total macronutrient weight
   * (protein + carbs + fat, in grams; User Story 10: "in Gramm und
   * Prozent"). Not a percent daily value — the model has no reliable
   * reference intake to compare against — so this is the mix of the three
   * macros relative to each other, e.g. "40% protein" means 40% of the
   * protein+carbs+fat grams, not 40% of a recommended daily amount.
   * Identical for the per-portion and the whole-recipe number, since scaling
   * every macro by `portions` does not change their ratio — so the template
   * shows it only once, on the total line ("44g total · 23%").
   */
  protected macroPercent(grams: number): number {
    const recipe = this.recipe();
    if (!recipe) return 0;
    const { proteinG, carbsG, fatG } = recipe.nutrition;
    const total = proteinG + carbsG + fatG;
    return total > 0 ? Math.round((grams / total) * 100) : 0;
  }

  /** Renders an amount the way the design writes it: "80g", "30ml", "1 piece". */
  protected amount(ingredient: RecipeIngredient): string {
    switch (ingredient.unit) {
      case 'gram':
        return `${ingredient.amount}g`;
      case 'ml':
        return `${ingredient.amount}ml`;
      default:
        return `${ingredient.amount} ${ingredient.amount === 1 ? 'piece' : 'pieces'}`;
    }
  }
}
