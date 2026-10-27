---
title: "Logo and Artwork on Boxes: Print-Ready Tips"
slug: "logo-artwork-on-boxes"
description: "Put your logo on a corrugated box the right way: file types, resolution, safe areas, text size and colours on kraft. Check your artwork in the 3D designer."
category: "Designer Guides"
date: "2026-10-26"
updated: "2026-10-27"
readingTime: "8 min read"
author: "Vayu Packaging Team"
thumbnail: "BLOG-DG-05-thumbnail"
socialImage: "BLOG-DG-05-social"
---

# Logo and Artwork on Boxes: Print-Ready Tips

A printed box does a lot of quiet work. It tells the courier which way is up, tells the warehouse what is inside, and tells your customer, before they open anything, that the product came from a brand that cares. It also costs very little extra once the run is large enough.

But artwork that looks perfect on a laptop screen can print badly on corrugated board. Logos get cut off at a fold, thin text fills in, and colours come out darker on brown kraft than on white paper. The good news: almost all of these problems are predictable, and the free **3D Box Designer** checks for them while you work.

This guide covers how to place artwork in the designer, what the print checks mean, and the practical rules printers wish every customer knew.

[Add your logo in 3D](/box-designer)

---

## Why designing on a 3D box beats a flat mock-up

On a flat drawing, every panel looks like a clean rectangle. On a real box:

- **flaps fold over** and can hide the top of a front-panel logo,
- **the glue flap** sits under one corner and can cut through artwork,
- the **top of an RSC** is two flaps meeting in the middle, often under a strip of tape,
- the **inside of a mailer lid** is what your customer sees first, not the outside.

In the designer you place artwork on the face of a 3D box and then **fold it**. If something ends up under a flap, behind tape or upside down when the box is opened, you see it immediately.

---

## Step by step: putting your logo on a box

1. **Open the designer** and set your style and size first. Artwork is placed relative to the face, so a later size change can shift it.
2. **Choose a surface.** In the **Customize** tab, click a face on the 3D box, or pick one from the surface list (front, back, sides, top flaps, bottom, and inside surfaces for styles that have them).
3. **Add an image.** Upload your logo as **SVG, PNG, JPG or WebP** (up to 10 MB). Drag it into place, then scale and rotate it.
4. **Add text.** Type a tagline, website, "Handle with care", or a product line. Pick the font, size, alignment and colour.
5. **Set brand colours.** Enter exact **hex or RGB** values, and reuse recent colours so every face matches. Save them, with your logo, as a **brand kit** for the next design.
6. **Fold and rotate.** Run the assembly slider from flat to sealed and look at every side.
7. **Clear the print checks.** Fix anything flagged before you send the design.

![The artwork panel with a logo on the front face of a kraft RSC and text below it](/blog-images/designer/designer-artwork-logo.png)
*Place your logo on any face, then fold the box to check nothing hides under a flap.*

---

## The print checks, explained

As you place artwork, the designer runs **print-ready checks** and lists any problems. Click a warning and the item is selected so you can fix it. There are two levels: **warnings** (it will print, but not at its best) and **errors** (it will print badly or be cut).

<!-- VERIFY-LATER[BLOG-26]: thresholds quoted in this section (about 150 dpi warning / 90 dpi error, 0.5 cm safe margin, 8 pt warning / 6 pt error) come from src/lib/boxDesigner/printChecks.ts (VERIFY-LATER DSG-62) and still need confirming with the print room. -->

### Low-resolution image
A photo or logo has a fixed number of pixels. Stretch it across a large panel and each pixel becomes big enough to see. The designer works out the **effective resolution** of each image at the size it will print. Below roughly **150 dpi** you get a warning (it will look soft); below about **90 dpi**, an error (it will look pixelated).

**Fix:** upload a larger file, make the image smaller on the box, or, best of all, use a **vector logo (SVG)**, which stays sharp at any size.

### Artwork over the edge
Anything that runs past the edge of a panel is **cut off** when the box is cut and creased. Unless you intend a full-bleed design, keep artwork inside the panel.

### Too close to a fold or edge
Folding and cutting are accurate, but not to the millimetre on every box in a run. Artwork that sits right on a crease can **wrap around the corner**. The designer flags items closer than about **0.5 cm** to a fold or edge: the **safe area**.

### Text too small
Corrugated board has a ridged surface, and flexo printing spreads ink slightly. Very small text fills in. The designer warns below about **8 pt** and flags an error below about **6 pt**.

### Hard to read on the board colour
Light grey text on kraft, or dark brown on a dark flood colour, simply disappears. The **contrast check** flags text that will be hard to read against the board.

