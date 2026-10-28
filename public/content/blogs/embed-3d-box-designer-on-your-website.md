---
title: "Embed a 3D Box Designer on Your Website in 5 Minutes"
slug: "embed-3d-box-designer-on-your-website"
description: "Add a free 3D box designer to your website with one iframe: where to copy the code, what each setting does, and what visitors can and cannot do inside it."
category: "Use Cases"
date: "2026-10-28"
updated: "2026-10-28"
readingTime: "6 min read"
author: "Vayu Packaging Team"
thumbnail: "BLOG-P2X-05-thumbnail"
socialImage: "BLOG-P2X-05-social"
---

# Embed a 3D Box Designer on Your Website in 5 Minutes

You can put the Vayu 3D Box Designer on any web page with one line of HTML. Open the designer, go to the Showcase tab, open "Embed on your website", press Copy code and paste it into a custom HTML block. Visitors can switch style, change size and colour and fold the box. Their quote button opens our quote page.

[Open the 3D Box Designer](/box-designer)

*Last checked: October 2026. The embed and its settings are described as they work in the tool today; the web address in the code is the designer's current address and will change if the site moves to its own domain.*

<!-- VERIFY-LATER[BLOG-658]: the embed's "Get a quote" button and credit line go to Vayu, not the embedding site (see src/pages/BoxDesignerEmbed.tsx), and BLOG-50 asks for terms for third-party embedding. Confirm the partner position (MKT-01): whether a branded version, routing enquiries to the embedding manufacturer, will be offered, before this is promoted to other makers. -->

---

## The five-minute version

| Minute | What you do |
|---|---|
| 1 | Open the [designer](/box-designer) and pick the style your page is about |
| 2 | Type the size you want visitors to see first (cm) |
| 3 | Showcase tab, "Embed on your website", Copy code |
| 4 | Paste into a custom HTML block on your page and save |
| 5 | Open the page on your phone and your laptop and test it |

![The embed snippet panel with the iframe code and a Copy code button](/blog-images/designer/designer-embed-snippet.png)
*The embed panel in the Showcase tab: the code is built from your current style and size, and the button copies it.*

---

## Step by step

### 1. Set the box you want visitors to see

Open the designer and choose the style and inside size that matches your page. A page about mailer boxes should open on a mailer; a page about cartons should open on a slotted carton. The snippet takes the **style** and the **length, width and height in cm** from your current design.

### 2. Copy the code

Open the **Showcase** tab and scroll to the section called **Embed on your website**. The box shows the code and a **Copy code** button; the label changes to Copied when it works. If your browser blocks copying, the designer shows the code in a box you can copy by hand.

The code is a single iframe, like this one:

```html
<iframe src="https://vayupackaging.vercel.app/embed/box-designer?style=mailer&l=30&w=23&h=6" title="3D box designer by Vayu Packaging" width="100%" height="560" style="border:0;border-radius:12px;max-width:960px" loading="lazy" allow="fullscreen"></iframe>
```

<!-- VERIFY-LATER[BLOG-659]: the example uses the current site address (see MKT-02: custom domain plan). Re-check the snippet text against a fresh copy from the Showcase tab before each update. -->

### 3. Paste it into your page

Paste the code into whatever your site calls a custom HTML, embed or code block. In WordPress that is the Custom HTML block; other builders use different names. Some builders restrict iframes on some plans, so if the box does not appear, check your plan and the builder's help pages. Save the page and reload it.

### 4. Test on a phone

Open the page on a phone and a laptop. The embed fills the width of its container up to 960 px, and the code gives it a height of 560 px. Increase the height if your page has room; keep it above about 420 px so the size fields and buttons stay visible. A visitor whose browser cannot show 3D gets a simple fallback with the size and a quote link instead of the model.

---

## What you can change in the code

The address after `embed/box-designer` carries four settings. Everything else in the iframe is normal HTML you can edit.

| Setting | What it does | Allowed values |
|---|---|---|
| `style` | The box style the embed opens on | One of the 20 style names below |
| `l` | Inside length, cm | 5 to 100 |
| `w` | Inside width, cm | 5 to 100 |
| `h` | Inside height, cm | 5 to 100 |
| `height` (on the iframe) | How tall the box area is on your page | Any pixel value; 560 is the default |

If a value is missing or out of range, the embed falls back to that style's default size, so a mistake does not break the page. The 20 style names are: `rsc`, `hsc`, `fol`, `sleeve`, `telescope`, `mailer`, `pizza`, `tray`, `carry`, `produce`, `produce-tray`, `tuck-end`, `crash-lock`, `one-two-three`, `window-mailer`, `cake-box`, `clamshell`, `shelf-tray`, `slide-box` and `book-box`. Type them exactly as shown, hyphens included. The full list with preset sizes is in the [dieline template library](/blogs/free-dieline-template-library-box-styles).

