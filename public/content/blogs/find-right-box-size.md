---
title: "Right Box Size for Your Product: Padding and Fit Checker"
slug: "find-right-box-size"
description: "Work out the right box size for your product: padding, ease and inside size, using the fit checker in mm, cm or inches. Try it free in the 3D Box Designer."
category: "Designer Guides"
date: "2026-10-26"
updated: "2026-10-27"
readingTime: "8 min read"
author: "Vayu Packaging Team"
thumbnail: "BLOG-DG-03-thumbnail"
socialImage: "BLOG-DG-03-social"
---

# Right Box Size for Your Product: Padding and Fit Checker

The most expensive box is the one that does not fit. Too small and the product will not go in, or bulges the walls. Too big and you pay for board you do not need, for void fill to stop the product rattling, and often for a higher courier weight slab.

Getting the size right is not hard once you know three things: **which dimensions to measure**, **how much room to leave**, and **which numbers the box maker actually needs**. This guide covers all three and shows how the **fit checker** in the free 3D Box Designer does the arithmetic for you.

[Open the fit checker in the designer](/box-designer)

---

## Inside vs outside dimensions: the mistake behind most wrong boxes

Corrugated board has thickness. A 3-ply board is roughly 3 mm thick, a 5-ply board roughly 6-7 mm and a 7-ply board around 10 mm (indicative; it depends on the flutes). So every box has two sizes:

- **Inside dimensions:** the space available for your product. This is what matters to you.
- **Outside dimensions:** the space the box takes on a shelf, in a courier bag or on a pallet. This is what matters for shipping and storage.

<!-- VERIFY-LATER[BLOG-22]: board thicknesses are indicative (from src/lib/boxDesigner/boardSpecs.ts: B flute 3-ply about 2.8 mm, B+C 5-ply about 6.6 mm, C+B+C 7-ply about 10 mm); confirm against our usual paper and flute combinations. -->

For a regular slotted carton, the outside length and width are each about **two board thicknesses** bigger than the inside, and the outside height is about **four thicknesses** bigger, because the top and bottom each have two layers of flap.

**The rule:** always order by **inside** dimensions, and write "ID" (inside dimensions) next to them. The 3D Box Designer always treats the numbers you enter as inside dimensions and shows the outside size for you.

If you want the full background on measuring an existing box, read [how to measure corrugated boxes](/blogs/box-measurements-guide).

---

## Length, width, height: the order matters

Box sizes are written **L × W × H** (length × width × height), sometimes L × B × H with B for breadth:

- **Length** is the longer side of the opening.
- **Width** is the shorter side of the opening.
- **Height** is the depth, measured from the opening to the bottom.

A 300 × 200 × 150 box and a 300 × 150 × 200 box hold the same volume but are completely different boxes: one opens wide and shallow, the other narrow and deep. Decide which way up your product goes in, then measure in that orientation. The designer follows the trade convention and keeps length the longer of the two opening sides.

---

## mm, cm or inches?

Use whatever you measured in; just do not mix them. In the designer you can switch between **mm, cm and inches** at any time and the box does not change, only the numbers shown.

| | Good for | Typical precision |
|---|---|---|
| **mm** | Box makers' drawings and quotes, tight fits | Whole millimetres |
| **cm** | Most product listings and e-commerce | One decimal (e.g. 26.5 cm) |
| **inches** | Older specs, imported products, some export buyers | Quarter or hundredth inch |

**Handy conversions:** 1 inch = 25.4 mm; 10 mm = 1 cm. A 12 × 10 × 8 inch box is about 305 × 254 × 203 mm.

A tip for teams: agree one unit for all your specs. A surprising number of wrong orders come from a size quoted in inches being read as centimetres.

![The size panel with the unit switch set to inches and the same box shown in inch values](/blog-images/designer/designer-units-inch.png)
*Switch units at any time. The box stays the same; only the numbers change.*

---

## How much room should you leave?

The product needs a little clearance to go in and come out, plus whatever protection you add around it.

1. **Ease:** a few millimetres so the product slides in without forcing. Without it, a box that is "exactly" the product size will often not close.
2. **Padding:** the space for bubble wrap, foam, paper fill or inserts, **on every side**. A product padded with 1 cm on each side needs a box 2 cm bigger in each direction.
3. **Fragile goods need more.** Glass, ceramics and electronics usually need thicker cushioning, so allow more padding per side.

As a starting point, the designer's fit checker uses about **1 cm of padding per side** for ordinary goods, and raises it to about **2.5 cm per side** when you tick "fragile". It then adds a small ease and rounds up to the nearest half centimetre. You can change the padding to suit your own packing.

