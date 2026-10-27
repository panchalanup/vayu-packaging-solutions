---
title: "Reading a Box Spec: 5 Ply, 18 BF, 120 GSM Explained"
slug: "reading-box-spec-ply-bf-gsm"
description: "Decode a corrugated box spec line: what 5 ply, 18 BF and 120 GSM mean, what they leave out, and five questions to ask so quotes compare fairly."
category: "Technical Guide"
date: "2026-10-27"
updated: "2026-10-27"
readingTime: "7 min read"
author: "Vayu Packaging Team"
thumbnail: "BLOG-N2-05-thumbnail"
socialImage: "BLOG-N2-05-social"
---

# Reading a Box Spec: 5 Ply, 18 BF, 120 GSM Explained

In a box spec, 5 ply is the number of paper layers (three flat liners and two fluted layers), GSM is the weight of a paper in grams per square metre, and BF is its bursting factor: burst strength per 1,000 GSM. A line like "5 ply, 18 BF, 120 GSM" describes the papers, not the finished box.

*Last checked: October 2026. Spec conventions vary between suppliers, so treat this as a guide to the questions to ask.*

[Open a 5-ply box in 3D](/box-designer?style=rsc&l=40&w=30&h=25&ply=5-ply&fl=BC)

You ask for a 5-ply box and a supplier replies with a line of numbers: "5 ply, 18 BF, 120 GSM". It looks precise. In fact it leaves out as much as it says: which layers the numbers apply to, which flutes are inside, what the paper is made of and how the finished board tests. This guide decodes each part, shows the sums, and ends with the questions that turn a spec line into something you can compare.

It builds on two earlier guides, which have the definitions in more depth: [GSM and BF](/blogs/gsm-calculation-strength) and [burst strength vs ECT](/blogs/burst-strength-ect-guide). Here the focus is on reading a real quote.

## The spec line, decoded

| Part of the line | What it means | What it does not tell you |
|---|---|---|
| **5 ply** | Five paper layers: liner, flute, liner, flute, liner. Double wall | The flute heights, so the board thickness |
| **120 GSM** | Each quoted paper weighs 120 g per square metre | Whether it applies to the liners only or to every layer |
| **18 BF** | The paper bursts at 18 kg/cm2 for every 1,000 GSM | How the finished board tests; BF belongs to the paper |
| *(missing)* | Flute, paper type, board ECT and burst, size, print | Most of what decides strength and price |

<!-- VERIFY-LATER[BLOG-412]: the reading of a spec line "5 ply, 18 BF, 120 GSM" as paper-level figures, usually for the liners, is a convention to confirm, not a standard (see MKT-06). Confirm how Vayu writes its own spec lines before presenting this as how the trade reads them. -->

## "5 ply" in one paragraph

Ply counts the paper layers in the board. 3-ply is a single wall: two liners and one fluted layer between them. 5-ply is a double wall: three liners and two fluted layers. 7-ply is a triple wall, with four liners and three fluted layers. More layers make a thicker, stiffer board, and the designer models typical thicknesses of about 3 mm for 3-ply, 6 to 7 mm for 5-ply and 10 mm for 7-ply. Ask which flutes are used, because B and C together make a different board than C and C. The [wall guide](/blogs/corrugated-wall-differences) and [flute guide](/blogs/flute-types-guide) cover both.

## GSM: the weight of the paper

GSM is grams per square metre. A heavier paper has more fibre, so it is generally stiffer and costs more. Two things to know when you read it in a spec:

- **It describes a paper, not the box.** A finished board has several papers glued together, so its weight per square metre is higher than any single GSM figure.
- **It may apply to some layers or all of them.** "120 GSM" might mean 120 GSM liners with a lighter flute, or 120 GSM everywhere. Ask.

The flute layer is also wavy, so it uses more paper than a flat sheet of the same width. That extra is the take-up factor, roughly 1.3 to 1.5 for common flutes. The two readings give different boards:

| Reading of "120 GSM" | Liners | Fluting (take-up about 1.35) | Board weight |
|---|---|---|---|
| 120 on every layer | 3 x 120 = 360 | 2 x 120 x 1.35 = 324 | about 684 GSM |
| 120 liners, 100 fluting | 3 x 120 = 360 | 2 x 100 x 1.35 = 270 | about 630 GSM |

For a box whose flat blank is about 0.79 m2 (the 400 x 300 x 250 mm carton in the [box weight calculator](/tools/box-weight-calculator)), that is roughly 540 g against 500 g of paper per box. A small difference per box, but about 9 per cent in paper, and across thousands of boxes it adds up. <!-- VERIFY-LATER[BLOG-413]: the take-up factor of about 1.35 and the liner and fluting weights are illustrative (see BLOG-205, BLOG-206). Confirm the take-up factors and GSM combinations Vayu's corrugator actually uses before treating this table as typical. -->

## BF: how strong the paper is for its weight

BF stands for bursting factor. It is the paper's burst strength divided by its GSM, scaled by 1,000:

> BF = burst strength (kg/cm2) x 1,000 / GSM

So you can turn it around to find the burst strength the figure implies:

> Burst strength (kg/cm2) = BF x GSM / 1,000

For "18 BF, 120 GSM" that is 18 x 120 / 1,000 = **2.16 kg/cm2** for that paper. This is the same relationship as in the GSM guide, where a 150 GSM paper that bursts at 2.7 kg/cm2 has a BF of 18.

Here is why it matters when you compare. These two lines are made-up examples, not real quotes:

