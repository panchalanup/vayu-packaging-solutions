---
title: "How Many Boxes Fit on a Pallet? Patterns and Heights"
slug: "how-many-boxes-fit-on-a-pallet"
description: "How many boxes fit on a pallet: count per layer, layers and stack height for a 1,200 x 1,000 mm pallet, with column, brick and pinwheel patterns worked out."
category: "Technical Guide"
date: "2026-10-28"
updated: "2026-10-28"
readingTime: "8 min read"
author: "Vayu Packaging Team"
thumbnail: "BLOG-P1-04-thumbnail"
socialImage: "BLOG-P1-04-social"
---

# How Many Boxes Fit on a Pallet? Patterns and Heights

Boxes per pallet is cartons per layer times layers. On a 1,200 x 1,000 mm pallet loaded 150 cm high, a 40 x 30 x 25 cm carton fits 9 per layer in a plain grid, or 10 with a mixed layout, over 6 layers: 54 to 60 cartons. Use the outside size of the carton.

[Open a 40 x 30 x 25 cm carton in 3D](/box-designer?style=rsc&l=40&w=30&h=25&ply=5-ply&fl=BC&src=blog.pallet.top)

*Last checked: October 2026. The pallet size and the 150 cm load height are common planning figures we assumed. Confirm both with your carrier or warehouse.*

---

## The formula

For one layer on a pallet of length P and width Q, with a carton footprint of a x b (cm):

**Per layer = (P / a, rounded down) x (Q / b, rounded down)**, then try the carton turned 90 degrees and keep the larger count.

**Layers = load height / carton height, rounded down.**

**Cartons per pallet = per layer x layers.**

Worked example, a 50 x 40 x 30 cm carton on 120 x 100 cm with a 150 cm load height:

- Carton lengthwise along 120 cm: 120 / 50 = 2.4, so 2. Across 100 cm: 100 / 40 = 2.5, so 2. That is 4 per layer.
- Turned: 120 / 40 = 3 and 100 / 50 = 2. That is 6 per layer, and it uses the whole floor (6 x 50 x 40 = 12,000 cm2).
- Layers: 150 / 30 = 5.
- **6 x 5 = 30 cartons**, a block of 1.8 CBM (30 x 0.06).

The [CBM article](/blogs/cbm-calculator-cartons-per-container) works the same sums for containers, and the free [CBM calculator](/tools/cbm-calculator) does the counting for you.

<!-- VERIFY-LATER[BLOG-512]: 120 x 100 cm is a commonly used pallet footprint and 150 cm a commonly used load height (both are editable defaults in the CBM calculator and the designer, see MKT-05 and DSG-63). Confirm which pallets and height limits Vayu's customers and their carriers actually use. -->

---

## Boxes per pallet for common sizes

All sizes are **outside** sizes of the closed carton, a 120 x 100 cm pallet and 150 cm of cartons above the deck. "Mixed" means a layout that mixes two orientations in blocks, checked by a short script, not a drawing. A simple grid has every carton the same way round.

| Carton (cm) | Per layer, grid | Per layer, mixed | Layers | Per pallet, grid | Per pallet, mixed | Open in 3D |
|---|---|---|---|---|---|---|
| 30 x 20 x 15 | 20 | 20 | 10 | 200 | 200 | [Open](/box-designer?style=rsc&l=30&w=20&h=15&ply=3-ply&fl=B&src=blog.pallet.row) |
| 40 x 25 x 25 | 12 | 12 | 6 | 72 | 72 | [Open](/box-designer?style=rsc&l=40&w=25&h=25&ply=5-ply&fl=BC&src=blog.pallet.row) |
| 40 x 30 x 25 | 9 | 10 | 6 | 54 | 60 | [Open](/box-designer?style=rsc&l=40&w=30&h=25&ply=5-ply&fl=BC&src=blog.pallet.row) |
| 50 x 40 x 30 | 6 | 6 | 5 | 30 | 30 | [Open](/box-designer?style=rsc&l=50&w=40&h=30&ply=5-ply&fl=BC&src=blog.pallet.row) |
| 60 x 40 x 40 | 4 | 5 | 3 | 12 | 15 | [Open](/box-designer?style=rsc&l=60&w=40&h=40&ply=7-ply&fl=CBC&src=blog.pallet.row) |

