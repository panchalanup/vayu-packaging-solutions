---
title: "How Many Kg Can a Corrugated Box Hold? Ply and Size"
slug: "how-many-kg-can-corrugated-box-hold"
description: "How many kg can a corrugated box hold? Contents and stacking limits for 3, 5 and 7-ply, with a McKee estimate and safety factor. A range, not a promise."
category: "Technical Guide"
date: "2026-10-27"
updated: "2026-10-27"
readingTime: "8 min read"
author: "Vayu Packaging Team"
thumbnail: "BLOG-N2-04-thumbnail"
socialImage: "BLOG-N2-04-social"
---

# How Many Kg Can a Corrugated Box Hold? Ply and Size

There is no single figure, because a box has two limits: the weight you can pack inside and the weight that can sit on top. As a starting guide, 3-ply suits about 8 kg of contents, 5-ply about 20 kg and 7-ply about 40 kg. These are ranges to test with a packed sample, not promises.

*Last checked: October 2026. Every figure here is an estimate from a simplified formula with typical board values.*

[Check your box weight and stack height](/tools/box-strength-calculator)

"How much can it hold?" sounds like a simple question and gets a simple, wrong answer from most websites: a single number per ply. The honest answer is a range that moves with the board, the box size, how the box is stacked, how damp the room is and how long the load sits there. This guide gives you the starting numbers, shows the method behind them so you can check it, and explains what pushes a box above or below the range.

## Two different questions

| | Contents weight | Stacking load |
|---|---|---|
| **The question** | How heavy can the product be inside one box? | How much can sit on the bottom box? |
| **What fails** | Bottom tears, handle holes rip, walls bulge, box is hard to lift | Walls buckle and the stack leans or collapses |
| **What decides it** | Ply, flute, tape and closure, handling | Edge crush of the board (ECT), thickness, box perimeter |
| **Where you see it** | A packer lifting the box, a courier dropping it | A godown, a pallet, a truck |

Most people asking "how many kg" mean the first one. Most failures that are expensive happen in the second.

## A starting guide for contents weight

The 3D Box Designer uses these as comfortable maximum contents per box, and they match the wall guide on this site.

| Board | Construction | Comfortable contents (starting guide) |
|---|---|---|
| 3-ply | Single wall | up to about 8 kg |
| 5-ply | Double wall | up to about 20 kg |
| 7-ply | Triple wall | up to about 40 kg |

<!-- VERIFY-LATER[BLOG-409]: the 8 / 20 / 40 kg contents guide is the designer's placeholder (CONTENT_LIMIT_KG, VERIFY-LATER DSG-14) and the same one used in corrugated-wall-differences (BLOG-200). Confirm against the boards Vayu actually runs before presenting it as more than a starting guide. -->

If a product is rigid and fills the box, you can often go a little higher. If it is loose, heavy for its size or dense in one corner, go lower or up a ply. For fragile goods the designer adds 25 per cent headroom before suggesting a ply. Weigh a packed unit first; the weight of the product alone is not the weight of the box.

## How the stacking estimate works

Box makers estimate how much a box can carry from the top with the **McKee formula**. It needs three numbers: the board's edge crush strength (ECT), the board's thickness (caliper) and the box's outside perimeter.

> **Box compression strength (BCT) = 5.87 x ECT x the square root of (caliper x perimeter)**

Use ECT in N/mm (the same number as kN/m), caliper and perimeter in millimetres, and the result is in newtons. Divide by 9.81 to read it as kilograms-force.

Two points stop people misreading it:

- **It is a laboratory-style number.** It describes a new, dry, empty box under a short load.
- **Real stacks are harder on boxes,** so you divide by a **safety factor**: about 3 for dry, short storage, 4 as a default, 5 or more for humid places or long storage.

The [stacking guide](/blogs/box-stacking-strength-guide) explains ECT and BCT in plain words, and the [burst and ECT guide](/blogs/burst-strength-ect-guide) explains why burst strength is not in the formula.

### A worked example

