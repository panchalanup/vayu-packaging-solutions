---
title: "CBM Calculator: Cartons per 20ft and 40ft Container"
slug: "cbm-calculator-cartons-per-container"
description: "How to calculate CBM and how many cartons fit a 20 ft, 40 ft or 40 ft high cube container and a pallet, with worked examples and the outside-size trap."
category: "Technical Guide"
date: "2026-10-27"
updated: "2026-10-27"
readingTime: "10 min read"
author: "Vayu Packaging Team"
thumbnail: "BLOG-N1-05-thumbnail"
socialImage: "BLOG-N1-05-social"
---

# CBM Calculator: Cartons per 20ft and 40ft Container

CBM is cubic metres: length x width x height of a packed carton in cm, divided by 1,000,000, times the number of cartons. A 50 x 40 x 30 cm carton is 0.06 CBM, so 500 cartons are 30 CBM. A 20 ft container is about 33 CBM inside, but cartons fill only part of it.

[Open the free CBM and container loading calculator](/tools/cbm-calculator)

*Last checked: October 2026. Container sizes and payloads are typical figures that vary by line and age. Confirm with your freight forwarder.*

---

## The CBM formula

**CBM per carton = length x width x height (cm) / 1,000,000**

**Total CBM = CBM per carton x number of cartons**

Example: a carton 50 cm long, 40 cm wide and 30 cm high.

1. Volume: 50 x 40 x 30 = **60,000 cm3**.
2. CBM per carton: 60,000 / 1,000,000 = **0.06**.
3. For 500 cartons: 500 x 0.06 = **30 CBM**.

If your sizes are in inches, convert each side to cm first (multiply by 2.54), then use the formula. The calculator accepts mm, cm or inches.

---

## Use the outside size of the packed carton

This is where most CBM sums go wrong. The 3D designer and most box makers work in **inside** sizes, but a container is filled with the **outside** of the carton, and the outside is bigger by the board thickness on each side.

Take a 5-ply carton with an inside size of 50 x 40 x 30 cm. If the board is about 6.5 mm thick, each wall adds 0.65 cm, so each dimension grows by 1.3 cm:

- Outside: 51.3 x 41.3 x 31.3 cm.
- Volume: 51.3 x 41.3 x 31.3 = 66,313.6 cm3, so **0.0663 CBM**.
- That is 10.5% more than the 0.06 you get from the inside size.
- For 500 cartons: 500 x 0.0663 = **33.2 CBM**, not 30 CBM.

A 10% error in CBM can mean a container you did not budget for. Board thickness is indicative here, so check the real figure for the board you order. See [inside versus outside size](/blogs/box-measurements-guide) for how the two differ.

<!-- VERIFY-LATER[BLOG-312]: a thickness of about 6 to 7 mm for 5-ply (6.5 mm used here) is indicative and matches BLOG-203; confirm against the boards Vayu runs. The outside-size example depends on it. -->

---

## Container sizes at a glance

These are typical internal sizes and the defaults the calculator starts from. Real containers differ a little by line and age, and some sources quote slightly different volumes.

| Container | Typical inside size (cm) | Inside volume | Usable at 85% | Typical payload |
|---|---|---|---|---|
| 20 ft | 590 x 235 x 239 | 33.14 CBM | 28.17 CBM | 28,000 kg |
| 40 ft | 1,203 x 235 x 239 | 67.57 CBM | 57.43 CBM | 26,500 kg |
| 40 ft high cube | 1,203 x 235 x 269 | 76.05 CBM | 64.64 CBM | 26,000 kg |

The inside volume is length x width x height: for a 20 ft, 590 x 235 x 239 = 33,137,350 cm3, or 33.14 CBM. The **usable** column is 85% of that, because cartons never fill every cubic centimetre: there is a gap at the doors and roof, and some loads need dunnage. The 85% figure is the calculator's default, and you can change it.

<!-- VERIFY-LATER[BLOG-310]: internal sizes, payloads and the 85% usable share are the calculator's editable defaults (see MKT-05), not any shipping line's specification. Confirm with a freight forwarder before this table is used for a booking. -->

