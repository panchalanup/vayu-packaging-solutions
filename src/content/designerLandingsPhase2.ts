/**
 * Landing pages for the phase 2 box styles (carry box, fruit box, tuck-end, crash-lock, cake box, window mailer,
 * takeaway clamshell, shelf tray, slide box, book-style box). Same rules as designerLandings.ts: general packaging
 * guidance only, no invented numbers, customers or certificates. These open the designer from a preset (style, size,
 * board, colour, cut-outs) rather than a template, so they do not depend on the templates gallery.
 *
 * Styles without a landing page here (and why) are listed in NO_LANDING_REASONS; a test checks every style is either
 * routed or explained.
 */

import type { DesignerLanding } from './designerLandings';
import type { BoxTemplate } from '@/types/boxDesigner';

// VERIFY-LATER[DSG-80]: confirm with the owner which of these styles Vayu quotes as corrugated and which need
// paperboard (tuck-end, slide, book style), and that the food-contact wording matches what is offered.
export const PHASE2_LANDINGS: DesignerLanding[] = [
  {
    slug: 'carry-box',
    preset: { style: 'carry', dims: { length: 40, width: 30, height: 25 }, ply: '5-ply', flutes: ['B', 'C'], options: ['handHoles'] },
    style: 'carry',
    name: 'Carry box',
    metaTitle: 'Carry Box Designer: Corrugated Box with Hand Holes in 3D',
    metaDescription: 'Design a carry box with hand holes in 3D. Set the inside size, choose 3, 5 or 7-ply board, add your logo and download the dieline with the true cut lines. Free, no sign-up.',
    keywords: ['carry box with hand holes', 'corrugated box with handle', 'custom hamper box', 'box with hand hole design'],
    h1: 'Design your carry box with hand holes in 3D',
    intro:
      'A carry box is a sealed slotted carton with a hand hole in each short wall, so it can be lifted with two hands and carried without a bag. The designer shows the holes on the model and draws the exact cut lines on the dieline.',
    bestFor: ['Gift hampers and festive sweets', 'Small appliances and tools', 'Moving, storage and relocation boxes', 'Anything people carry from shop to car'],
    benefits: [
      'Hand holes make the box easy to lift and carry, so one carton can replace a box plus a carry bag.',
      'It still packs flat and seals like a normal slotted carton, so storage and freight stay simple.',
      'The dieline shows the real cut-out positions, so the die maker gets a clear drawing.',
    ],
    sizes: [
      { label: 'Hamper', dims: { length: 35, width: 25, height: 20 } },
      { label: 'Appliance', dims: { length: 40, width: 30, height: 25 } },
      { label: 'Moving box', dims: { length: 50, width: 40, height: 40 } },
    ],
    tips: [
      'Hand holes remove some board from the walls, so choose a stronger ply when the box will be heavy or stacked.',
      'Keep your logo clear of the hand holes: put it on the long walls.',
      'Switch hand holes on or off in the Cut-outs section to compare.',
    ],
    faqs: [
      { question: 'Do hand holes make the box weaker?', answer: 'Yes, a little. Holes and vents reduce stacking strength, so the designer warns you and the quote team can suggest a heavier board for loaded boxes.' },
      { question: 'Where are the hand holes placed?', answer: 'One in each short wall, near the top, on the model and on the dieline. A small die cost for the cut-outs is added to the indicative estimate.' },
      { question: 'Can I print on the box?', answer: 'Yes. Add a logo, text or ready-made cutouts on any wall, then download the dieline or send the design to us for a quote.' },
    ],
    related: ['shipping-carton', 'heavy-duty-box', 'fruit-box', 'gift-box'],
  },
  {
    slug: 'fruit-box',
    preset: { style: 'produce', dims: { length: 40, width: 30, height: 20 }, ply: '5-ply', flutes: ['B', 'C'], colorHex: '#C9A87C', options: ['vents', 'handHoles'] },
    style: 'produce',
    name: 'Fruit box',
    metaTitle: 'Fruit Box Designer: Ventilated Produce Cartons in 3D',
    metaDescription: 'Design a ventilated fruit and vegetable carton in 3D. Add vent slots and hand holes, set the size for mangoes, apples or grapes, and download the dieline. Free, no sign-up.',
    keywords: ['fruit box design', 'mango box design', 'ventilated produce carton', 'vegetable box with vents'],
    h1: 'Design your fruit and produce box in 3D',
    intro:
      'A ventilated produce carton is a slotted box with vent slots and hand holes in the walls, so fresh fruit and vegetables get airflow and the box is easy to carry. Pick the size for your fruit, print your farm or brand name and see the cut-outs on the model.',
    bestFor: ['Mango, apple, grape and citrus growers and packers', 'Vegetable and leafy produce sellers', 'Farmer groups and FPOs selling under their own name', 'Fruit gift boxes and market stalls'],
    benefits: [
      'Vent slots let air move through the pack, which helps fruit stay cooler on the way to market.',
      'Hand holes make loading and carrying easier for pickers, packers and delivery staff.',
      'Your name, village or brand prints on the walls, so a plain carton becomes a branded pack.',
    ],
    sizes: [
      { label: '5 kg fruit', dims: { length: 40, width: 30, height: 15 } },
      { label: '10 kg crate-style', dims: { length: 45, width: 32, height: 22 } },
      { label: 'Vegetable carton', dims: { length: 50, width: 35, height: 25 } },
    ],
    tips: [
      'Vents and hand holes lower stacking strength, so use a stronger board for heavy or tall stacks and keep vents modest.',
      'Print on the wall that faces out on the pallet or in the shop.',
      'Measure the fruit and the tray or paper wrap, then enter that as the inside size.',
    ],
    faqs: [
      { question: 'How big should the vents be?', answer: 'Enough for airflow, but not so large that the walls lose their strength. The designer lets you switch vents on or off and the strength guide in Price and order shows the effect. The quote team confirms the final layout.' },
      { question: 'Can this carry heavy fruit?', answer: 'It depends on the board and stack height. A 5-ply board is the starting point here; choose 7-ply for heavy loads and check the strength guide.' },
      { question: 'Is the board safe for food?', answer: 'Corrugated board for fresh produce is chosen with your order. Tell us what you are packing and whether it touches the board when you request a quote.' },
    ],
    related: ['carry-box', 'shipping-carton', 'bakery-box', 'display-tray'],
  },
  {
    slug: 'tuck-end-box',
    preset: { style: 'tuck-end', dims: { length: 12, width: 8, height: 14 }, ply: '3-ply', flutes: ['E'], colorHex: '#F5F5F0' },
    style: 'tuck-end',
    name: 'Tuck-end box',
    metaTitle: 'Tuck-End Box Designer: Custom Retail Cartons in 3D',
    metaDescription: 'Design a tuck-end carton in 3D: tuck flaps at both ends for cosmetics, soap and small retail packs. Set the size, add your artwork and download the dieline. Free.',
    keywords: ['tuck end box design', 'custom tuck end carton', 'cosmetic box design', 'soap box packaging'],
    h1: 'Design your tuck-end box in 3D',
    intro:
      'A tuck-end carton is a tube with a flap at each end that tucks into the box to close it. It is the classic small retail carton for cosmetics, soap, candles and similar products, with a clean front for your brand.',
    bestFor: ['Cosmetics, skincare and soap', 'Candles, incense and small gifts', 'Small retail and counter packs', 'Cards and light accessories'],
    benefits: [
      'Closes without glue or tape at the ends, so packing is quick and the box can be reopened.',
      'Four plain walls give a clean surface for artwork, with the brand name on the front.',
      'It ships flat before assembly, which keeps freight and storage compact.',
    ],
    sizes: [
      { label: 'Soap', dims: { length: 10, width: 6, height: 5 } },
      { label: 'Cream jar', dims: { length: 7, width: 7, height: 9 } },
      { label: 'Bottle', dims: { length: 6, width: 6, height: 16 } },
    ],
    tips: [
      'Add a window in the Cut-outs section if the product looks good on the shelf.',
      'Leave a few millimetres of room so the tuck flaps close without bulging.',
      'Check the dieline for the glue flap and keep artwork away from it.',
    ],
    faqs: [
      { question: 'Is a tuck-end box made of corrugated board?', answer: 'The designer models it in thin corrugated board (E-flute). Small retail cartons are also made of paperboard; tell us which you want when you ask for a quote.' },
      { question: 'Can I add a window?', answer: 'Yes. Switch on the window in the Cut-outs section and set its size. The model shows a clear film and the dieline has the cut line.' },
      { question: 'What size do I enter?', answer: 'The inside size of the product with a little room, as length, width and height. The designer shows the outside size.' },
    ],
    related: ['crash-lock-box', 'slide-box', 'window-mailer-box', 'mailer-box'],
  },
  {
    slug: 'crash-lock-box',
    preset: { style: 'crash-lock', dims: { length: 20, width: 15, height: 25 }, ply: '3-ply', flutes: ['E'], colorHex: '#F5F5F0' },
    style: 'crash-lock',
    name: 'Crash-lock bottom box',
    metaTitle: 'Crash-Lock Bottom Box Designer: Auto-Bottom Cartons in 3D',
    metaDescription: 'Design a crash-lock (auto-bottom) box in 3D for bottles, jars and heavier retail packs. Set the size, add artwork and download the dieline. Free, no sign-up.',
    keywords: ['crash lock bottom box', 'auto bottom box design', 'bottle box packaging', 'snap lock bottom carton'],
    h1: 'Design your crash-lock bottom box in 3D',
    intro:
      'A crash-lock box ships flat and opens into a box with a self-locking bottom: you pull the sides apart and the bottom snaps into place. It holds heavier items such as bottles and jars better than a simple tuck bottom.',
    bestFor: ['Bottles, jars and tins', 'Heavier retail and gift packs', 'Packing lines that need a quick set-up', 'Sauces, oils, honey and similar products'],
    benefits: [
      'The bottom locks itself when the box is opened, so no tape or glue is needed to build it.',
      'The locked bottom carries more weight than a plain tuck bottom, which suits bottles and jars.',
      'It is delivered flat, so storage and freight take little space.',
    ],
    sizes: [
      { label: 'Small jar', dims: { length: 8, width: 8, height: 12 } },
      { label: 'Bottle', dims: { length: 9, width: 9, height: 28 } },
      { label: 'Gift set', dims: { length: 20, width: 15, height: 25 } },
    ],
    tips: [
      'Choose a board that matches the product weight: use a stronger ply for several full bottles.',
      'Add dividers or inserts separately if bottles can knock together.',
      'Look at the 1-2-3 bottom style in the picker for light packs packed by hand.',
    ],
    faqs: [
      { question: 'What is the difference from a 1-2-3 bottom box?', answer: 'Both fold flat. A crash-lock bottom locks itself when opened and suits heavier items; a 1-2-3 bottom is folded and tucked by hand and suits lighter packs.' },
      { question: 'Can it carry glass bottles?', answer: 'The bottom is built for heavier goods, but glass also needs inserts or dividers. Share the product and weight with us when you request a quote.' },
      { question: 'Can I print all four walls?', answer: 'Yes. Add artwork to each wall in the designer and check the dieline for the glue flap.' },
    ],
    related: ['tuck-end-box', 'carry-box', 'shipping-carton', 'gift-box'],
  },
  {
    slug: 'cake-box',
    preset: { style: 'cake-box', dims: { length: 25, width: 25, height: 12 }, ply: '3-ply', flutes: ['E'], colorHex: '#F5F5F0', options: ['window'] },
    style: 'cake-box',
    name: 'Cake box with window',
    metaTitle: 'Cake Box Designer: Window Cake and Pastry Boxes in 3D',
    metaDescription: 'Design a cake box with a clear window in 3D. Set the size in inches or cm, add your bakery name and download the dieline. Free, no sign-up.',
    keywords: ['cake box design', 'window cake box', 'custom cake box', 'pastry box with window'],
    h1: 'Design your cake box with a window in 3D',
    intro:
      'A cake box is a shallow, die-cut box with a lid that shows a clear window, so the customer sees the cake before opening it. Pick your size, put your bakery name on the lid and watch the box fold.',
    bestFor: ['Bakeries and home bakers', 'Cloud kitchens and dessert brands', 'Sweet shops and gift hampers', 'Pastries, brownies and cupcake sets'],
    benefits: [
      'The window shows the product, so the box sells the cake without being opened.',
      'It folds from one die-cut sheet, so it stores flat until needed.',
      'The big lid is a clean place for your bakery name, phone number and social handle.',
    ],
    sizes: [
      { label: '0.5 kg cake', dims: { length: 20, width: 20, height: 10 } },
      { label: '1 kg cake', dims: { length: 25, width: 25, height: 12 } },
      { label: 'Pastry box', dims: { length: 22, width: 15, height: 8 } },
    ],
    tips: [
      'Measure the cake board, not just the cake, and add a little room for the icing.',
      'Switch to inches if your supplier quotes in inches (8, 10 or 12 inch).',
      'White board makes cakes look fresh; kraft looks natural. Both print well in one colour.',
    ],
    faqs: [
      { question: 'Is the window plastic?', answer: 'It is a clear film over the window cut-out. Film type and food-contact suitability are confirmed with your quote.' },
      { question: 'Can I resize the window?', answer: 'Yes. Use the window size slider in the Cut-outs section; the dieline shows the true cut line.' },
      { question: 'Is the box food safe?', answer: 'Food-contact board and inks are chosen with your order. Mention the food and whether it touches the board when you ask for a quote.' },
    ],
    related: ['pizza-box', 'bakery-box', 'window-mailer-box', 'takeaway-box'],
  },
  {
    slug: 'window-mailer-box',
    preset: { style: 'window-mailer', dims: { length: 28, width: 22, height: 7 }, ply: '3-ply', flutes: ['E'], colorHex: '#F5F5F0', options: ['window'] },
    style: 'window-mailer',
    name: 'Window mailer box',
    metaTitle: 'Window Mailer Box Designer: Custom Mailers with a Window in 3D',
    metaDescription: 'Design a mailer box with a clear window lid in 3D. Show the product, add your brand and download the dieline. Free, no sign-up.',
    keywords: ['window mailer box', 'mailer box with window', 'custom window box', 'apparel box with window'],
    h1: 'Design your window mailer box in 3D',
    intro:
      'A window mailer is a tuck-front mailer box whose lid has a clear window, so the product is visible before the box is opened. It keeps the easy, tape-free closing of a mailer.',
    bestFor: ['Apparel and accessories', 'Gift sets and cosmetics', 'Retail shelves where the product should show', 'Small electronics and stationery'],
    benefits: [
      'Customers see the product through the lid, which helps in shops and on shelves.',
      'The tuck front closes without tape and can be reopened.',
      'Walls and lid still carry your branding around the window.',
    ],
    sizes: [
      { label: 'Small', dims: { length: 20, width: 15, height: 6 } },
      { label: 'Apparel', dims: { length: 28, width: 22, height: 7 } },
      { label: 'Gift set', dims: { length: 30, width: 25, height: 10 } },
    ],
    tips: [
      'Keep the window smaller than the lid so the brand still has room around it.',
      'Place the product so its best side faces the window.',
      'Window film is a separate material from the board; ask us about the film options when you request a quote.',
    ],
    faqs: [
      { question: 'How is a window mailer different from a normal mailer?', answer: 'Only the lid: it has a cut-out covered with a clear film. The rest of the box is the same tuck-front mailer.' },
      { question: 'Is the film recyclable?', answer: 'Film and board are separate materials, and what can be recycled depends on local collection. Ask the quote team about the film options.' },
      { question: 'Can I print on the lid around the window?', answer: 'Yes. Add artwork or text on the lid and drag it to sit beside the window.' },
    ],
    related: ['mailer-box', 'cake-box', 'tuck-end-box', 'book-box'],
  },
  {
    slug: 'takeaway-box',
    preset: { style: 'clamshell', dims: { length: 20, width: 18, height: 8 }, ply: '3-ply', flutes: ['E'], colorHex: '#C9A87C' },
    style: 'clamshell',
    name: 'Takeaway clamshell box',
    metaTitle: 'Takeaway Box Designer: Burger and Lunch Clamshell Boxes in 3D',
    metaDescription: 'Design a takeaway clamshell box in 3D for burgers, sandwiches and meals. Set the size, add your brand and download the dieline. Free, no sign-up.',
    keywords: ['takeaway box design', 'burger box', 'clamshell food box', 'lunch box packaging'],
    h1: 'Design your takeaway clamshell box in 3D',
    intro:
      'A clamshell takeaway box has a hinged lid that folds over a shallow base and closes with a front tuck. It suits burgers, sandwiches, rolls and meals that travel from the kitchen to the door.',
    bestFor: ['Burger, sandwich and roll shops', 'Cloud kitchens and cafes', 'Lunch and meal-prep services', 'Snacks and street-food vendors'],
    benefits: [
      'The one-piece hinged lid opens and closes in one move, which is quick during busy service.',
      'It folds flat for storage and builds without glue.',
      'The lid and front give plenty of space for your brand and contact details.',
    ],
    sizes: [
      { label: 'Roll', dims: { length: 18, width: 10, height: 6 } },
      { label: 'Burger', dims: { length: 15, width: 15, height: 8 } },
      { label: 'Meal box', dims: { length: 24, width: 18, height: 6 } },
    ],
    tips: [
      'Measure the food in its wrap, not on its own.',
      'Print one colour on kraft for a natural, low-cost look.',
      'Greasy foods need a suitable liner or coating; ask us when you request a quote.',
    ],
    faqs: [
      { question: 'Can hot or oily food go in directly?', answer: 'Plain corrugated board is not a grease barrier. Food-contact and grease-resistance options are confirmed with your quote; tell us what you serve.' },
      { question: 'Can I add a window?', answer: 'Yes. Turn the window on in the Cut-outs section, set the size and the dieline shows the cut.' },
      { question: 'Does it need glue or tape?', answer: 'No. The lid tucks into the front to close it.' },
    ],
    related: ['pizza-box', 'cake-box', 'bakery-box', 'box-sleeve'],
  },
  {
    slug: 'display-tray',
    preset: { style: 'shelf-tray', dims: { length: 30, width: 20, height: 12 }, ply: '3-ply', flutes: ['B'], colorHex: '#C9A87C' },
    style: 'shelf-tray',
    name: 'Shelf display tray',
    metaTitle: 'Shelf Display Tray Designer: Counter and Retail Trays in 3D',
    metaDescription: 'Design a shelf display tray with a cut-down front in 3D. Set the size, choose board and print your brand. Download the dieline. Free, no sign-up.',
    keywords: ['shelf display tray', 'counter display box', 'retail display tray design', 'shelf ready packaging'],
    h1: 'Design your shelf display tray in 3D',
    intro:
      'A shelf display tray is an open tray with a lowered front, so customers can see and reach the products inside. It sits on a shop shelf or counter and holds a small stock of snacks, cosmetics or small retail packs.',
    bestFor: ['Snacks, confectionery and small FMCG packs', 'Counter and till-point displays', 'Cosmetics and small accessories', 'Shop shelves that need tidy stock'],
    benefits: [
      'The cut-down front lets people take a product without lifting a lid.',
      'Products stay in rows, so shelves look tidy and are easy to refill.',
      'The front and sides carry your brand and offers right where people look.',
    ],
    sizes: [
      { label: 'Counter', dims: { length: 25, width: 15, height: 10 } },
      { label: 'Shelf', dims: { length: 30, width: 20, height: 12 } },
      { label: 'Large display', dims: { length: 40, width: 30, height: 15 } },
    ],
    tips: [
      'Use the front wall height slider: lower is easier to reach, higher holds more.',
      'Size the tray to a whole number of products per row.',
      'Print on the front, which faces the customer.',
    ],
    faqs: [
      { question: 'What is the front height setting?', answer: 'It sets how much of the front wall is cut away compared with the sides. The model and the dieline both follow it.' },
      { question: 'Can it stack?', answer: 'Trays can usually stack when the product inside is firm. Ask the quote team about stacking if you will load them on pallets.' },
      { question: 'Can I add a header card?', answer: 'The designer models the tray only. Mention a header card or other display part when you request a quote.' },
    ],
    related: ['bakery-box', 'fruit-box', 'slide-box', 'box-sleeve'],
  },
  {
    slug: 'slide-box',
    preset: { style: 'slide-box', dims: { length: 22, width: 16, height: 6 }, ply: '3-ply', flutes: ['E'], colorHex: '#F5F5F0' },
    style: 'slide-box',
    name: 'Slide box',
    metaTitle: 'Slide Box Designer: Tray and Sleeve Boxes in 3D',
    metaDescription: 'Design a slide box (drawer tray and printed sleeve) in 3D. Set the size, add your brand and download the dieline. Free, no sign-up.',
    keywords: ['slide box design', 'sleeve and tray box', 'drawer box packaging', 'custom slide box'],
    h1: 'Design your slide box in 3D',
    intro:
      'A slide box has two parts: a tray that slides out of a printed sleeve, like a drawer. The sleeve carries the print and the tray holds the product, so opening the box feels like a small reveal.',
    bestFor: ['Gift sets and premium retail packs', 'Cosmetics and skincare kits', 'Electronics accessories and gadgets', 'Cards, stationery and small keepsakes'],
    benefits: [
      'The sleeve and tray open smoothly, which gives a neat unboxing moment.',
      'The sleeve is a full wrap of print while the tray can be plain or coloured.',
      'It folds from flat sheets, so both parts store flat until packing.',
    ],
    sizes: [
      { label: 'Cards', dims: { length: 14, width: 10, height: 5 } },
      { label: 'Gift set', dims: { length: 22, width: 16, height: 6 } },
      { label: 'Gadget kit', dims: { length: 28, width: 20, height: 8 } },
    ],
    tips: [
      'Print the sleeve on all sides; the tray can use an inside colour.',
      'Ask us about a thumb notch or ribbon when you request a quote so the tray is easy to pull out.',
      'Use the fold slider to slide the tray out and show a customer.',
    ],
    faqs: [
      { question: 'Does the tray slide out easily?', answer: 'The model shows the tray sliding out of the sleeve. The real fit depends on board and tolerance; a sample is the best check.' },
      { question: 'Is a slide box made of corrugated board?', answer: 'The designer models it in thin corrugated board. Premium slide boxes are often paperboard or rigid; tell us what you prefer when you request a quote.' },
      { question: 'What size do I enter?', answer: 'The inside size of the tray, as the product needs it. The sleeve is sized around the tray.' },
    ],
    related: ['tuck-end-box', 'book-box', 'gift-box', 'window-mailer-box'],
  },
  {
    slug: 'book-box',
    preset: { style: 'book-box', dims: { length: 28, width: 20, height: 6 }, ply: '3-ply', flutes: ['E'], colorHex: '#2B2B2D' },
    style: 'book-box',
    name: 'Book-style box',
    metaTitle: 'Book-Style Box Designer: Flip-Lid Gift Boxes in 3D',
    metaDescription: 'Design a book-style flip-lid box in 3D for gifts, books and hampers. Set the size, add your brand and download the dieline. Free, no sign-up.',
    keywords: ['book style box', 'flip lid gift box', 'book shaped box packaging', 'hinged lid box design'],
    h1: 'Design your book-style flip-lid box in 3D',
    intro:
      'A book-style box has a lid hinged along one long side that flips open like a book cover and tucks shut at the front. It suits gifts, books and keepsakes where the opening should feel special.',
    bestFor: ['Gift sets and hampers', 'Books, albums and stationery', 'Keepsakes, invitations and mementos', 'Premium product launches'],
    benefits: [
      'The hinged lid stays attached, so it cannot be lost and opens in one motion.',
      'The large cover gives a bold area for a title, logo or artwork.',
      'It closes with a tuck, so no tape or ribbon is needed.',
    ],
    sizes: [
      { label: 'Book', dims: { length: 24, width: 17, height: 5 } },
      { label: 'Gift set', dims: { length: 28, width: 20, height: 6 } },
      { label: 'Hamper', dims: { length: 36, width: 26, height: 10 } },
    ],
    tips: [
      'Put the artwork on the cover and an inside colour under it for the reveal.',
      'Check the hinge side on the dieline before you finalise the artwork direction.',
      'Use Present mode to open the lid for a customer.',
    ],
    faqs: [
      { question: 'Which side does the lid open on?', answer: 'The lid hinges on a long side and tucks in at the front. The fold slider shows the opening movement.' },
      { question: 'Is it a rigid box?', answer: 'The designer models it as a folding corrugated box. Rigid or magnetic closures are different constructions; ask us if you want one.' },
      { question: 'Can I add a window?', answer: 'Yes, if you want to show the product on the cover. Turn it on in the Cut-outs section.' },
    ],
    related: ['gift-box', 'slide-box', 'window-mailer-box', 'mailer-box'],
  },
];

/**
 * Styles that have no landing page of their own, with the reason. A style is either routed in designerLandings.ts
 * (directly or through a template) or listed here.
 */
export const NO_LANDING_REASONS: Partial<Record<BoxTemplate, string>> = {
  hsc: 'Open-top box used as a bin or lid base; low search demand as a standalone product, covered by the shipping carton and tray pages.',
  'produce-tray': 'Variant of the fruit box and the display tray; searches are served by the fruit box page.',
  'one-two-three': 'Variant of the crash-lock bottom box; compared on that page rather than a separate one.',
};
