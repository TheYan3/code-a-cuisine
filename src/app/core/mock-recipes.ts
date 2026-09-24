import { Cuisine, CookingTime, Diet } from './recipe-request';
import { Recipe } from './recipe';

// ponytail: mock data, wired to RecipeApi in phase C. Generated instead of
// hand-written so the library and cuisine pages have enough rows to prove
// pagination (Italian alone needs 40+) without 40 literal objects here.

/** One recipe template repeated to fill a cuisine with enough rows. */
interface RecipeTemplate {
  title: string;
  cookingTimeMinutes: number;
  timeCategory: CookingTime;
  diet: Diet;
  likes: number;
}

const NUTRITION = { caloriesPerPortion: 630, proteinG: 18, fatG: 24, carbsG: 58 };

const TEMPLATES: Record<Cuisine, RecipeTemplate[]> = {
  italian: [
    {
      title: 'Pasta with spinach and cherry tomatoes',
      cookingTimeMinutes: 20,
      timeCategory: 'quick',
      diet: 'vegetarian',
      likes: 66,
    },
    {
      title: 'Creamy garlic shrimp pasta',
      cookingTimeMinutes: 22,
      timeCategory: 'quick',
      diet: 'no-preference',
      likes: 32,
    },
    {
      title: 'Funghi salami pizza',
      cookingTimeMinutes: 16,
      timeCategory: 'quick',
      diet: 'no-preference',
      likes: 42,
    },
  ],
  german: [
    {
      title: 'Pretzel with Bavarian mustard',
      cookingTimeMinutes: 35,
      timeCategory: 'medium',
      diet: 'vegetarian',
      likes: 41,
    },
    {
      title: 'Schnitzel with fries',
      cookingTimeMinutes: 30,
      timeCategory: 'medium',
      diet: 'no-preference',
      likes: 93,
    },
    {
      title: 'Sauerbraten with red cabbage',
      cookingTimeMinutes: 75,
      timeCategory: 'complex',
      diet: 'no-preference',
      likes: 27,
    },
  ],
  japanese: [
    {
      title: 'Salmon nigiri and maki platter',
      cookingTimeMinutes: 45,
      timeCategory: 'complex',
      diet: 'no-preference',
      likes: 58,
    },
    {
      title: 'Miso soup with tofu',
      cookingTimeMinutes: 15,
      timeCategory: 'quick',
      diet: 'vegan',
      likes: 19,
    },
  ],
  gourmet: [
    {
      title: 'Seared duck breast with mushroom jus',
      cookingTimeMinutes: 55,
      timeCategory: 'complex',
      diet: 'keto',
      likes: 24,
    },
    {
      title: 'Truffle risotto',
      cookingTimeMinutes: 40,
      timeCategory: 'medium',
      diet: 'vegetarian',
      likes: 37,
    },
  ],
  indian: [
    {
      title: 'Butter chicken with basmati rice',
      cookingTimeMinutes: 40,
      timeCategory: 'medium',
      diet: 'no-preference',
      likes: 57,
    },
    {
      title: 'Chana masala with naan',
      cookingTimeMinutes: 30,
      timeCategory: 'medium',
      diet: 'vegan',
      likes: 46,
    },
  ],
  // Deliberately empty: this cuisine has no recipes yet, so its page proves
  // the empty state.
  fusion: [],
};

/** Recipe count generated per cuisine; only Italian needs to exceed a page. */
const COUNTS: Record<Cuisine, number> = {
  italian: 45,
  german: 6,
  japanese: 4,
  gourmet: 4,
  indian: 5,
  fusion: 0,
};

function buildRecipe(cuisine: Cuisine, template: RecipeTemplate, index: number): Recipe {
  return {
    id: `${cuisine}-${index}`,
    createdAt: Date.now() - index * 3_600_000,
    title: template.title,
    cuisine,
    diet: template.diet,
    timeCategory: template.timeCategory,
    cookingTimeMinutes: template.cookingTimeMinutes,
    portions: 2,
    helpers: 1,
    ingredientsUsed: [],
    ingredientsMissing: [],
    steps: [],
    nutrition: NUTRITION,
    likes: template.likes,
  };
}

/** All mock recipes, newest first — the shape `RecipeApi.list()` returns. */
export const MOCK_RECIPES: Recipe[] = (Object.keys(TEMPLATES) as Cuisine[]).flatMap((cuisine) => {
  const templates = TEMPLATES[cuisine];
  if (!templates.length) return [];

  return Array.from({ length: COUNTS[cuisine] }, (_, i) =>
    buildRecipe(cuisine, templates[i % templates.length], i),
  );
});