---

## How many cartons fit in a container?

The answer is the **lowest of three limits**:

1. **Volume:** usable CBM divided by CBM per carton.
2. **Layout:** how many cartons physically fit, counted layer by layer on the floor.
3. **Weight:** the payload divided by the gross weight of one carton.

Here is the same 50 x 40 x 30 cm carton, first with the inside size used by mistake as if it were the outside, then with the outside size of 51.3 x 41.3 x 31.3 cm. Gross weight is assumed at 12 kg per carton.

| Container | By volume (inside size) | By layout (inside size) | Cartons (inside size) | Cartons (outside size) |
|---|---|---|---|---|
| 20 ft | 469 | 448 | **448** | **424** |
| 40 ft | 957 | 966 | **957** | **866** |
| 40 ft high cube | 1,077 | 1,150 | **1,077** | **974** |

Each cell is the lower of the volume and layout counts. Weight is not the limit at 12 kg per carton: 28,000 / 12 = 2,333 cartons by weight in a 20 ft. Using the inside size overstates a 20 ft load by 24 cartons, and a 40 ft high cube load by 103.

The 20 ft layout is easy to check: the floor is 590 x 235 cm, so one layer holds 64 cartons, and 239 cm of height holds 7 layers of 30 cm (210 cm). 64 x 7 = 448.

The 500-carton order from earlier needs 33.2 CBM, which is more than the 28.17 CBM usable in a 20 ft, so it needs a second container or a part load. The calculator counts identical cartons layer by layer, trying the three ways to stand a carton, so it is a planning estimate, not a 3D loading plan.

---

## When weight, not space, is the limit

Dense goods run out of payload before they run out of space. Take tile cartons of 60 x 30 x 10 cm, with an assumed gross weight of 25 kg each, in a 20 ft container:

- CBM per carton: 60 x 30 x 10 / 1,000,000 = **0.018**.
- By volume (85% of 33.14 CBM): about 1,564 cartons.
- By layout: about 1,554 cartons.
- By weight: 28,000 / 25 = **1,120 cartons**.

Weight binds. 1,120 cartons are 1,120 x 0.018 = 20.16 CBM, or about 61% of the container's inside volume. Paying freight on a container that is 40% empty is normal for dense cargo; for light cargo, such as garments, volume binds first. This is why the weight line in the calculator is optional but worth filling in. For heavy goods, also read our [export cartons guide](/blogs/export-cartons-5-ply-7-ply) and the [stacking strength guide](/blogs/box-stacking-strength-guide).

The tile figures are assumptions made for the example, not a specification for any product.

---

## Cartons per pallet

A pallet of 1,200 x 1,000 mm loaded to 150 cm above the deck is a block of 1.2 x 1.0 x 1.5 = **1.8 CBM**. The calculator uses these as editable defaults, and your carrier or warehouse may set a different load height. Cartons that divide the footprint neatly fill that block; awkward ones leave gaps.

| Carton (cm) | Per layer | Layers | Cartons per pallet | CBM on the pallet |
|---|---|---|---|---|
| 40 x 25 x 25 | 12 | 6 | 72 | 72 x 0.025 = 1.80 |
| 40 x 30 x 25 | 10 | 6 | 60 | 60 x 0.030 = 1.80 |
| 50 x 40 x 30 | 6 | 5 | 30 | 30 x 0.060 = 1.80 |
| 51.3 x 41.3 x 31.3 | 4 | 4 | 16 | 16 x 0.0663 = 1.06 |

The first three rows treat the sizes as outside sizes. The last row is the same carton as the third, with its real outside size. A 1.3 cm difference drops the count per layer from 6 to 4 and the layers from 5 to 4 (150 / 31.3 = 4.79, so 4), so the pallet carries 16 cartons, not 30. If you buy cartons to fill a pallet, say so at the order stage and ask which outside size to design for. See our [standard box sizes chart](/blogs/standard-corrugated-box-sizes-india) for footprints that divide a 120 x 100 cm pallet.

These counts keep every carton upright with the height as given. The calculator also tries other ways to stand a carton, which can fit more but may not suit a printed "this side up" box.

