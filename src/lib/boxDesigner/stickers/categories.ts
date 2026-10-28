/**
 * Category display names and order. Categories found in the library but not listed here are still shown
 * (name derived from the id) after the listed ones.
 */

export const CATEGORY_ORDER: { id: string; name: string }[] = [
  { id: 'fruits-veg', name: 'Fruits & veg' },
  { id: 'bakery-food', name: 'Bakery & food' },
  { id: 'drinks', name: 'Drinks' },
  { id: 'clothing', name: 'Clothing' },
  { id: 'footwear-accessories', name: 'Footwear' },
  { id: 'beauty-wellness', name: 'Beauty' },
  { id: 'electronics', name: 'Electronics' },
  { id: 'gifts-festive', name: 'Gifts & festive' },
  { id: 'home-kitchen', name: 'Home & kitchen' },
  { id: 'flowers-plants', name: 'Flowers & plants' },
  { id: 'animals-kids', name: 'Animals & kids' },
  { id: 'shipping-marks', name: 'Shipping marks' },
  { id: 'badges-labels', name: 'Badges' },
  { id: 'shapes-frames', name: 'Shapes & frames' },
  { id: 'patterns', name: 'Patterns' },
  { id: 'contact-icons', name: 'Contact' },
  { id: 'starter', name: 'Starter pack' },
];

export function categoryName(id: string): string {
  const known = CATEGORY_ORDER.find((c) => c.id === id);
  if (known) return known.name;
  const words = id.replace(/[-_]+/g, ' ').trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : id;
}

export function categorySortIndex(id: string): number {
  const i = CATEGORY_ORDER.findIndex((c) => c.id === id);
  return i === -1 ? CATEGORY_ORDER.length : i;
}
