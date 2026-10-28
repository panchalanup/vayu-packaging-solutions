/**
 * The cutouts that ride on the footer boxes: a dozen recognisable ones from our own sticker library
 * (credits on /image-credits). Imported lazily by the playground only, so none of this is in the main bundle.
 */

export interface BoxSticker {
  id: string;
  name: string;
  src: string;
}

const url = (rel: string) => new URL(rel, import.meta.url).href;

export const BOX_STICKERS: readonly BoxSticker[] = [
  { id: 'mango', name: 'Mango', src: url('../../../assets/stickers/fruits-veg/mango.svg') },
  { id: 'apple', name: 'Apple', src: url('../../../assets/stickers/fruits-veg/apple.svg') },
  { id: 'sneaker', name: 'Sneaker', src: url('../../../assets/stickers/footwear-accessories/sneaker.svg') },
  { id: 'gift', name: 'Gift', src: url('../../../assets/stickers/gifts-festive/gift.svg') },
  { id: 'birthday-cake', name: 'Cake', src: url('../../../assets/stickers/bakery-food/birthday-cake.svg') },
  { id: 'jar', name: 'Jar', src: url('../../../assets/stickers/bakery-food/jar.svg') },
  { id: 't-shirt', name: 'T-shirt', src: url('../../../assets/stickers/clothing/t-shirt.svg') },
  { id: 'cupcake', name: 'Cupcake', src: url('../../../assets/stickers/bakery-food/cupcake.svg') },
  { id: 'lipstick', name: 'Lipstick', src: url('../../../assets/stickers/beauty-wellness/lipstick.svg') },
  { id: 'handbag', name: 'Handbag', src: url('../../../assets/stickers/footwear-accessories/handbag.svg') },
  { id: 'teapot', name: 'Teapot', src: url('../../../assets/stickers/drinks/teapot.svg') },
  { id: 'candle', name: 'Candle', src: url('../../../assets/stickers/beauty-wellness/candle.svg') },
];
