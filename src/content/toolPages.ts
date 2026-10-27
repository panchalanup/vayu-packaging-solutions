/**
 * Free calculator pages (/tools/<slug>): copy, SEO and structured-data inputs, and the route list.
 * Single source of truth: the pages, the sitemap generator and the tests all import from here, so keep it free of
 * React and browser globals. Copy is general packaging guidance: no invented courier rules, rates, customers or stats
 * (VERIFY-LATER markers sit next to anything that depends on a courier, forwarder or mill).
 */

export interface ToolFaq {
  question: string;
  answer: string;
}

export interface ToolExample {
  title: string;
  /** One line per step, in plain words */
  steps: string[];
  result: string;
}

export interface ToolPage {
  slug: string;
  path: string;
  /** Short name for links, cards and breadcrumbs */
  name: string;
  /** One line for the /tools index card and the nav */
  summary: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  /** H1, matches the main keyword */
  h1: string;
  /** The 40-60 word answer shown above the fold */
  answer: string;
  formula: string;
  formulaNote?: string;
  example: ToolExample;
  howTo: { name: string; steps: { name: string; text: string }[] };
  faqs: ToolFaq[];
  /** Blog slugs (src/constants/blogs.ts) */
  relatedBlogs: string[];
  /** Other tool slugs */
  relatedTools: string[];
}

export const TOOLS_INDEX_PATH = '/tools';

