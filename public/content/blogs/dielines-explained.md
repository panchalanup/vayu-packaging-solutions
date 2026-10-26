---
title: "Dielines Explained: Download One From the Designer and Hand It to Any Printer"
slug: "dielines-explained"
description: "What a box dieline is, how to read cut and crease lines, panel sizes and the glue flap, and how to download a 1:1 mm SVG or PDF dieline from the free 3D Box Designer for your designer or printer."
category: "Designer Guides"
date: "2026-10-26"
readingTime: "9 min read"
author: "Vayu Packaging Team"
thumbnail: "BLOG-DG-06-thumbnail"
socialImage: "BLOG-DG-06-social"
---

# Dielines Explained: Download One From the Designer and Hand It to Any Printer

If you have ever asked a graphic designer to "make the artwork for our box", the first thing they asked for was probably a **dieline**. Without one they are guessing where the panels, folds and flaps are, and guesses become logos cut in half at a fold.

A dieline is simple once you have seen one, and you no longer need special software to get one. The free **3D Box Designer** creates a dieline for your exact box, at 1:1 scale in millimetres, ready to download as SVG or PDF.

This guide explains how to read a dieline, how to download one, and how to hand it over so your designer and printer get it right first time.

[Get a dieline for your box](/box-designer)

---

## What is a dieline?

A **dieline** is the flat outline of a box before it is folded: the shape of the **blank** (the sheet of board the box is cut from), with every line that will be cut or folded marked on it.

Think of it as the box's sewing pattern. It shows:

- **Cut lines:** where the board is cut through, the outside shape plus slots between flaps,
- **Crease (score) lines:** where the board is pressed so it folds cleanly,
- **Panels:** the walls, flaps, lid and tabs, each with its size,
- **The glue flap:** the narrow tab that joins the box into a tube.

The name comes from the **cutting die**, the steel-rule tool that cuts and creases die-cut boxes in one press. Slotted cartons such as RSCs are made on slotting machines instead, but the drawing is still called a dieline.

---

## How to read a dieline from the designer

When you download a dieline from the 3D Box Designer, you get one drawing at **1:1 scale in millimetres**. Print it at 100% and every line is the real size.

![A downloaded RSC dieline with solid cut lines, dashed crease lines and the panel widths labelled in millimetres](/blog-images/designer/designer-dieline-export.png)
*An RSC dieline from the designer: solid lines are cut, dashed lines are creased.*

| You see | It means |
|---|---|
| **Solid black line** | Cut. The board is cut through here. |
| **Dashed red line** | Crease (score). The board folds here. |
| **Panel label, e.g. "front 300 mm"** | The panel's name and width |
| **"glue"** | The glue flap that joins the last panel to the first |
| **Footer line** | Board, wall height, flap depth, overall blank size, and the cut/score key |

For a regular slotted carton (RSC) the blank reads left to right as: **glue flap, panel, panel, panel, panel**, alternating long and short sides, with **flaps** above and below each panel. A half slotted carton (HSC) has flaps on one edge only. Die-cut styles such as mailers have more complex shapes, with a lid, tuck, dust flaps and double walls, but the same colour key.

<!-- VERIFY-LATER[BLOG-27]: line colours, labels and footer text describe src/lib/boxDesigner/dieline.ts today (RSC/HSC); Workstream A is extending dielines to every style. Re-check the description and the screenshot once all eight styles export, and confirm whether placed artwork is included in the file. -->

### Why the panels are not exactly your inside size
You will notice the panel widths are **a little larger** than the inside dimensions you entered. That is deliberate. The board has thickness, and when the box folds, each wall wraps around the board of its neighbours. The designer adds the right allowance for the ply and flute you picked, so the **inside** of the folded box comes out at the size you asked for. The [fit and sizing guide](/blogs/find-right-box-size) explains inside vs outside dimensions.

This is also why you should never draw a dieline by hand from the inside size: forget the allowance and the box comes out several millimetres small.

---

## How to download a dieline, step by step

1. Open the [3D Box Designer](/box-designer).
2. Set the **style**, **inside size** and **board** (ply and flute). The allowance depends on all three, so set them first.
3. Optional: fold the box with the **assembly slider**. Dragging it all the way to **flat** shows the 3D box as the blank, the same shape as the dieline.
4. Open **Export** and choose **Dieline (SVG)** or **Dieline (PDF)**.
5. The file downloads, named after your design.

