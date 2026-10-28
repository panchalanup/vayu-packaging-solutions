/**
 * Sample artwork for the templates gallery: small, original, hand-written SVG marks (no AI images, no third-party
 * logos). They are placeholders the user replaces with their own logo, so they stay simple and clearly generic.
 * SECURITY: static strings with no scripts, links or external references; encoded as data:image/svg+xml;base64
 * so they pass the design codec's artwork rules and are only ever rasterised through <img>.
 */

const wrap = (body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="400" height="400">${body}</svg>`;

export const TEMPLATE_ART = {
  /** Leaf in a ring: generic "eco brand" mark */
  leaf: wrap(
    '<circle cx="100" cy="100" r="86" fill="none" stroke="#1B6A2F" stroke-width="10"/>' +
      '<path d="M62 132c0-48 34-74 82-76-2 48-28 82-76 82" fill="#2E9B47"/>' +
      '<path d="M66 134c18-22 38-40 62-56" fill="none" stroke="#FBF8F3" stroke-width="6" stroke-linecap="round"/>'
  ),
  /** Clothes hanger */
  hanger: wrap(
    '<path d="M100 54a14 14 0 1 1 14 14c-8 0-14 6-14 14v6" fill="none" stroke="#17231C" stroke-width="9" stroke-linecap="round"/>' +
      '<path d="M100 88 26 136c-8 5-4 16 5 16h138c9 0 13-11 5-16z" fill="none" stroke="#17231C" stroke-width="9" stroke-linejoin="round"/>'
  ),
  /** Pizza slice */
  pizza: wrap(
    '<path d="M100 178 30 50c44-24 96-24 140 0z" fill="#E3B53C" stroke="#A8352E" stroke-width="8" stroke-linejoin="round"/>' +
      '<path d="M30 50c44-24 96-24 140 0" fill="none" stroke="#8B6F47" stroke-width="16" stroke-linecap="round"/>' +
      '<circle cx="84" cy="84" r="11" fill="#A8352E"/><circle cx="118" cy="98" r="11" fill="#A8352E"/><circle cx="100" cy="132" r="9" fill="#A8352E"/>'
  ),
  /** Ribbon bow */
  bow: wrap(
    '<path d="M100 100 40 62c-12-8-26 2-22 16l10 44c3 12 18 16 27 8z" fill="#D9B77E"/>' +
      '<path d="M100 100l60-38c12-8 26 2 22 16l-10 44c-3 12-18 16-27 8z" fill="#D9B77E"/>' +
      '<path d="M88 104 66 176l22-10 12 18 12-18 22 10-22-72" fill="#C49A6C"/>' +
      '<circle cx="100" cy="100" r="18" fill="#E8D5B3"/>'
  ),
  /** Sneaker outline */
  shoe: wrap(
    '<path d="M24 128V84l34 6 22 18 32 6c34 6 58 14 64 30v4H24z" fill="#FFFFFF" stroke="#17231C" stroke-width="8" stroke-linejoin="round"/>' +
      '<path d="M24 148h152" stroke="#17231C" stroke-width="14" stroke-linecap="round"/>' +
      '<path d="M66 98l10-8M80 108l10-8M94 114l10-8" stroke="#17231C" stroke-width="6" stroke-linecap="round"/>'
  ),
  /** Cupcake */
  cupcake: wrap(
    '<path d="M52 104h96l-14 72H66z" fill="#E6A9B8" stroke="#8B6F47" stroke-width="7" stroke-linejoin="round"/>' +
      '<path d="M78 108l6 64M100 108v64M122 108l-6 64" stroke="#8B6F47" stroke-width="5"/>' +
      '<path d="M46 104c0-30 20-48 54-48s54 18 54 48z" fill="#FBF8F3" stroke="#8B6F47" stroke-width="7" stroke-linejoin="round"/>' +
      '<circle cx="100" cy="44" r="10" fill="#A8352E"/>'
  ),
  /** Globe lines */
  globe: wrap(
    '<circle cx="100" cy="100" r="78" fill="none" stroke="#17231C" stroke-width="8"/>' +
      '<ellipse cx="100" cy="100" rx="34" ry="78" fill="none" stroke="#17231C" stroke-width="6"/>' +
      '<path d="M26 74h148M26 126h148M22 100h156" stroke="#17231C" stroke-width="6"/>'
  ),
  /** Grapes */
  grapes: wrap(
    '<path d="M100 40c6-14 20-20 34-18" fill="none" stroke="#3F6B4A" stroke-width="7" stroke-linecap="round"/>' +
      '<g fill="#E8D5B3">' +
      ['70,70', '100,70', '130,70', '85,98', '115,98', '100,126', '70,98', '130,98', '85,154', '115,154', '100,180']
        .slice(0, 9)
        .map((p) => `<circle cx="${p.split(',')[0]}" cy="${p.split(',')[1]}" r="16"/>`)
        .join('') +
      '</g>'
  ),
  /** Eight-point spark */
  spark: wrap(
    '<path d="M100 18 116 84l66 16-66 16-16 66-16-66-66-16 66-16z" fill="#FBF8F3"/>' +
      '<circle cx="100" cy="100" r="14" fill="#E3B53C"/>'
  ),
  /** Price tag */
  tag: wrap(
    '<path d="M108 24h58c6 0 10 4 10 10v58L90 178 22 110z" fill="#FBF8F3" stroke="#17231C" stroke-width="8" stroke-linejoin="round"/>' +
      '<circle cx="146" cy="54" r="12" fill="none" stroke="#17231C" stroke-width="7"/>'
  ),
} as const;

export type TemplateArtId = keyof typeof TEMPLATE_ART;

/** UTF-8 safe base64 (the art is ASCII today, but stay safe if a label is added) */
function base64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

export function templateArtUrl(id: TemplateArtId): string {
  return `data:image/svg+xml;base64,${base64(TEMPLATE_ART[id])}`;
}