Example: a page for cake boxes can use `style=cake-box&l=25&w=25&h=12`.

---

## What visitors can do inside the embed

- Switch between the styles with the row of style buttons.
- Step the box from flat to folded, with buttons that follow the style's fold stops.
- Change length, width and height in cm.
- Pick one of six board colours.
- Rotate the model; it also turns slowly by itself.
- Press **Full designer**, which opens the full tool with their design in a new tab.
- Press **Get a quote**, which opens the Vayu quote page with the size and board filled in.

## What visitors cannot do

- Choose ply or flute (the embed uses sensible defaults for each style).
- Add a logo, text or cutouts.
- See an estimate, download a dieline or save a design.

The embed is a showroom, not the whole tool. The full designer is one click away for anyone who wants more ([how to use it](/blogs/how-to-use-3d-box-designer)).

---

## Where the enquiries go

This is the part to understand before you embed. The **Get a quote** button opens **our** quote page, and a small credit line under the box reads "3D box designer by Vayu Packaging Solutions" and links to our site. The embed does not carry your branding, and it does not send enquiries to you.

That suits you if you want a free, interactive box on your site and are happy that curious visitors can ask us for a quote. It does not suit you if you want every enquiry to reach your own team. We have not set up a branded or white-label version. If you are a box maker, wholesaler or printer who would want one, [tell us what you need](/contact) and we will say honestly what is possible.

For presenting designs to your own customers in person, see [3D box presentations for box makers](/blogs/box-manufacturers-3d-presentations); that uses the full designer, where you control the design and proof PDF.

---

## Good to know

- **Nothing is saved on your page.** The embed does not store designs on your site, and it does not save into the main designer's autosave.
- **Search engines.** The embed page is marked noindex, so it will not appear in search results by itself; your own page, with your own text, is what ranks.
- **Third-party content.** The box loads from our server and our analytics counts embed opens with the style only. If your privacy policy lists third-party content, mention it. <!-- VERIFY-LATER[BLOG-660]: confirm the analytics and consent wording for the embed route (MKT-16) before telling other sites what to put in their privacy notice. -->
- **Frames.** Our embed route can be shown inside other sites. If your own site sets strict rules about which frames it allows, you may need to allow our address.

---

## Ideas for where to put it

| Page | Style to start on | Why |
|---|---|---|
| "Custom mailer boxes" | `mailer` or `window-mailer` | Visitors fold it and see what they are asking for |
| "Heavy-duty cartons" | `fol` | Show the full overlap flaps |
| "Cake boxes" | `cake-box` | The window is on by default |
| A trade-fair landing page | Your best seller | Give people something to try on a tablet |

---

## Frequently asked questions

### Is the embed free?

Yes. It is the same free designer, without sign-up. We have not announced any limits, but if that changes we will update this page.

### Do I need to know how to code?

No. You copy one line from the Showcase tab and paste it into a custom HTML block. Editing the style or sizes means changing a few words in the address.

### Will the embed slow down my page?

The code asks the browser to load the box lazily, so it loads when visitors scroll to it. The 3D model is still heavier than a picture, so avoid placing several on one page.

### Can I change the colours or add my logo?

Not in the embed. Visitors can pick board colours, but there is no logo upload. Use the full designer for branded designs and product shots.

### Can I send enquiries to my own team instead of to Vayu?

Not with the current embed: its quote button opens our quote page. If you want a version for your own enquiries, contact us and we will discuss it.

---

## Try it yourself

Set the box in the designer, open the Showcase tab and copy the code into a test page.

[Open a window mailer in 3D](/box-designer?style=window-mailer&l=28&w=22&h=7&ply=3-ply&fl=E&opt=window&src=blog.embed-3d-box-designer-on-your-website.end), [get a quote](/quote?src=blog.embed-3d-box-designer-on-your-website), or [WhatsApp us](https://wa.me/918511658600?text=Hi%20Vayu%2C%20I%20read%20your%20guide%20on%20embedding%20the%20box%20designer.%20I%20am%20a%20__%20and%20would%20like%20to%20talk%20about%20__.).

**Keep reading:**
- [3D box presentations for box makers](/blogs/box-manufacturers-3d-presentations)
- [How to use the 3D Box Designer](/blogs/how-to-use-3d-box-designer)
- [Free dieline template library: 20 box styles](/blogs/free-dieline-template-library-box-styles)
- [Spec, price and share boxes: a wholesaler's guide](/blogs/wholesalers-spec-price-share-boxes)