Each link opens that size as an **inside** size, so the outside in the 3D view is a little bigger. Treat the table as a planning aid: the 3D designer's own pallet scene (below) uses the real outside size of the closed box.

The same cartons on a 120 x 80 cm pallet (grid counts, 150 cm load height) give 16, 9, 8, 4 and 4 per layer for the five sizes, so a pallet that is 20 cm narrower can cost up to a third of each layer (the 50 x 40 cm carton drops from 6 to 4 per layer). The arithmetic is the same, so recompute for whichever pallet your carrier uses.

---

## The outside-size trap

Box makers and the designer quote **inside** sizes. A pallet is filled with the **outside**, which is bigger by the board thickness on each side. For a 5-ply carton of about 6.5 mm board, a 40 x 30 cm inside footprint is about 41.3 x 31.3 cm outside.

| Footprint | Grid per layer | Mixed per layer |
|---|---|---|
| 40 x 30 cm (nominal) | 9 | 10 |
| 41.3 x 31.3 cm (outside of a 40 x 30 inside, 5-ply) | 6 | 8 |
| 40 x 25 cm (nominal) | 12 | 12 |
| 41.3 x 26.3 cm (outside of a 40 x 25 inside, 5-ply) | 8 | 8 |

The footprint grew by only 1.3 cm, yet a layer lost 3 cartons in a grid, a third of the count for the 40 x 25 example. Height matters too: if the closed carton is 27 cm tall instead of 25 cm, 150 / 27 = 5.5, so you get 5 layers instead of 6.

The fix is to design for the pallet. Say how many cartons per layer you want, and work back: for 12 per layer of 40 x 25 cm, the outside must stay at or under 40 x 25 cm, so the inside has to be about 38.7 x 23.7 cm. See [inside versus outside size](/blogs/box-measurements-guide).

<!-- VERIFY-LATER[BLOG-513]: the board thickness of about 6.5 mm for 5-ply is indicative (BLOG-203 and BLOG-312). Confirm the board thickness and outside size of the cartons Vayu actually makes before the table is used for a real pallet plan. -->

---

## Pallet patterns

How you place cartons changes stability and strength, not just the count.

| Pattern | What it is | Good for | Watch out for |
|---|---|---|---|
| **Column stack** | Every layer sits exactly on the one below, corner on corner | Strength: the walls carry the load straight down | A tall column can lean, so wrap it well |
| **Brick (interlocked)** | Layers are rotated so seams do not line up | Stability of the whole load | Corners no longer stack on corners, which loses compression strength |
| **Pinwheel** | Four blocks turned around a central gap or a small block | Awkward footprints, such as 60 x 40 cm on 120 x 100 cm | Can leave a hole in the middle |

The designer's pallet scene is a **column stack**, and it tries both orientations and keeps the one with more boxes per layer. It draws up to 400 boxes. That is the strongest pattern for compression, and a good first check. The [stacking strength guide](/blogs/box-stacking-strength-guide) explains why misalignment and overhang cost strength.

Keep every carton **inside the pallet edge**. Overhang bends the walls and loses strength.

![The pallet scene in the 3D designer showing identical cartons stacked in a column pattern on a pallet](/blog-images/designer/designer-pallet-view.png)
*The pallet scene in the designer's Showcase tab: a full pallet load at real proportions.*

---

## Weight, height and what holds the stack

The count is only half the story.