A box with an inside size of 40 x 30 x 25 cm in 5-ply (B + C flute), using the designer's typical values:

1. **Board:** about 6.6 mm thick, with a typical ECT of 7.5 kN/m.
2. **Outside perimeter:** the inside is 40 x 30 cm, and the board adds about 0.66 cm on each side, so the perimeter is about 2 x (41.3 + 31.3) = 145 cm, or about 1,450 mm.
3. **Square root:** 6.6 x 1,450 = 9,570, and its square root is about 98.
4. **Crush strength:** 5.87 x 7.5 x 98 = about 4,310 N, or about 440 kgf.
5. **Safe load with a factor of 4:** about 110 kg on the bottom box.

<!-- VERIFY-LATER[BLOG-410]: the ECT values behind these numbers (3-ply 4.5, 5-ply 7.5, 7-ply 11 kN/m) are the designer's typical placeholders (VERIFY-LATER DSG-12) and the safety factor 4 is DSG-13. Re-run the designer logic and update every number in this section if they change. -->

That agrees with the worked example in the stacking guide. The free [box strength calculator](/tools/box-strength-calculator) lets you try your own ECT, thickness and safety factor.

## Estimates by ply and size

Here is the designer's estimate for a plain box (no vents, hand holes or windows) at three inside sizes, using the typical board for each ply and a safety factor of 4.

| Inside size | 3-ply crush / safe load | 5-ply crush / safe load | 7-ply crush / safe load |
|---|---|---|---|
| 25 x 20 x 15 cm | about 137 / 34 kg | about 356 / 89 kg | about 666 / 166 kg |
| 40 x 30 x 25 cm | about 170 / 42 kg | about 439 / 110 kg | about 817 / 204 kg |
| 60 x 40 x 40 cm | about 203 / 51 kg | about 522 / 131 kg | about 969 / 242 kg |

Read it in two ways. **Down a column,** a bigger box is a little stronger, because a longer perimeter helps, but only with the square root: it is not proportional to size. **Across a row,** the ply matters far more than the size: a 5-ply box at the smallest size here is stronger than a 3-ply box at the largest.

Notice also that the safe load is not the contents limit. A 3-ply box at 40 x 30 x 25 cm could carry about 42 kg on top of it by this estimate, but you would still not pack 42 kg inside it, because the bottom and the lifting would fail first. Both limits apply, and the lower one decides.

## From safe load to stack height

The bottom box carries every box above it. So:

> Boxes high = (safe load / weight of one packed box, rounded down) + 1

The designer also caps the stack at about 2 m, a sensible hand-stacking height. For the 40 x 30 x 25 cm example:

| Board | Packed box weight | Safe load | Stack | Limited by |
|---|---|---|---|---|
| 3-ply | 8 kg | about 42 kg | 6 high | Load |
| 5-ply | 10 kg | about 110 kg | 7 high | Height |
| 5-ply | 20 kg | about 110 kg | 6 high | Load |
| 7-ply | 40 kg | about 204 kg | 6 high | Load |

When the stack is limited by height, the board is not the problem; reach is. When it is limited by load, a stronger board or a lighter box moves the number.

![The strength guidance panel showing a 15 kg box in 5-ply rated good, stack 6 high](/blog-images/designer/designer-strength-panel.png)
*The designer's strength guidance: enter the weight per box and read a plain-language verdict.*

## What lowers a box's capacity

The estimate assumes a clean box in good conditions. In practice, take away from it for each of these:

- **Humidity.** Paper absorbs moisture and weakens, and monsoon storage can cost a box a large share of its strength. Use a factor of 5 for damp or long storage.
- **Time under load.** A box that holds a weight for weeks fails at a lower load than one tested for a minute.
- **Hand holes and vents.** They remove board from the walls that carry the load. The designer warns that they can cut stacking strength by roughly 10 to 40 per cent, depending on size, position and number. See [vents, hand holes and windows](/blogs/vents-hand-holes-windows-box-design). <!-- VERIFY-LATER[BLOG-411]: the 10 to 40 per cent loss range is the designer's warning range (VERIFY-LATER DSG-72), taken from produce-packaging literature, not a measurement of Vayu boxes. Confirm, and confirm what compression test data Vayu can supply on request. -->
- **Overhang and misalignment.** Boxes that hang over the pallet edge, or are stacked in a brick pattern, lose strength. Stack corner on corner and keep boxes within the pallet.
- **Soft contents.** A rigid product that fills the box shares the load. Soft or loose contents give no help.
- **Poor closure.** A bottom taped along the centre seam only will let go before the board does for a heavy product. Tape the seam and both edges, and use a stronger board for heavy loads.

