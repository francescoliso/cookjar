// Maps an ingredient line to a small emoji icon by keyword.
// First match wins, so order more specific terms before generic ones.
const RULES: [RegExp, string][] = [
  [/spaghetti|pasta|noodle|lo mein/i, '🍝'],
  [/pizza dough|dough/i, '🍕'],
  [/tortilla|taco/i, '🌮'],
  [/rice|jasmine|quinoa/i, '🍚'],
  [/flour/i, '🌾'],
  [/egg/i, '🥚'],
  [/pancetta|guanciale|bacon|beef|steak|ground/i, '🥩'],
  [/chicken|thigh|poultry/i, '🍗'],
  [/fish|salmon|tuna|shrimp|prawn/i, '🐟'],
  [/pecorino|parmesan|mozzarella|cheddar|feta|cheese/i, '🧀'],
  [/yogurt|cream|milk|butter/i, '🥛'],
  [/avocado/i, '🥑'],
  [/tomato|salsa|marinara/i, '🍅'],
  [/onion|shallot/i, '🧅'],
  [/garlic/i, '🧄'],
  [/ginger/i, '🫚'],
  [/jalape|chili|chilli|curry paste|paprika|cayenne|red pepper/i, '🌶️'],
  [/bell pepper|capsicum/i, '🫑'],
  [/eggplant|aubergine/i, '🍆'],
  [/lemon|lime/i, '🍋'],
  [/banana/i, '🍌'],
  [/cucumber|pickle/i, '🥒'],
  [/lettuce|cilantro|basil|oregano|herb|leaves|greens|spinach/i, '🌿'],
  [/olive oil|olive/i, '🫒'],
  [/corn|maize/i, '🌽'],
  [/coconut/i, '🥥'],
  [/sugar|maple|syrup|honey/i, '🍯'],
  [/salt|pepper|cumin|masala|spice|seasoning|powder/i, '🧂'],
  [/vinegar|sauce|fish sauce|soy/i, '🍶'],
  [/water/i, '💧'],
];

export function ingredientIcon(ingredient: string): string {
  for (const [pattern, emoji] of RULES) {
    if (pattern.test(ingredient)) return emoji;
  }
  return '🥄';
}
