/**
 * Template thumbnail: the box drawing (BoxThumbnail) in the template's colour with its sticker composition on the
 * front, lid and side. Stickers are looked up in the lazy library, so a MarkedThumb only works once the library has
 * loaded (the gallery loads it when it opens). Quick start uses the plain thumbnail so opening the designer never
 * downloads the cutout library.
 */

import BoxThumbnail, { type ThumbMark } from './BoxThumbnail';
import type { DesignTemplate } from '@/lib/boxDesigner/templates';
import { templateArtUrl } from '@/lib/boxDesigner/templateArt';
import { useStickerMarks } from './useStickerMarks';

interface TemplateThumbProps {
  template: DesignTemplate;
  className?: string;
  /** Draw the sticker composition (needs the library loaded; see useStickerLibrary) */
  marks?: boolean;
}

function Plain({ template, marks, className }: { template: DesignTemplate; marks?: ThumbMark[]; className?: string }) {
  return (
    <BoxThumbnail
      style={template.style}
      dimensions={template.dimensions}
      colorHex={template.colorHex}
      artUrl={template.art ? templateArtUrl(template.art.id) : null}
      marks={marks}
      className={className}
      title={template.name}
    />
  );
}

function Marked({ template, className }: { template: DesignTemplate; className?: string }) {
  return <Plain template={template} marks={useStickerMarks(template.stickers)} className={className} />;
}

export default function TemplateThumb({ template, className, marks = false }: TemplateThumbProps) {
  return marks && template.stickers.length > 0 ? <Marked template={template} className={className} /> : <Plain template={template} className={className} />;
}