![The designer's export panel with the dieline SVG and PDF buttons, and the box folded flat above it](/blog-images/designer/designer-fold-flat.png)
*Fold the box flat to see the blank in 3D, then download the dieline from the export panel.*

### SVG or PDF?
- **SVG** opens in Adobe Illustrator, Inkscape, Affinity Designer, CorelDRAW and Figma. Choose it if your designer will place artwork on it.
- **PDF** is the safe choice to email, print at 100% to check, or send to a printer who asked for "a PDF dieline".

When in doubt, send both.

---

## Handing the dieline to a designer

Here is a brief you can copy into your message:

> Attached: dieline for our box (SVG and PDF, 1:1 mm). Black solid = cut, red dashed = crease. Please put the dieline on its own locked layer named "Dieline" and set it to non-printing. Keep all text and logos at least 5 mm inside the crease lines. Extend background colours about 3 mm past cut lines (bleed). Send back a print-ready PDF with fonts outlined, plus the source file.

Key points for your designer:

- **Keep the dieline on its own layer.** Printers need to separate the structure from the artwork.
- **Respect the safe area.** Nothing important within a few millimetres of a crease or cut. The designer's [print checks](/blogs/logo-artwork-on-boxes) flag this too.
- **Add bleed** where colour runs to the edge, so a tiny shift in cutting does not leave a white sliver.
- **Mind the direction of each panel.** On an RSC, the top flaps are upside down relative to the walls in some layouts; check against the 3D model.
- **Use the 3D model as the reference.** Send a share link with the dieline. Your designer can rotate and fold the box instead of imagining it.

---

## Handing the dieline to a printer or box maker

If you are getting boxes made by someone else, the dieline plus a few details make the quote accurate:

- the **dieline** (SVG or PDF),
- the **spec sheet PDF** from the designer: three views, dimensions in your chosen unit, board, finish and quantity,
- your **artwork** as a print-ready PDF (or the logo files if they are setting it up),
- the **quantity** and delivery location.

Box makers often adjust a dieline to suit their own machines: a slightly different glue flap width, slot width or creasing allowance. That is normal. The **inside dimensions** are what must not change, so state them clearly in your order.

If you are ordering from us, you do not need to download anything: **Send my design to Vayu** sends the spec and a share link with it.

---

## Box manufacturers: using the dieline in your workflow

If you make boxes and use the designer with your customers:

- Download the dieline after the customer approves the 3D design, and use it as the **starting point** for your production drawing.
- Attach the **spec sheet PDF** with its customer approval block to the job file, so the size, board and print are signed off in one document.
- Use **presentation mode** to walk the customer through the box before you send the proof. See [box manufacturers: win more orders with 3D](/blogs/box-manufacturers-3d-presentations).

---

## Common dieline mistakes

- **Scaling the file.** A dieline is only right at 100%. If your printer's print dialog says "fit to page", turn it off.
- **Mixing up cut and crease.** A crease drawn as a cut makes a box that falls apart; a cut drawn as a crease makes one that will not fold.
- **Artwork across the glue flap.** Anything printed on the glue flap is hidden inside the box.
- **Old dielines for new sizes.** Change the size, download a new dieline. Never stretch an old one.
- **Forgetting board thickness.** A dieline for 3-ply is not right for 5-ply. Change the board, download again.

---

## Frequently asked questions

### What is the difference between a dieline and a template?
A template is any starting design. A dieline is the precise flat layout of one specific box, with cut and crease lines at full size.

### What scale is the dieline?
1:1 in millimetres. Print at 100% and measure a panel to check.

### Can I open the dieline in Canva or Illustrator?
Illustrator, Inkscape, Affinity, CorelDRAW and Figma open SVG files directly. Tools that do not import SVG can usually place the PDF as a background.

### Does the dieline include my artwork?
The dieline is the structure: cut and crease lines with labels. Your designer places final artwork on it. Use the designer's images, share link and spec sheet to show where your logo goes.

### Do I need a dieline if I order from Vayu?
No. When you send your design from the tool, we generate the production drawing from it. The dieline is there for your own designer, other printers, or your records.

### Is the dieline free to use with other printers?
Yes. It is your design; use it wherever you like.

---

## Download your dieline

Set your style, size and board, fold the box flat to check it, and download the SVG or PDF. Your designer will thank you.

[Open the designer and export a dieline](/box-designer)

**Keep reading:**
- [Adding your logo and artwork to a box: print-ready tips](/blogs/logo-artwork-on-boxes)
- [8 box styles in 3D: which one fits your product](/blogs/box-styles-in-3d)
- [How to measure corrugated boxes](/blogs/box-measurements-guide)
- [How to use the 3D Box Designer](/blogs/how-to-use-3d-box-designer)
