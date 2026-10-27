/**
 * Third-party photo credits: single source for the on-image badge, article credits and the /image-credits page.
 * Every entry was checked against the Wikimedia Commons file page (licence, author, source) on 2026-10-08.
 * To add a photo: add the file under src/assets/photos, add an entry here, pass `credit` to the ImageSlot.
 * Only use CC0, public-domain, CC BY or CC BY-SA files. Never CC NC / ND, and never a file with no named author.
 * SECURITY: all values are static, trusted strings. URLs are https and rendered with rel="noopener noreferrer".
 */

export interface ImageCreditData {
  /** Short stable id, also the key in IMAGE_CREDITS */
  id: string;
  /** Title of the original file on the source site */
  title: string;
  author: string;
  /** Page where the original lives (links back to the author and the licence record) */
  sourceUrl: string;
  sourceName: string;
  license: string;
  licenseUrl: string;
  /** What we changed, as the licences require us to say */
  changes: string;
  /** Where the photo is shown on this site */
  usedOn: string;
}

const CC_BY_SA_4 = 'https://creativecommons.org/licenses/by-sa/4.0/';
const CC_BY_SA_3 = 'https://creativecommons.org/licenses/by-sa/3.0/';
const CC0 = 'https://creativecommons.org/publicdomain/zero/1.0/';

export const IMAGE_CREDITS = {
  'corrugated-conveyor': {
    id: 'corrugated-conveyor',
    title: 'Corrugated cardboard on conveyor.jpg',
    author: 'Streetsoda',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Corrugated_cardboard_on_conveyor.jpg',
    sourceName: 'Wikimedia Commons',
    license: 'CC0 1.0',
    licenseUrl: CC0,
    changes: 'Cropped to landscape and resized. CC0 needs no credit; we credit anyway.',
    usedOn: 'Home page: “Board & print” step',
  },
  'compression-tester': {
    id: 'compression-tester',
    title: 'Box compression tester.jpg',
    author: 'Testronix Instruments',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Box_compression_tester.jpg',
    sourceName: 'Wikimedia Commons',
    license: 'CC BY-SA 4.0',
    licenseUrl: CC_BY_SA_4,
    changes: 'Resized and placed on a landscape canvas in the original background colour.',
    usedOn: 'Home page: “Convert & QC” step',
  },
  'corrugated-closeup': {
    id: 'corrugated-closeup',
    title: 'Corrugated Cardboard.JPG',
    author: 'Richard Wheeler (Zephyris)',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Corrugated_Cardboard.JPG',
    sourceName: 'Wikimedia Commons',
    license: 'CC BY-SA 3.0',
    licenseUrl: CC_BY_SA_3,
    changes: 'Resized. Not otherwise altered.',
    usedOn: 'Blog: flute types guide',
  },
} as const satisfies Record<string, ImageCreditData>;

export type ImageCreditId = keyof typeof IMAGE_CREDITS;

/** Original artwork made for this site (build script: scripts/illustrations). Listed on /image-credits for transparency. */
export const OWN_ARTWORK_NOTE =
  'The product, industry, process and blog diagrams are original vector illustrations made for Vayu Packaging Solutions. They show typical products and ideas, not our own facility, team or customers.';

/**
 * Open-licence artwork SETS used inside the box designer cutout (sticker) library. Licences were read from the
 * upstream repositories / package files on 2026-10-27. Only a curated subset of each set ships (see
 * scripts/stickers). MIT and ISC need the copyright and permission notice kept with the artwork, so the full text
 * is shown on /image-credits. No AI-generated artwork is used anywhere in the library.
 */
export interface ArtworkSetCredit {
  id: string;
  name: string;
  author: string;
  sourceUrl: string;
  license: string;
  licenseUrl: string;
  /** Copyright line and permission text, reproduced as the licence requires */
  licenseText: string;
  changes: string;
  usedOn: string;
}

export const ARTWORK_SET_CREDITS: readonly ArtworkSetCredit[] = [
  {
    id: 'fluent-emoji-flat',
    name: 'Fluent Emoji (Flat style)',
    author: 'Microsoft Corporation',
    sourceUrl: 'https://github.com/microsoft/fluentui-emoji',
    license: 'MIT',
    licenseUrl: 'https://github.com/microsoft/fluentui-emoji/blob/main/LICENSE',
    licenseText: `MIT License

Copyright (c) Microsoft Corporation.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`,
    changes: 'A curated subset was selected, the SVG markup was cleaned and minified, and the artwork is otherwise unmodified. Obtained via the @iconify-json/fluent-emoji-flat package.',
    usedOn: 'Box designer: Cutouts (fruits, food, drinks, clothing, accessories, beauty, electronics, gifts, home, plants, animals)',
  },
  {
    id: 'lucide',
    name: 'Lucide icons',
    author: 'Lucide Contributors (portions Cole Bemis, Feather)',
    sourceUrl: 'https://lucide.dev',
    license: 'ISC',
    licenseUrl: 'https://github.com/lucide-icons/lucide/blob/main/LICENSE',
    licenseText: `ISC License

Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.`,
    changes: 'Rendered to static one-colour SVG files with a fixed stroke colour; otherwise unmodified.',
    usedOn: 'Box designer: Cutouts (contact icons, arrows and symbols, line icons for shipping)',
  },
];

/** Original cutout artwork made for this site. */
export const CUTOUT_OWN_ARTWORK_NOTE =
  'The badges, labels, shapes, frames, seamless patterns, handling marks and a few fruit and leaf drawings in the cutout library are original vector artwork made for Vayu Packaging Solutions (scripts/stickers). Badge wording is generic; none of it is a certification or quality mark.';
