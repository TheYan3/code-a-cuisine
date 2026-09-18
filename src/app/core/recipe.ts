import { Unit } from '../components/unit-select/unit-select';
import { CookingTime, Cuisine, Diet } from './recipe-request';

/**
 * A single ingredient line of a generated recipe, already scaled to the
 * requested number of portions.
 */
export interface RecipeIngredient {
  /** Ingredient name as it should be shown, e.g. "Cherry tomatoes". */
  name: string;
  /** Amount for the whole recipe at the requested portion count. */
  amount: number;
  /** Unit the amount is given in. */
  unit: Unit;
}

/**
 * One step of the cooking instructions. Steps are stored in chronological
 * order; `parallel` marks a step that can run alongside the previous one
 * (User Story 8), and `assignedTo` splits the work across the cooks
 * (User Story 9).
 */
export interface RecipeStep {
  /** Position in the instructions, starting at 1. */
  number: number;
  /** What to do, understandable for a beginner. */
  text: string;
  /** Whether this step runs alongside the previous one instead of after it. */
  parallel: boolean;
  /** Which cook this step belongs to, 1-based; 1 when cooking alone. */
  assignedTo: number;
}

/**
 * Nutrition values for one portion. Estimated by the language model, not
 * measured — the UI says so next to the chart (User Story 10). Percentages
 * are derived in the frontend, so only grams are stored.
 */
export interface RecipeNutrition {
  /** Calories per portion, in kcal. */
  caloriesPerPortion: number;
  /** Protein per portion, in grams. */
  proteinG: number;
  /** Carbohydrates per portion, in grams. */
  carbsG: number;
  /** Fat per portion, in grams. */
  fatG: number;
}

/**
 * A generated recipe as stored in Firebase and rendered by the app. Written
 * exclusively by the n8n workflow — the database rules deny every client
 * write — and read by the results page, the library and the detail page.
 */
export interface Recipe {
  /** Firebase key, also the `:id` route parameter. */
  id: string;
  /** Creation timestamp in milliseconds since the epoch; sorts the library. */
  createdAt: number;
  /** Recipe title. */
  title: string;
  /** Cooking style the recipe was generated for; groups the library. */
  cuisine: Cuisine;
  /** Diet the recipe complies with. */
  diet: Diet;
  /** Time category the user asked for. */
  timeCategory: CookingTime;
  /** Actual cooking time in minutes, shown on every card. */
  cookingTimeMinutes: number;
  /** Number of portions all amounts refer to. */
  portions: number;
  /** Number of cooks the step assignment was built for. */
  helpers: number;
  /** Ingredients the user already had and that this recipe uses. */
  ingredientsUsed: RecipeIngredient[];
  /** Basic ingredients the user still needs to buy — at most three. */
  ingredientsMissing: RecipeIngredient[];
  /** Chronological instructions. */
  steps: RecipeStep[];
  /** Estimated nutrition per portion. */
  nutrition: RecipeNutrition;
}

/**
 * What the n8n generation webhook returns on success: exactly three recipes
 * (User Story 7) plus the caller's remaining daily quota, so the generator
 * can show the new count without a second request.
 */
export interface GenerateRecipesResponse {
  /** The three generated recipes, already stored in Firebase. */
  recipes: Recipe[];
  /** Quota left for this IP after this generation. */
  quota: QuotaStatus;
}

/**
 * Remaining generations for the calling IP. Returned by the quota webhook and
 * repeated in every generation response (User Story 11).
 */
export interface QuotaStatus {
  /** Generations this IP has left today. */
  remaining: number;
  /** Generations allowed per IP per day. */
  limit: number;
  /** Whether the system-wide daily cap is already exhausted. */
  systemLimitReached: boolean;
}