---

## CBM, weight and what you are billed

Freight is often priced on whichever is larger, volume or weight, but the conversion differs by mode. Check your forwarder's tariff; these are common conventions:

- **Sea, part load (LCL):** a common basis is 1 CBM against 1,000 kg, with the larger billed.
- **Air:** volume is converted at a divisor, often 6000 cm3 per kg, so 1 CBM is 1,000,000 / 6,000 = about 167 kg.

Worked example: 20 cartons of 0.06 CBM, 12 kg each.

- Total: 20 x 0.06 = **1.2 CBM**, and 20 x 12 = **240 kg**.
- Sea basis: 1.2 CBM against 0.24 tonnes, so volume (1.2) is larger.
- Air basis at 6000: 1.2 x 166.7 = 200 kg, against 240 kg actual, so **weight** (240 kg) is larger.

The same shipment is billed on volume by sea and on weight by air. The [volumetric weight article](/blogs/volumetric-weight-calculator-india) covers the same idea for courier parcels.

<!-- VERIFY-LATER[BLOG-311]: the sea LCL basis of 1 CBM = 1,000 kg and the air divisor of 6000 are common conventions, not any forwarder's tariff; confirm with a forwarder before the section is read as a rule. -->

---

## Fit more in the same container

A smaller carton can lift the count, if the product still fits. Take 2 cm off each side of the inside size of the example carton, so 50 x 40 x 30 becomes 48 x 38 x 28:

- Volume: 48 x 38 x 28 = 51,072 cm3, so **0.0511 CBM**.
- That is 14.9% less than 0.06 CBM (1 - 0.0511 / 0.06).
- A 20 ft counts 551 cartons by volume and 594 by layout, so **551** cartons, against 448 before.

A tighter carton also has a smaller perimeter, which lowers box compression strength in the McKee estimate. Check it with the [stacking strength guide](/blogs/box-stacking-strength-guide) and test a packed sample before you commit to a size.

---

## Try your own numbers

Enter your carton size, quantity and gross weight in the [CBM calculator](/tools/cbm-calculator), pick a container and a pallet, and read which limit binds. Then use the "see this box in 3D" button to open the carton in the designer.

---

## Frequently asked questions

### How do I calculate CBM?

Multiply length x width x height of the carton in centimetres and divide by 1,000,000 to get cubic metres, then multiply by the number of cartons. A 50 x 40 x 30 cm carton is 0.06 CBM, and 500 of them are 30 CBM. Use the outside size of the packed carton.

### How many cartons fit in a 20 ft container?

It depends on the carton size and weight. As an example, a 50 x 40 x 30 cm carton gives about 448 cartons in a 20 ft container using the inside size as the outside, and about 424 using an outside size with 5-ply board. Confirm with your forwarder.

### Why is the usable volume lower than the container volume?

Cartons do not fill every cubic centimetre. There are gaps at the doors and roof, and some loads need dunnage. The calculator uses 85% by default and lets you change it, so a 33.14 CBM container counts as 28.17 CBM usable.

### Is CBM the same as volumetric weight?

They are related. CBM is volume in cubic metres. Volumetric weight turns volume into kilograms using a divisor, such as 5000 for some couriers or 6000 for some air freight. Both are used to bill space.

### Should I use inside or outside dimensions for CBM?

Use outside dimensions, because the container is filled with the outside of the carton. The designer's sizes are inside sizes, so add the board thickness on each side first.

---

## Design your carton

Open a 50 x 40 x 30 cm 5-ply carton in the designer, change the size and see the box. Then ask for an indicative price in the Price & order tab.

[Open a 50 x 40 x 30 cm carton in 3D](/box-designer?style=rsc&l=50&w=40&h=30&ply=5-ply&fl=BC&src=blog.cbm.end)

For a heavy export carton, try [a 7-ply carton](/box-designer?style=rsc&l=50&w=40&h=40&ply=7-ply&fl=CBC&src=blog.cbm.end). When you have a size, tap the WhatsApp button below this article and send the inside size, quantity and your city.