## How to find your own number

1. **Weigh one packed box,** in kilograms.
2. **Pick the ply** from the contents guide, and go up a ply if the weight is near the top of its range or the goods are fragile.
3. **Run the estimate** in the strength calculator or the designer, with your inside size.
4. **Choose a safety factor** that suits your storage: 3, 4 or 5.
5. **Read the stack height** and compare it with your racks, pallets or truck.
6. **Test a real sample** if the load is valuable, heavy or critical, by packing it, stacking it and leaving it for a few days. A simple check of your own is not a certified test; ask what compression test data is available if the number matters contractually.

## What this number is not

It is not a rating, a guarantee or a promise that a box "will hold X kg". It is an estimate from a simplified formula using typical board values, and real boards vary by paper, flute and batch. The [GSM and BF guide](/blogs/gsm-calculation-strength) explains why two boxes both sold as "5-ply" can differ, and [reading a box spec](/blogs/reading-box-spec-ply-bf-gsm) shows what to ask for.

## Frequently asked questions

### How many kg can a 3-ply box hold?

As a starting guide, about 8 kg of contents. The designer treats that as comfortable for single-wall board. A rigid product that fills the box can go a little higher; for heavier or fragile goods, go up to 5-ply.

### How much weight can a 5-ply box carry?

About 20 kg of contents is a comfortable starting guide, and in the estimate for a 40 x 30 x 25 cm box the bottom box can carry roughly 110 kg on top with a safety factor of 4. Both are estimates, so test a sample for anything valuable.

### Do I need 7-ply for 40 kg?

It is the usual starting point at that weight: the designer treats about 40 kg as comfortable for triple wall. Heavy, dense contents such as tiles or machine parts need extra care, including strapping, corner protection and a test.

### Does a bigger box hold more?

Not in proportion. A longer perimeter raises the McKee figure a little, because of the square root, but taller boxes buckle more easily and heavier contents add load. The ply matters more than the size.

### What safety factor should I use?

Use 3 for dry, short storage, 4 as a sensible default and 5 or more for humid places or long storage. Choose the one that matches how you actually store the boxes.

## Check your own box

Enter your box size and the weight of one packed box. If the verdict says light, try the next ply and compare the estimate. It takes under a minute.

[Open the strength calculator](/tools/box-strength-calculator), [check it in the 3D designer](/box-designer?style=rsc&l=40&w=30&h=25&ply=5-ply&fl=BC), [get a quote](/quote?product=5-ply&qty=500-1k&l=400&w=300&h=250&src=blog.how-many-kg-can-corrugated-box-hold), or [WhatsApp us your box weight and size](https://wa.me/918511658600?text=Hi%20Vayu%2C%20I%20read%20your%20guide%20on%20how%20many%20kg%20a%20box%20can%20hold.%20My%20packed%20box%20weighs%20__%20kg%2C%20inside%20size%20__%20x%20__%20x%20__%20cm%2C%20stacked%20__%20high.%20Please%20suggest%20a%20ply.%20City%20__.).

**Keep reading:**
- [Will my box stack? BCT, ECT and stack height](/blogs/box-stacking-strength-guide)
- [Single wall vs double wall vs triple wall](/blogs/corrugated-wall-differences)
- [Burst strength vs ECT](/blogs/burst-strength-ect-guide)
- [Reading a box spec: 5 ply, 18 BF, 120 GSM](/blogs/reading-box-spec-ply-bf-gsm)
