---
title: "Will My Box Stack? BCT, ECT and Stack Height Explained"
slug: "box-stacking-strength-guide"
description: "Will my box stack? BCT, ECT and the McKee formula in plain words, plus how to raise stack height. Check your box strength in the 3D Box Designer."
category: "Designer Guides"
date: "2026-10-26"
updated: "2026-10-27"
readingTime: "8 min read"
author: "Vayu Packaging Team"
thumbnail: "BLOG-DG-08-thumbnail"
socialImage: "BLOG-DG-08-social"
---

# Will My Box Stack? BCT, ECT and Stack Height Explained

A box rarely fails because something hits it. It fails slowly, at the bottom of a stack: in a godown, on a pallet, in the back of a truck, under the weight of the boxes above it. The walls bow, the corners give way, and the whole stack leans.

Box makers talk about this with acronyms such as **BCT** and **ECT**, and a formula with a square root in it. You do not need any of that to make a good decision. You need to know roughly how much weight the bottom box can carry, and what makes that number go up or down.

This guide explains box strength in plain words and shows how the **strength guidance** in the free 3D Box Designer turns it into a one-line answer: *"Good for up to ~X kg per box, stack N high."*

[Check your box's strength](/box-designer)

---

## Two kinds of strength

Corrugated boxes need two different kinds of strength:

- **Resistance to puncture and bursting.** Can a sharp corner, a dropped parcel or an over-packed product push through the wall? This is measured by the **burst strength** test.
- **Resistance to crushing from above.** Can the box carry the weight stacked on top of it without collapsing? This is **compression strength**, and it is what decides how high you can stack.

For stacking, compression is what matters. Our [burst strength vs edge crush test guide](/blogs/burst-strength-ect-guide) covers both tests in depth.

---

## ECT and BCT in plain words

### ECT: how strong the board is
The **Edge Crush Test** takes a small strip of board, stands it on its edge and presses down until it crushes. The result is the load per unit length of edge the board can carry, for example kilonewtons per metre.

Think of ECT as **the strength of the material**. More plies, heavier papers and better flute combinations all raise it. 5-ply board has a much higher ECT than 3-ply; 7-ply higher again.

### BCT: how strong the box is
The **Box Compression Test** puts a whole empty box between two plates and presses until it fails. The result, in newtons or kilograms, is the most weight the box can take, briefly, in perfect lab conditions.

Think of BCT as **the strength of the box**. It depends on the board (ECT), but also on the size and shape of the box.

### How they connect
In the 1960s a packaging engineer named McKee found a simple relationship that is still used everywhere to **estimate** BCT from ECT:

> **Box strength ≈ 5.87 × board strength (ECT) × √(board thickness × box perimeter)**

You do not need to calculate this; the designer does. But the formula tells you three useful things:

1. **Stronger board means a stronger box**, roughly in proportion.
2. **Thicker board helps**, which is one reason 5-ply is so much stronger than 3-ply.
3. **A bigger perimeter helps too**, but only with the square root: double the perimeter and the box gets about 40% stronger, not twice as strong. The walls carry the load, especially at the corners.

---

## Why the lab number is not the stacking number

A BCT result is measured on a new, dry, empty box for a minute or two. Real life is harder on boxes:

- **Humidity.** Paper absorbs moisture from the air and gets weaker. Monsoon months in a godown can take a big share of a box's strength away.
- **Time.** A box holding a load for weeks fails at a lower load than one tested for a minute.
- **Pallet overhang and misalignment.** Boxes overhanging the pallet edge or stacked brick-pattern (not corner on corner) lose a lot of strength.
- **Handling.** Every knock and drop weakens corners a little.
- **Holes and cut-outs.** Hand holes and vents remove board from the walls that carry the load.

So the industry divides BCT by a **safety factor** to get the load a box can carry safely over time. A factor of about 3 is common for dry, short storage; 4 to 5 for humid conditions or long storage.

<!-- VERIFY-LATER[BLOG-29]: figures in this article use the designer's starting values in src/lib/boxDesigner/strength.ts: indicative ECT per ply (VERIFY-LATER DSG-12), safety factor 4 (DSG-13), comfortable maximum content per ply (DSG-14) and a 2 m hand-stacking cap. The worked example below must be re-run if those change. -->

---

## How the designer's strength guidance works

Open the **Price & order** tab in the designer and enter the **weight of one packed box**. The designer:

1. Takes the **board** you chose (ply and flute) and its thickness,
2. Takes the **outside perimeter** of your box from its size,
3. Estimates the box's **crush strength** with the McKee formula,
4. Divides by a **safety factor of 4** to get a safe load on the bottom box,
5. Works out **how many boxes high** you can stack before the bottom box is overloaded,
6. Caps that at a sensible **hand-stacking height** of about 2 m,
7. Gives you a one-line verdict, and **suggests a stronger ply** if your weight is too much for the board.

The answer reads like this: *"Good for up to ~15 kg per box, stack 6 high."* Underneath, a detail line tells you whether the stack is limited by the **load** (the board) or by the **height** (reach), and shows the crush strength and safe load it used.

![The strength panel showing a 15 kg box in 5-ply rated good, stack 6 high, limited by stack height](/blog-images/designer/designer-strength-panel.png)
*Strength guidance: enter the weight per box and get a plain-language verdict.*

### A worked example

You ship a **15 kg** product in a box **400 × 300 × 300 mm** inside.

- **In 3-ply:** the designer flags it straight away: 15 kg is heavy for 3-ply, try 5-ply. Even ignoring that, the estimated safe load on the bottom box is only around 40 kg, so you could stack about **3 high**.
- **In 5-ply (B+C flute):** estimated crush strength is roughly 440 kg; divided by 4 gives a safe load of about 110 kg. That is enough for about 8 boxes, but 8 boxes of this height would be taller than 2 m, so the verdict is **stack 6 high, limited by height**.

Same size, same product: switching the board changes the answer from "risky" to "comfortable". That is exactly the trade-off to see **before** you order. Pair it with the [estimate](/blogs/box-price-estimate-guide) to see what the stronger board costs.

### Stacked and pallet view
To picture it, switch on the **stacked / pallet view**. The designer repeats your box in a stack or on a pallet so you can see how tall six boxes really are, and whether that works for your racks or your truck.

![The pallet view in the designer showing identical 5-ply cartons stacked on a pallet](/blog-images/designer/designer-pallet-view.png)
*Pallet view: see your stack at real proportions.*

---

## How to make a box stack better

If the verdict is "light" or "overloaded", you have more options than just a heavier board:

1. **Go up a ply.** The most direct fix: 3-ply to 5-ply, or 5-ply to 7-ply. See [single, double and triple wall](/blogs/corrugated-wall-differences).
2. **Choose stronger papers.** Higher GSM liners and better grades raise ECT without changing the ply. Read the [GSM guide](/blogs/gsm-calculation-strength) and [virgin vs recycled kraft](/blogs/kraft-paper-grades).
3. **Make the box shorter.** Height does not reduce BCT much on its own, but a shorter box means more boxes for the same stack height. Sometimes that suits your racks better; sometimes it does not, so check both.
4. **Let the product help.** Products that fill the box and are rigid (tins, bottles in partitions) carry some of the load. Soft or loose products carry none.
5. **Stack corner on corner.** Column stacking (each box directly above the one below) keeps the strong corners in line. Brick stacking looks stable but costs strength.
6. **No overhang.** Keep boxes within the pallet edge.
7. **Keep it dry.** Store off the floor, away from walls and open doors in the monsoon.
8. **Avoid unnecessary cut-outs** in walls that carry load.

---

## Picking a ply quickly

As a rough starting point, before you run the numbers:

| Ply | Typical use |
|---|---|
| **3-ply (single wall)** | Light goods, e-commerce parcels, retail, short stacks |
| **5-ply (double wall)** | Heavier goods, appliances, warehouse stacking, most export cartons |
| **7-ply (triple wall)** | Industrial parts, machinery, bulk and very heavy loads |

Then let the strength guidance confirm it for **your** size and weight. If you are not sure what you need at all, the designer's **Find my box** mode asks about weight, fragility and how the box travels, and suggests a ply for you. See also [8 box styles in 3D](/blogs/box-styles-in-3d) for which styles stack best.

---

## Frequently asked questions

### What is the difference between ECT and BCT?
ECT measures the strength of the **board**; BCT measures the strength of the whole **box**. BCT depends on ECT plus the box's size and the board's thickness.

### Is the strength figure in the designer guaranteed?
No. It is an **indicative estimate** from a standard formula, using typical board values. Real strength depends on the exact papers, humidity and handling. If strength is critical, ask us what test data is available for the board you specify.

### Why is my stack limited by "height" and not by the board?
Because the board could carry more, but a stack taller than about 2 m is impractical to build by hand and risky to handle. The verdict caps it there.

### Does burst strength matter for stacking?
Not much. Burst strength matters for punctures and rough handling; compression (BCT) matters for stacking. Most buyers need a sensible level of both.

### What safety factor should I use?
The designer uses 4, which suits typical warehouse storage. For dry, short storage, 3 is common; for humid conditions or long storage, use 5 or more.

---

## Check your stack before you order

Enter your box size and the weight of one packed box. If the verdict says "light", try the next ply and compare the price. It takes under a minute.

[Open the strength guidance](/box-designer)

For heavy shipping cartons you can also start from a preset: [design a shipping carton](/box-designer/shipping-carton).

**Keep reading:**
- [Burst strength vs edge crush test: understanding box quality standards](/blogs/burst-strength-ect-guide)
- [Single wall vs double wall vs triple wall corrugated](/blogs/corrugated-wall-differences)
- [How to find the right box size for your product](/blogs/find-right-box-size)
- [How to use the 3D Box Designer](/blogs/how-to-use-3d-box-designer)