- **Weight per pallet** is cartons x gross weight of one carton. For 54 cartons of 12 kg, that is 648 kg. Check the pallet's load limit and your carrier's rules, which we do not state here.
- **Weight on the bottom layer** is what the bottom cartons carry. Use the [box strength calculator](/tools/box-strength-calculator) for an indicative stack height, and test a packed sample.
- **Height limits** differ by truck, rack and warehouse. 150 cm is a planning figure.
- **Load securing** keeps the stack together in transit. Stretch film wraps the load, strapping holds it down and corner boards protect the edges. See our [stretch film](/products/stretch-film) and [PP strapping](/products/pp-strapping) pages.
- **Moisture and time** weaken board, so a load that holds for a day may not hold for a month in a humid godown.

<!-- VERIFY-LATER[BLOG-514]: pallet load limits, carrier height limits and load-securing rules are not stated here. Confirm with Vayu's logistics contacts and add sourced numbers only if wanted. -->

---

## Fitting more on the pallet

1. **Pick a footprint that divides the pallet.** 40 x 25, 30 x 20 and 50 x 40 cm all fill 120 x 100 cm completely.
2. **Change one dimension by a centimetre or two.** A 39.8 x 29.8 cm footprint gives 9 in a grid and 10 mixed on 120 x 100 cm; 41.3 x 31.3 cm gives 6 and 8.
3. **Choose a height that divides the load height.** 25 cm gives 6 layers; 26 cm gives only 5.
4. **Use a mixed layout** where the product allows turned cartons. Printed "this side up" boxes may limit this.
5. **Check strength after you shrink.** A smaller footprint has a shorter perimeter and carries less. Test a packed sample.

The [standard box sizes chart](/blogs/standard-corrugated-box-sizes-india) lists sizes that divide a 120 x 100 cm pallet.

---

## Frequently asked questions

### How many boxes fit on a pallet?

It is cartons per layer times layers. On a 1,200 x 1,000 mm pallet loaded 150 cm high, a 50 x 40 x 30 cm carton gives 6 per layer and 5 layers, which is 30 cartons, and a 30 x 20 x 15 cm carton gives 200. Use the outside size of the closed carton.

### What is the standard pallet size in India?

1,200 x 1,000 mm is commonly used, and others such as 1,200 x 800 mm exist. Your carrier or warehouse sets the pallet you use, so confirm it before you plan a carton size.

### How do I calculate boxes per pallet?

Divide the pallet length by the carton length and the width by the carton width, rounding each down, then multiply for one layer. Try the carton turned 90 degrees. Divide the load height by the carton height, round down, and multiply the two.

### Which pallet pattern is the strongest?

A column stack, where cartons sit corner on corner, carries the load best. Brick patterns are more stable as a load but lose compression strength. For heavy stacks, test a packed sample.

### How high can I stack boxes on a pallet?

Height is set by the strength of the bottom cartons, the truck or rack, and your carrier's limit. In the designer, the strength panel gives an indicative stack height from the box and its weight, and 150 cm is a common planning height.

---

## Check your carton on a pallet

Open your size in the designer, switch to the **On a pallet** scene in the **Showcase** tab and count the layers. Then change a side and watch the count move.

[Open a 40 x 25 x 25 cm carton in 3D](/box-designer?style=rsc&l=40&w=25&h=25&ply=5-ply&fl=BC&src=blog.pallet.end) or [get a quote for this size](/quote?product=5-ply&qty=500-1k&l=400&w=250&h=250&src=blog.how-many-boxes-fit-on-a-pallet)

To get a quote, tap the WhatsApp button below this article and send the inside size, quantity and your city.

**Keep reading:**
- [CBM calculator: cartons per container](/blogs/cbm-calculator-cartons-per-container)
- [Box stacking strength guide](/blogs/box-stacking-strength-guide)
- [Export cartons: 5-ply or 7-ply](/blogs/export-cartons-5-ply-7-ply)
- [Cardboard vs corrugated vs duplex boxes](/blogs/cardboard-vs-corrugated-vs-duplex-boxes)