<!-- VERIFY-LATER[BLOG-23]: padding defaults (1 cm, fragile minimum 2.5 cm) and the 0.3 cm ease are the fit checker's starting values (VERIFY-LATER DSG-15 in src/lib/boxDesigner/fit.ts); keep this paragraph in step if they change. -->

**When not to add padding:** if the product is already in its own retail carton, or several items fill the box tightly, use a very small padding and let the products support each other.

---

## Using the fit checker, step by step

1. Open the [3D Box Designer](/box-designer) and open the **fit checker** in the **Edit Box** tab.
2. Enter the product's **own** length, width and height. Measure the product, not an old box.
3. Set the **padding per side**, or tick **fragile** to use the fragile minimum.
4. Optionally enter the **weight**. The checker will then also suggest a ply (3, 5 or 7) that is comfortable for that weight.
5. Press **apply**. The inside size is set, the 3D box resizes, and the outside size is shown alongside.
6. Look at the box from a few angles. If your product has an odd shape, imagine it inside, or use the cut-away view to look inside the box.

![The fit checker with a product size, padding and fragile ticked, showing the recommended inside size](/blog-images/designer/designer-fit-checker.png)
*The fit checker turns your product size into a recommended inside size.*

### A worked example

You sell a boxed kitchen gadget that measures **24 × 16 × 9 cm**, not fragile.

- Padding 1 cm per side adds 2 cm in each direction; ease adds a few mm.
- 24 + 2 + 0.3 = 26.3, rounded up to **26.5 cm**
- 16 + 2 + 0.3 = 18.3, rounded up to **18.5 cm**
- 9 + 2 + 0.3 = 11.3, rounded up to **11.5 cm**

So the inside size is **265 × 185 × 115 mm** (about 10.4 × 7.3 × 4.5 inches). In 3-ply board the outside comes to roughly **271 × 191 × 126 mm**. That outside size is what your courier measures.

If the same gadget were fragile, the padding would rise to 2.5 cm a side and the inside size to about **295 × 215 × 145 mm**: noticeably larger, which is why it is worth deciding honestly how fragile your product is.

---

## Size and shipping cost

Couriers charge by the **greater of actual weight and volumetric weight**. Volumetric weight is the outside volume divided by a factor set by the courier (many use 5,000 for cm and kg, but check yours). Two consequences:

- **Every centimetre counts.** On a light product, a box 2 cm too big in each direction can push you into the next slab.
- **Check the outside size, not the inside.** The designer shows both, so you can test a few sizes against your courier's rate card before ordering.

The designer's sustainability note also compares your made-to-measure box with the nearest standard size that would hold the same contents, and shows the board saved. Less board usually means a lower price per box as well.

---

## Common sizing mistakes (and how to avoid them)

- **Copying an old box's outside size.** Your new box comes out smaller inside by two board thicknesses each way. Always quote inside dimensions.
- **Measuring the product without its packaging.** If the product goes in a pouch, retail carton or wrap first, measure that.
- **Forgetting the orientation.** Decide which way up the product goes before you measure height.
- **Rounding down.** Always round up. A box 2 mm too big works; one 2 mm too small does not.
- **Ignoring multiples.** If you pack 6 items, lay them out as they will go in (2 × 3? 3 × 2? stacked?) and measure the group.
- **Choosing size before style.** A mailer and an RSC of the same inside size have different outside sizes and blanks. Pick the style first: see [which box style should you choose](/blogs/which-box-style-should-you-choose).

---

## Frequently asked questions

### Should I give the box maker inside or outside dimensions?
Inside dimensions, clearly marked as inside. The box maker adds the board allowance for the style and board you choose.

### How much bigger than my product should the box be?
Enough for padding on every side plus a few millimetres of ease. For ordinary goods, about 1 cm a side is a common start; fragile goods need more. The fit checker does this calculation for you.

### Does the ply change the inside size?
No. The inside size stays what you entered; a thicker board makes the outside bigger. You can see this happen in the designer when you switch from 3-ply to 5-ply.

### What is the smallest or largest box the designer can show?
The designer models boxes from about 5 cm to 100 cm on each side. For bigger cartons, send us the size and we will quote it.

### Can I enter sizes in inches?
Yes. Switch the unit to inches; you can switch back to mm or cm at any time.

---

## Get the size right in two minutes

Measure your product, open the fit checker, tick "fragile" if it is, and apply. You will see the box at the right size with the outside dimensions ready for your courier.

[Find my box size](/box-designer)

**Keep reading:**
- [How to measure corrugated boxes: the complete L × B × H guide](/blogs/box-measurements-guide)
- [How to use the 3D Box Designer](/blogs/how-to-use-3d-box-designer)
- [Will my box stack? Box strength made simple](/blogs/box-stacking-strength-guide)
- [Instant box price estimates: what drives cost per box](/blogs/box-price-estimate-guide)
