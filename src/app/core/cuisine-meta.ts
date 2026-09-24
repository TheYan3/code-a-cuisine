import { Cuisine } from './recipe-request';

/** Display data for one cuisine tile/page: label, emoji and image assets. */
export interface CuisineMeta {
  key: Cuisine;
  /** Bare name, e.g. "Italian" — used in sentences like the empty state. */
  name: string;
  /** Heading text, e.g. "Italian cuisine". */
  label: string;
  emoji: string;
  /** Tile photo in `public/images/cookbook/`. */
  image: string;
  /** Cuisine-page banner illustration in `public/images/cookbook/`. */
  banner: string;
  /** Real `alt` text for the tile photo. */
  alt: string;
}

/**
 * The six cuisines in the order and with the emojis the Figma cookbook
 * frame uses. Drives both the library tiles and the `/library/:cuisine`
 * page — the single place that maps a `Cuisine` key to its display data.
 */
export const CUISINES: CuisineMeta[] = [
  {
    key: 'italian',
    name: 'Italian',
    label: 'Italian cuisine',
    emoji: '🤌',
    image: '/images/cookbook/italian.webp',
    banner: '/images/cookbook/banner-italian.webp',
    alt: 'A wood-fired pizza and a plate of seafood linguine',
  },
  {
    key: 'german',
    name: 'German',
    label: 'German cuisine',
    emoji: '🥨',
    image: '/images/cookbook/german.webp',
    banner: '/images/cookbook/banner-german.webp',
    alt: 'Pretzels and plates of schnitzel with sauerkraut',
  },
  {
    key: 'japanese',
    name: 'Japanese',
    label: 'Japanese cuisine',
    emoji: '🥢',
    image: '/images/cookbook/japanese.webp',
    banner: '/images/cookbook/banner-japanese.webp',
    alt: 'Salmon nigiri and maki rolls on a wooden board',
  },
  {
    key: 'gourmet',
    name: 'Gourmet',
    label: 'Gourmet cuisine',
    emoji: '✨',
    image: '/images/cookbook/gourmet.webp',
    banner: '/images/cookbook/banner-gourmet.webp',
    alt: 'A fine-dining plate of seared meat with vegetable garnish',
  },
  {
    key: 'indian',
    name: 'Indian',
    label: 'Indian cuisine',
    emoji: '🍛',
    image: '/images/cookbook/indian.webp',
    banner: '/images/cookbook/banner-indian.webp',
    alt: 'A thali platter with curries, rice, naan and papadum',
  },
  {
    key: 'fusion',
    name: 'Fusion',
    label: 'Fusion cuisine',
    emoji: '🍢',
    image: '/images/cookbook/fusion.webp',
    banner: '/images/cookbook/banner-fusion.webp',
    alt: 'A composed plate mixing salmon sashimi with fusion garnishes',
  },
];

/** Looks up a cuisine's display data, or `undefined` for an unknown key. */
export function cuisineMeta(key: string): CuisineMeta | undefined {
  return CUISINES.find((c) => c.key === key);
}