| Quote | Spec line | Implied paper burst |
|---|---|---|
| A | 5 ply, 120 GSM, 18 BF | 18 x 120 / 1,000 = 2.16 kg/cm2 |
| B | 5 ply, 100 GSM, 16 BF | 16 x 100 / 1,000 = 1.60 kg/cm2 |

Both are "5-ply". A is the stronger paper by about a third, and it is also heavier, so it will cost more. If B is cheaper, you now know why, and you can decide whether the box needs the extra.

## What BF does not mean

- **It is not the burst strength of the box.** BF belongs to a paper. The finished board has its own burst test and its own edge crush (ECT), and the two do not convert exactly.
- **It does not predict stacking.** Stacking depends mainly on ECT, thickness and perimeter, as the [stacking guide](/blogs/box-stacking-strength-guide) explains.
- **A higher number is not always better.** Past what you need, more BF is cost and weight.
- **There is no universal "good" BF.** It depends on the paper grade and what you pack. Ask the supplier what BF each layer in your quote actually has, and whether that is a typical or a guaranteed value.

## A fuller spec line

A line you can compare looks more like this (the blanks are values for the supplier to fill in):

```
5-ply, flute B + C
Liners: ___ GSM, BF ___, kraft / white top
Fluting: ___ GSM, BF ___
Board: ECT not less than ___ kN/m, burst not less than ___ kg/cm2
Inside size: ___ x ___ x ___ mm, style: ___
Print: ___ colours
```

The [burst and ECT guide](/blogs/burst-strength-ect-guide) explains why both board test figures are worth asking for, and what the units mean. <!-- VERIFY-LATER[BLOG-414]: confirm which paper and board figures Vayu can state per layer and per ply (GSM, BF, ECT, burst), whether they are typical or minimum values, and whether test reports can be supplied (see BLOG-207). No value is promised here. -->

## Five questions to ask about any spec line

1. **Which layers do the GSM and BF apply to?** Liners only, fluting only, or all.
2. **Which flute or flutes?** B, C or B + C, so you know the thickness.
3. **What is each paper made of?** Virgin kraft, semi-kraft or recycled, since the same GSM does not perform the same. See [virgin vs recycled kraft](/blogs/kraft-paper-grades).
4. **What are the board test figures?** ECT and burst for the finished board, and the test method.
5. **Are the figures typical or guaranteed?** A quote that says "typical" is a different promise from one that says "minimum".

If a supplier cannot answer these, you cannot tell what you are buying. A sample you can weigh and test is the best check, and a [test of your own packed box](/blogs/how-many-kg-can-corrugated-box-hold) is better still.

## Common ways spec lines mislead

- **Comparing the ply only.** Two "5-ply" quotes can have very different papers.
- **Comparing GSM only.** A lower GSM with a higher BF can be the stronger paper.
- **Comparing prices before specs.** Line up the layers first, then the price.
- **Treating the line as the whole spec.** Size, style, print and quantity belong in it too.

## When the quote just says "standard board"

Some quotes give no numbers at all. That is not always bad faith: a plant may run a house board and describe it by name. But you can still ask for the layers behind the name, and ask for a sample of the board itself. Weigh a 10 cm x 10 cm piece of the finished board and multiply by 100 to get its weight in GSM, which you can set against the figures above. If a supplier will not tell you what is inside, price is the only thing you can compare, and price alone is a poor guide to a box.

## Frequently asked questions

### What does 18 BF mean on a box?

BF is the bursting factor of a paper: its burst strength per 1,000 GSM. 18 BF at 120 GSM implies a paper burst of about 2.16 kg/cm2. It describes the paper, not the finished box.

### Is 18 BF good?

There is no universal answer. BF is relative to the paper grade and to what you pack. Ask what BF each layer in your quote has and compare the same layer between suppliers, rather than judging one number alone.

### What does 5 ply mean?

Five paper layers: three flat liners and two fluted layers between them, also called double wall. It is thicker and stiffer than 3-ply, and used for heavier goods and stacking.

### What GSM is used for a 5-ply box?

It varies. Liner GSM commonly ranges from about 120 to 200 with a lighter fluting, but the right spec depends on the size, the load and the stacking. The [GSM guide](/blogs/gsm-calculation-strength) has typical ranges to discuss, not standards.

### Is BF the same as the burst strength of the box?

No. BF belongs to a single paper. The board and the finished box have their own tests, and the numbers are not interchangeable.

## Turn the spec into a box

Set the ply and size in the designer, watch the board thickness change, then send the design and ask for a quote that spells out the papers.

[Open a 5-ply box in 3D](/box-designer?style=rsc&l=40&w=30&h=25&ply=5-ply&fl=BC), [get a quote](/quote?product=5-ply&qty=500-1k&l=400&w=300&h=250&src=blog.reading-box-spec-ply-bf-gsm), or [WhatsApp us your spec line](https://wa.me/918511658600?text=Hi%20Vayu%2C%20I%20read%20your%20guide%20on%20reading%20a%20box%20spec.%20I%20have%20this%20quote%20line%3A%20__.%20Please%20tell%20me%20what%20papers%20you%20would%20use%20for%20a%20box%20of%20__%20x%20__%20x%20__%20cm%2C%20__%20kg.%20City%20__.).

**Keep reading:**
- [GSM and BF in corrugated boxes](/blogs/gsm-calculation-strength)
- [Burst strength vs ECT](/blogs/burst-strength-ect-guide)
- [Flute types compared](/blogs/flute-types-guide)
- [What does a 5 ply box cost?](/blogs/what-does-a-5-ply-box-cost)