![The print-check list with warnings for a low-resolution logo, artwork near a fold and small text](/blog-images/designer/designer-print-checks.png)
*Print checks: click a warning to select the item and fix it.*

---

## Practical artwork rules for corrugated boxes

### Use the right file
- **Best:** a vector logo (**SVG**, or the AI/EPS/PDF your designer made). It prints crisply at any size. Use SVG in the designer and send the original vector file with your order.
- **Good:** a large **PNG** with a transparent background, so the board shows around the logo instead of a white rectangle.
- **Avoid:** a small JPG from a website or a WhatsApp forward. It is compressed and almost always too small for print.

Note that the designer resizes very large images for a smooth 3D preview. The preview is for checking position and size; the printer works from your original file.

### Think in print colours
Flexo printing on corrugated board is usually done in **spot colours**, one plate per colour. Fewer colours means a lower price and a crisper result.

- A **one-colour logo** (black, or your brand colour) is the most economical and often the most striking on kraft.
- **Gradients and photos** need full colour, which costs more and looks best on white board.
- Colours on **brown kraft look darker and warmer** than on screen. A bright yellow on kraft can look mustard. If colour accuracy matters, choose **white board** or ask for a printed proof.

The designer notes that the final print colour is confirmed on the proof. Screens and printing presses never match exactly.

### Keep it simple and bold
- Thin hairlines and tiny details fill in on corrugated board. Thicken them.
- Leave **breathing space** around the logo; it reads more premium than a crowded panel.
- Big, simple shapes read from across a warehouse; fine print does not.

### Place for the way the box is used
- **E-commerce mailers:** logo on the lid outside, a message on the **inside of the lid**.
- **Shipping cartons:** logo on two adjacent sides, so it shows however the box is stacked. Handling icons (this way up, fragile, keep dry) near the top.
- **Retail and gift boxes:** the front panel and lid top matter most; keep the bottom plain.
- **Warehouse cartons:** a large product code or name on the short ends makes picking faster.

The designer can show standard **shipping icons** on the box with one switch.

---

## Finishes: matte, gloss and inside colour

- **Matte** is the natural look of printed board. It hides scuffs and suits kraft.
- **Gloss** adds shine and makes colours look richer, especially on white board. It costs a little more.
- **Inside colour:** a white-lined inside on a kraft box looks clean when opened and photographs well.

All three are previewed on the 3D model: rotate the box under the light to see the difference.

![The same printed box shown in matte and gloss finishes side by side in the designer](/blog-images/designer/designer-finish-gloss.png)
*Matte vs gloss, previewed on the 3D model.*

---

## Hand-off checklist

Before you send your design for a quote, run down this list:

- [ ] Style and inside size are final
- [ ] Every print check is cleared, or you know why a warning is acceptable
- [ ] The box has been folded and rotated, and nothing hides under a flap or tape
- [ ] Brand colours are entered as exact hex or RGB values
- [ ] You have the **vector** logo file ready to send
- [ ] You have downloaded the **dieline** if your own designer is preparing final artwork ([dielines explained](/blogs/dielines-explained))
- [ ] Decision made on matte or gloss, and on inside colour

---

## Frequently asked questions

### What file format is best for a logo on a box?
A vector file: SVG, AI, EPS or PDF. Use SVG in the designer and send the original vector with your order.

### Can I print a photo on a corrugated box?
Yes, in full colour, best on white board. It costs more than spot colours, and the designer will warn you if the photo's resolution is too low for its size.

### Why does my colour look different on kraft?
Ink on brown paper mixes with the paper colour. Colours look darker and warmer. Use white board if exact colour matters, and approve a printed proof.

### How many colours should I use?
As few as do the job. One or two spot colours give the best price and a bold look. See [what drives cost per box](/blogs/box-price-estimate-guide).

### Can I put artwork on the inside of the box?
Yes, on styles with inside surfaces such as the inside of a mailer lid. Inside printing is a popular unboxing touch.

---

## Put your brand on the box

Upload your logo, fold the box, and clear the print checks. You will know your artwork works before anyone makes a printing plate.

[Add your logo now](/box-designer)

**Keep reading:**
- [Dielines explained: download one and hand it to any printer](/blogs/dielines-explained)
- [Packaging product shots and 360° videos without a photoshoot](/blogs/packaging-product-shots-360-video)
- [How to use the 3D Box Designer](/blogs/how-to-use-3d-box-designer)
- [How to add cutouts to your box design](/blogs/how-to-add-cutouts-box-design)