export const TOOL_PAGES: ToolPage[] = [
  {
    slug: 'volumetric-weight-calculator',
    path: '/tools/volumetric-weight-calculator',
    name: 'Volumetric Weight Calculator',
    summary: 'See the weight a courier may bill for your box, and what a smaller box would save.',
    metaTitle: 'Volumetric Weight Calculator India | Free, 4000 / 5000 / 6000 Divisor',
    metaDescription:
      'Free volumetric weight calculator: enter box size in mm, cm or inches, pick a divisor (4000, 5000, 6000) and see chargeable weight, cost and what a smaller box saves. No sign-up.',
    keywords: ['volumetric weight calculator', 'volumetric weight calculator India', 'dimensional weight calculator', 'volumetric weight formula', 'chargeable weight calculator', 'courier volumetric weight'],
    h1: 'Volumetric Weight Calculator',
    answer:
      'Volumetric weight is the space a parcel takes up, turned into kilograms: length x width x height in cm, divided by a divisor, often 5000 (some services use 4000 or 6000). Many couriers bill the larger of actual and volumetric weight, so an airy box can cost more than its contents weigh. Enter your box below.',
    formula: 'Volumetric kg = L x W x H (cm) / divisor.  Chargeable kg = larger of actual kg and volumetric kg.',
    formulaNote: 'Divisors and rules differ by courier and service; check your own rate card. Flyer rules, minimum weights and slabs are not modelled.',
    example: {
      title: 'A 30 x 20 x 15 cm box with a 1 kg parcel',
      steps: [
        'Volume: 30 x 20 x 15 = 9,000 cm3.',
        'At a divisor of 5000: 9,000 / 5,000 = 1.8 kg. At 4000 it is 2.25 kg; at 6000 it is 1.5 kg.',
        'The parcel really weighs 1 kg, so the volumetric 1.8 kg is the larger figure.',
        'Make the box 20% smaller in volume (7,200 cm3) and volumetric weight drops to 1.44 kg.',
      ],
      result: 'Billed on 1.8 kg instead of 1 kg: 0.8 kg more than the parcel weighs. A tighter box recovers part of that.',
    },
    howTo: {
      name: 'How to calculate volumetric weight',
      steps: [
        { name: 'Measure the packed box', text: 'Measure the outside length, width and height of the packed parcel, in mm, cm or inches.' },
        { name: 'Pick a divisor', text: 'Choose 5000 unless your courier tells you 4000 or 6000. Check your own rate card.' },
        { name: 'Enter the real weight', text: 'Add the weight of the packed parcel. The calculator shows which weight sets the charge.' },
        { name: 'Try a smaller box', text: 'See what a 10, 20 or 30% smaller box saves, then open a box of that size in 3D.' },
      ],
    },
    faqs: [
      { question: 'How do I calculate volumetric weight?', answer: 'Multiply length x width x height in centimetres, then divide by the divisor. For 30 x 20 x 15 cm and a divisor of 5000 that is 9,000 / 5,000 = 1.8 kg. Compare it with the real weight; many couriers bill the larger one.' },
      { question: 'Which divisor should I use, 4000, 5000 or 6000?', answer: 'It depends on the courier and the service. 5000 is a common starting point, but some services use 4000 or 6000. Look at your courier rate card or ask your account manager, then pick the matching divisor here.' },
      { question: 'What is chargeable weight?', answer: 'Chargeable weight is the weight your courier bills: usually the larger of the actual weight and the volumetric weight, often rounded up to a slab. This calculator shows the unrounded figure, so round it the way your rate card does.' },
      { question: 'Can I avoid volumetric weight charges?', answer: 'You cannot change the rule, but you can change the box. Cut empty space with a box sized to the product, add only the padding you need, and see how much a smaller box lowers the figure in the "what a smaller box saves" table.' },
      { question: 'Does this tool know my courier\'s rules?', answer: 'No. It uses the plain formula with the divisor you pick. Courier rules such as flyer rates, minimum charges or different divisors per service are not modelled, so treat the result as a guide and confirm on your rate card.' },
    ],
    relatedBlogs: ['find-right-box-size', 'packaging-mistakes-small-business', 'box-measurements-guide', 'ecommerce-mailer-box-unboxing'],
    relatedTools: ['box-size-calculator', 'packaging-cost-calculator', 'cbm-calculator'],
  },
  {
    slug: 'cbm-calculator',
    path: '/tools/cbm-calculator',
    name: 'CBM and Container Loading Calculator',
    summary: 'CBM per carton and total, cartons per pallet, and cartons per 20 ft, 40 ft or 40 ft high cube container.',
    metaTitle: 'CBM Calculator and Container Loading Calculator | Cartons per 20ft, 40ft, Pallet',
    metaDescription:
      'Free CBM calculator: carton size and quantity to total CBM, cartons per pallet and how many cartons fit in a 20 ft, 40 ft or 40 ft high cube container. Mm, cm or inches. No sign-up.',
    keywords: ['cbm calculator', 'container loading calculator', 'how many cartons in 20ft container', 'cartons per pallet', 'carton cbm calculator', 'pallet loading calculator', 'cbm formula'],
    h1: 'CBM Calculator and Container Loading Calculator',
    answer:
      'CBM means cubic metres: carton length x width x height in cm, divided by 1,000,000, then multiplied by the number of cartons. Freight is often priced by CBM or by weight, whichever is higher. This calculator also estimates how many cartons fit in a 20 ft, 40 ft or 40 ft high cube container and on a pallet.',
    formula: 'CBM per carton = L x W x H (cm) / 1,000,000.  Cartons per container = lowest of usable volume, floor layout and payload weight.',
    formulaNote: 'A simple layer-by-layer layout estimate, not 3D bin-packing. Container sizes and payloads are typical, editable starting points. Confirm with your freight forwarder.',
    example: {
      title: '500 cartons of 50 x 40 x 30 cm',
      steps: [
        'CBM per carton: 50 x 40 x 30 = 60,000 cm3 = 0.06 CBM.',
        'Total: 500 x 0.06 = 30 CBM.',
        'A 20 ft container of about 33 CBM at 85% usable space holds about 469 cartons by volume.',
        'Check the layout and weight limits too: the lowest of the three sets the real number.',
      ],
      result: '30 CBM is a little more than 85% of a typical 20 ft container, so plan on one container plus a small remainder, then confirm with your forwarder.',
    },
    howTo: {
      name: 'How to calculate CBM and cartons per container',
      steps: [
        { name: 'Enter the carton size', text: 'Type the outside length, width and height of one packed carton, and the quantity.' },
        { name: 'Add carton weight', text: 'Optional: the gross weight of one packed carton, so the payload limit is checked too.' },
        { name: 'Choose a container and pallet', text: 'Pick 20 ft, 40 ft or 40 ft high cube and a pallet size. Edit the usable space and payload if your forwarder says otherwise.' },
        { name: 'Read the limit', text: 'The result shows which limit binds (volume, layout or weight) and how many containers you need.' },
      ],
    },
    faqs: [
      { question: 'How do I calculate CBM?', answer: 'Multiply length x width x height of the carton in centimetres and divide by 1,000,000 to get cubic metres. Multiply by the number of cartons for the total. A 50 x 40 x 30 cm carton is 0.06 CBM.' },
      { question: 'How many cartons fit in a 20 ft container?', answer: 'It depends on the carton size and weight. This calculator takes the lowest of three limits: usable volume, a floor layout of layers, and the payload weight. Container sizes vary a little by line, so confirm with your forwarder.' },
      { question: 'Why is usable volume lower than the container volume?', answer: 'Cartons never fill every cubic centimetre: there are gaps at the doors and roof, and some loads need dunnage. The default is 85% usable and you can edit it.' },
      { question: 'Is this a 3D loading plan?', answer: 'No. It counts identical cartons layer by layer on a flat floor, trying the three ways to stand a carton and a simple two-block layout. It is a planning estimate, not a bin-packing optimiser, so real loading can fit a few more or fewer.' },
      { question: 'Can I change the carton to fit more?', answer: 'Yes. A small change in carton size can add a column or a layer. Use the "see this box in 3D" button to open the carton in the designer, adjust the size and run the numbers again.' },
    ],
    relatedBlogs: ['export-cartons-5-ply-7-ply', 'box-stacking-strength-guide', 'box-measurements-guide', 'types-of-corrugated-boxes'],
    relatedTools: ['box-strength-calculator', 'volumetric-weight-calculator', 'box-size-calculator'],
  },
  {
    slug: 'box-size-calculator',
    path: '/tools/box-size-calculator',
    name: 'Box Size Calculator',
    summary: 'Turn your product size into the inside and outside box size, with a 3D preview.',
    metaTitle: 'Box Size Calculator | What Box Size Do I Need for My Product?',
    metaDescription:
      'Free box size calculator: enter product size, quantity and padding to get the inside and outside box size, fill efficiency and the next common size. Mm, cm or inches. Open it in 3D.',
    keywords: ['box size calculator', 'what box size do I need for my product', 'inside vs outside box size', 'carton size calculator', 'packaging box dimensions calculator', 'mailer box size calculator'],
    h1: 'Box Size Calculator',
    answer:
      'To find the box size for a product, add padding on every side of the product (or the group of products), plus a little ease so it slides in. That gives the inside size. The outside size adds the board thickness. Always tell your box maker whether a size is inside or outside. Enter your product below.',
    formula: 'Inside = product (or group) + 2 x padding + ease, rounded up to 0.5 cm.  Outside = inside + 2 x board thickness.',
    formulaNote: 'Board thickness is approximate (VERIFY-LATER[MKT-06]); confirm with the mill. Padding is also left between items when you pack more than one.',
    example: {
      title: 'A 20 x 10 x 5 cm product with 1 cm padding per side',
      steps: [
        'Add padding on both sides: 20 + 2 = 22, 10 + 2 = 12, 5 + 2 = 7 cm.',
        'Add 0.3 cm ease so it slides in: 22.3, 12.3 and 7.3 cm.',
        'Round up to the next 0.5 cm: 22.5 x 12.5 x 7.5 cm inside.',
        'The product fills about 47% of the inside volume.',
      ],
      result: 'Inside size 22.5 x 12.5 x 7.5 cm. The outside is a little larger, by the board thickness on each side.',
    },
    howTo: {
      name: 'How to work out the right box size for a product',
      steps: [
        { name: 'Measure the product', text: 'Measure length, width and height of the product in the way it will lie in the box.' },
        { name: 'Set quantity and padding', text: 'Choose how many go in one box and the padding per side: 5, 10 or 20 mm, or your own.' },
        { name: 'Pick the use and board', text: 'Choose mailer, shipper, food or gift, and the ply, so the outside size and the 3D style are right.' },
        { name: 'Open it in 3D', text: 'Use the inside size in the designer or in a quote. Say "inside size" when you order.' },
      ],
    },
    faqs: [
      { question: 'What is the difference between inside and outside box size?', answer: 'Inside size is the space for the product. Outside size is bigger by the board thickness on each side. Box makers usually quote inside size, but always confirm which one you are giving, because a mix-up is a common cause of a box that does not fit.' },
      { question: 'How much padding should I leave?', answer: 'It depends on the product. A sturdy item may need only 5 mm per side; breakable goods need more cushioning, often 20 mm or more with a filler. Start with the preset that matches your product and test with a sample.' },
      { question: 'How do I size a box for several products?', answer: 'The calculator tries the neat grids (1 x N, 2 x N and so on) and picks the one with the smallest volume. Padding is left between items too. Enter the quantity per box and read the inside size it gives.' },
      { question: 'Why is fill efficiency shown?', answer: 'Fill efficiency is the share of the box the product takes up. A low figure means empty space, which can raise shipping cost if you are billed on volumetric weight. Very high means little protection.' },
      { question: 'Can I order the size it gives me?', answer: 'Yes. Open it in 3D to check the look and the dieline, or send it as a quote request. Outside size depends on the board, so confirm the final size with us before you print or order a large run.' },
    ],
    relatedBlogs: ['find-right-box-size', 'box-measurements-guide', 'which-box-style-should-you-choose', 'clothing-saree-footwear-boxes'],
    relatedTools: ['volumetric-weight-calculator', 'box-strength-calculator', 'packaging-cost-calculator'],
  },
  {
    slug: 'box-strength-calculator',
    path: '/tools/box-strength-calculator',
    name: 'Box Strength (BCT) Calculator',
    summary: 'Estimate box compression strength with the McKee formula and how many boxes you can stack.',
    metaTitle: 'Box Compression Strength Calculator | McKee Formula, BCT and Stacking',
    metaDescription:
      'Free box compression strength calculator using the simplified McKee formula: enter size, ECT and board thickness to estimate BCT, safe load and how many boxes you can stack. Indicative only.',
    keywords: ['box compression strength calculator', 'mckee formula calculator', 'how many boxes can I stack', 'BCT calculator', 'ECT to BCT', 'corrugated box stacking strength'],
    h1: 'Box Compression Strength Calculator (McKee Formula)',
    answer:
      'Box compression strength (BCT) is the load a box can take on top before it crushes. The simplified McKee formula estimates it from board edge crush (ECT), board thickness and the box perimeter. Divide by a safety factor to get a safe stacking load. It is a quick estimate, not a rating; confirm with a lab test.',
    formula: 'BCT (lbf) = 5.87 x ECT (lb/in) x sqrt(caliper (in) x perimeter (in)).  Safe load = BCT x (1 - openings loss) / safety factor.',
    formulaNote: 'Indicative only. 1 kN/m = 5.71 lb/in. Real strength also depends on humidity, time under load, pallet pattern and print. The openings penalty is an editable guess (VERIFY-LATER[MKT-06]).',
    example: {
      title: 'ECT 32 lb/in, caliper 0.125 in, perimeter 56 in',
      steps: [
        'sqrt(0.125 x 56) = sqrt(7) = 2.646.',
        'BCT = 5.87 x 32 x 2.646 = about 497 lbf, or about 225 kgf.',
        'Divide by a safety factor of 4: about 56 kg safe load on the bottom box.',
        'If each filled box weighs 10 kg, the bottom box can carry 5 above it: 6 boxes high.',
      ],
      result: 'About 497 lbf crush strength, roughly 6 boxes high at 10 kg each. Test a real sample before you rely on it.',
    },
    howTo: {
      name: 'How to estimate box compression strength',
      steps: [
        { name: 'Enter the box size', text: 'Type the inside length and width (and height if you know it).' },
        { name: 'Pick the board', text: 'Choose 3, 5 or 7-ply for typical values, or enter your own ECT and board thickness.' },
        { name: 'Set weight and safety factor', text: 'Add the weight of one filled box and a safety factor: 3 for dry short storage, 4 as a default, 5 for humid or long storage.' },
        { name: 'Read the stack', text: 'See estimated BCT, safe load and boxes high, and compare 3, 5 and 7-ply at your size.' },
      ],
    },
    faqs: [
      { question: 'What is the McKee formula?', answer: 'It is a simple formula that estimates the top-to-bottom crush strength of a box from the board\'s edge crush test (ECT), board thickness and the box perimeter. It is a quick design estimate, not a certified rating.' },
      { question: 'How accurate is this estimate?', answer: 'It is a guide. Hand holes, vents, humidity, stacking time, pallet overhang and print all change the real number, and published guidance says the same: confirm with a compression test in a lab before a big order.' },
      { question: 'What safety factor should I use?', answer: 'Use a higher factor for humid places or long storage because boards lose strength with moisture and time under load. 3 suits dry short storage, 4 is a sensible default and 5 suits humid or long storage. Pick the one that matches your case.' },
      { question: 'How many boxes can I stack?', answer: 'Enter the weight of one filled box. The bottom box carries every box above it, so boxes high = safe load divided by box weight, rounded down, plus the bottom box. The calculator also limits the stack to a reachable height.' },
      { question: 'Does a bigger box mean a stronger box?', answer: 'Not always. A longer perimeter raises the McKee figure a little, but taller boxes buckle more easily and heavier contents add load. Board grade and the number of plies usually matter more, so compare 3, 5 and 7-ply in the table.' },
    ],
    relatedBlogs: ['box-stacking-strength-guide', 'burst-strength-ect-guide', 'corrugated-wall-differences', 'flute-types-guide'],
    relatedTools: ['cbm-calculator', 'box-weight-calculator', 'box-size-calculator'],
  },
  {
    slug: 'box-weight-calculator',
    path: '/tools/box-weight-calculator',
    name: 'Corrugated Box Weight and Paper Cost Calculator',
    summary: 'Blank size, weight per box and paper cost from GSM, flute and your own paper rates.',
    metaTitle: 'Corrugated Box Weight Calculator | Carton Weight and Paper Cost from GSM',
    metaDescription:
      'Free corrugated box weight calculator: size, ply and GSM per layer to blank size, box weight and paper cost per box. You type the paper rates; none are assumed. For wholesalers and manufacturers.',
    keywords: ['corrugated box weight calculator', 'carton box weight formula', 'corrugated box cost calculation', 'corrugated box paper cost', 'box weight from GSM', 'blank size calculator RSC'],
    h1: 'Corrugated Box Weight and Paper Cost Calculator',
    answer:
      'Corrugated box weight is the blank\'s area times the paper weight (GSM) of each layer, with fluted layers counted longer because the flute waves take up extra paper. Multiply by your own paper rate per kg to get the paper cost. Enter box size, ply and GSM below; no default rates are assumed.',
    formula: 'Blank = (2 x (L + W) + joint) x (H + W) mm.  Weight (g) = area (m2) x sum of GSM x take-up per layer.',
    formulaNote: 'Regular slotted carton (RSC). Take-up factors and the example GSM values are typical ranges and are editable (VERIFY-LATER[MKT-19]). Not a price quote: conversion, printing, wastage and margin are extra.',
    example: {
      title: 'A 400 x 300 x 250 mm 3-ply box, 150 / 120 / 150 GSM',
      steps: [
        'Blank length: 2 x (400 + 300) + 35 joint = 1,435 mm. Blank width: 250 + 300 = 550 mm.',
        'Area: 1.435 x 0.55 = 0.789 m2.',
        'Paper per m2: 150 + 120 x 1.35 (B flute take-up) + 150 = 462 g.',
        'Weight: 0.789 x 462 = about 365 g per box.',
      ],
      result: 'About 365 g of paper per box. Enter your own rate for each layer and the paper cost appears; the tool never assumes a rate.',
    },
    howTo: {
      name: 'How to calculate corrugated box weight and paper cost',
      steps: [
        { name: 'Enter the box size', text: 'Type length, width and height. The tool works out the RSC blank size with your joint allowance.' },
        { name: 'Pick the ply', text: 'Choose 3, 5 or 7-ply. The layers fill in with example GSM and typical flute take-up.' },
        { name: 'Edit the layers', text: 'Change the GSM and flute of each layer to match your paper. Add your paper rate per kg for each layer.' },
        { name: 'Read weight and cost', text: 'See blank size, weight per box, paper cost per box, order total and cost per kg of box.' },
      ],
    },
    faqs: [
      { question: 'How do I calculate the weight of a corrugated box?', answer: 'Work out the blank area, then add up the paper weight of each layer in grams per square metre, counting fluted layers longer by their take-up factor. Multiply the area by that total. The calculator does each step and shows the layers.' },
      { question: 'What is flute take-up?', answer: 'The fluted medium is wavy, so it uses more paper than a flat sheet of the same width. Take-up is that extra length, for example 1.35 means 35% more paper. Typical values depend on the flute; yours may differ, so edit it.' },
      { question: 'Why are there no default paper rates?', answer: 'Paper prices change often and differ by mill, grade and quantity, so we do not show any as fact. Type your own rate per kg for each layer; the cost appears only when every layer has one.' },
      { question: 'Is this the price I will pay for a box?', answer: 'No. It is paper cost only, plus an optional add-on you type. Conversion, printing, tooling, wastage and margin are not included. For a market-style indicative price, use the estimate in the 3D box designer.' },
      { question: 'Can I use it for boxes other than RSC?', answer: 'The blank formula is for a regular slotted carton. Other styles need a different blank, so for those use the weight as a rough guide or open the style in the designer to see its dieline.' },
    ],
    relatedBlogs: ['gsm-calculation-strength', 'kraft-paper-grades', 'flute-types-guide', 'box-price-estimate-guide'],
    relatedTools: ['box-strength-calculator', 'packaging-cost-calculator', 'box-size-calculator'],
  },
  {
    slug: 'packaging-cost-calculator',
    path: '/tools/packaging-cost-calculator',
    name: 'Packaging Cost per Order Calculator',
    summary: 'Compare cost per order with your current box and a smaller one, with monthly saving and payback.',
    metaTitle: 'Packaging Cost per Order Calculator | Right-Size Your Box and Cut Shipping Cost',
    metaDescription:
      'Free packaging cost per order calculator: box, tape, filler, courier and damage costs for your current box and a smaller one. See monthly saving and payback. Your numbers only; nothing is stored.',
    keywords: ['packaging cost per order calculator', 'reduce shipping cost box size', 'cost per order calculator ecommerce', 'right size packaging savings', 'packaging cost calculator India'],
    h1: 'Packaging Cost per Order Calculator',
    answer:
      'Packaging cost per order is the box, tape, filler and labels, plus shipping, plus the cost of damage. A smaller box often lowers the shipping line when volumetric weight is what you are billed. Enter your own numbers to compare your current box with a smaller one and see the monthly saving.',
    formula: 'Cost per order = box + extras + billed kg x rate per kg + damage % x cost per damaged order.',
    formulaNote: 'Every figure is yours; we supply formulas only and no benchmarks. Billed kg is the larger of actual and volumetric weight, rounded up to your slab. Real rate cards differ (VERIFY-LATER[MKT-04]).',
    example: {
      title: 'Example numbers (replace them with yours)',
      steps: [
        'Current box 30 x 20 x 15 cm at Rs 20, extras Rs 5, parcel 1 kg, divisor 5000: volumetric 1.8 kg, billed 2 kg at Rs 50 per kg is Rs 100.',
        'With 2% damage at Rs 400 per damaged order, damage adds Rs 8. Total: Rs 133 per order.',
        'Proposed box 25 x 18 x 12 cm at Rs 16: volumetric 1.08 kg, billed 1.5 kg is Rs 75. Total: Rs 104.',
        'Saving: Rs 29 per order, Rs 29,000 a month on 1,000 orders.',
      ],
      result: 'Example only: Rs 29 less per order. Your saving depends on your rates, so use your own figures.',
    },
    howTo: {
      name: 'How to compare packaging cost per order',
      steps: [
        { name: 'Enter your orders and parcel', text: 'Add monthly orders and the packed weight of one parcel.' },
        { name: 'Enter your current box', text: 'Add its size, price, extras per order and damage rate.' },
        { name: 'Enter your courier numbers', text: 'Add your rate per kg, the weight slab and the divisor from your rate card.' },
        { name: 'Try a smaller box', text: 'Enter the proposed size and price (or use an indicative estimate) and read the saving and payback.' },
      ],
    },
    faqs: [
      { question: 'How do I calculate packaging cost per order?', answer: 'Add the box price, tape, filler, label and inserts, then your shipping charge for the parcel, then the expected cost of damage (damage rate x cost of one damaged order). The calculator does this for your current and proposed box.' },
      { question: 'Will a smaller box really cut my shipping cost?', answer: 'It can, when you are billed on volumetric weight rather than actual weight. If your parcels are heavy and compact, the actual weight sets the bill and a smaller box saves little. The calculator shows which one applies.' },
      { question: 'What numbers do I need?', answer: 'Your monthly orders, packed weight, box prices, tape and filler cost, your courier rate per kg and slab, the divisor on your rate card, and how often orders are damaged. All are typed by you; nothing is assumed.' },
      { question: 'What is payback?', answer: 'Payback is how many months of savings cover a one-off switching cost, such as new tooling or leftover stock. Enter that cost and the monthly saving divides it. If there is no saving, no payback is shown.' },
      { question: 'Where does the indicative box price come from?', answer: 'The "use indicative price" button asks the same estimator as the 3D box designer for a plain regular slotted carton. It is a guide, not a quote, so get an exact quote for the final price.' },
    ],
    relatedBlogs: ['packaging-mistakes-small-business', 'box-price-estimate-guide', 'ecommerce-mailer-box-unboxing', 'find-right-box-size'],
    relatedTools: ['volumetric-weight-calculator', 'box-size-calculator', 'box-weight-calculator'],
  },
];

export const TOOL_ROUTES: string[] = [TOOLS_INDEX_PATH, ...TOOL_PAGES.map((t) => t.path)];

export const getToolPage = (slug: string | undefined): ToolPage | undefined => TOOL_PAGES.find((t) => t.slug === slug);
