import { Component } from '@angular/core';

import { Counter } from '../../components/counter/counter';
import { Header } from '../../components/header/header';
import { Tag } from '../../components/tag/tag';

/** A cooking time option: a tag plus the sublabel shown underneath it. */
interface CookingTimeOption {
  value: string;
  label: string;
  sublabel: string;
}

/**
 * Generator page, step 2: cooking time, cuisine and diet preferences plus
 * portion/helper counters. Ships with example data matching the Figma
 * reference (none of the tags pre-selected) purely so the layout can be
 * verified — the senior-dev pass wires the counters/tags to the shared
 * recipe request state and adds the completeness check before navigating on.
 */
@Component({
  imports: [Header, Counter, Tag],
  selector: 'app-preferences',
  styleUrl: './preferences.scss',
  templateUrl: './preferences.html',
})
export class Preferences {
  /** Cooking time options; sublabels intentionally differ from the Figma text (typos fixed). */
  protected readonly cookingTimeOptions: CookingTimeOption[] = [
    { value: 'quick', label: 'Quick', sublabel: 'up to 20min' },
    { value: 'medium', label: 'Medium', sublabel: '20-45min' },
    { value: 'complex', label: 'Complex', sublabel: 'over 45min' },
  ];

  /** Cuisine options. */
  protected readonly cuisineOptions = [
    'German',
    'Italian',
    'Indian',
    'Japanese',
    'Gourmet',
    'Fusion',
  ];

  /** Diet options. */
  protected readonly dietOptions = ['Vegetarian', 'Vegan', 'Keto', 'No preferences'];
}
