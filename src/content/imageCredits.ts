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
