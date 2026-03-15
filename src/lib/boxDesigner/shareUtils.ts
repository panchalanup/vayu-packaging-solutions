/**
 * Share Utilities
 * Generate professional messages and handle sharing to WhatsApp/Email
 */

import { BoxDimensions, PlyType, BoxTemplate, FaceImage, TextElement } from '@/types/boxDesigner';
import { PLY_OPTIONS, BOX_TEMPLATES } from './constants';
import { COMPANY_INFO, WEBSITE_URL } from '@/constants';

interface ShareMessageOptions {
  dimensions: BoxDimensions;
  ply: PlyType;
  template: BoxTemplate;
  faceImages: FaceImage[];
  textElements: TextElement[];
}

/**
 * Format a professional share message with box specifications
 */
export function formatShareMessage({
  dimensions,
  ply,
  template,
  faceImages,
  textElements,
}: ShareMessageOptions): string {
  // Get human-readable names
  const plyConfig = PLY_OPTIONS.find(p => p.id === ply);
  const templateConfig = BOX_TEMPLATES.find(t => t.id === template);
  
  const message = `🎨 Custom Box Design Request

📦 Box Specifications:
• Dimensions: ${dimensions.length} × ${dimensions.width} × ${dimensions.height} cm (L × W × H)
• Type: ${templateConfig?.name || template}
• Material: ${plyConfig?.name || ply}
${faceImages.length > 0 ? `• Custom Graphics: ${faceImages.length} image${faceImages.length > 1 ? 's' : ''} added` : ''}
${textElements.length > 0 ? `• Custom Text: ${textElements.length} element${textElements.length > 1 ? 's' : ''} added` : ''}

💼 I designed this box using ${COMPANY_INFO.name}'s smart 3D Box Designer.

🔗 Design your own: ${WEBSITE_URL}/box-designer

Please provide a quote for this custom packaging.

---
Created with ${COMPANY_INFO.name}`;

  return message;
}

/**
 * Share design via WhatsApp
 * Opens WhatsApp with pre-filled message
 */
export function shareViaWhatsApp(messageOptions: ShareMessageOptions): void {
  const message = formatShareMessage(messageOptions);
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
  
  window.open(whatsappUrl, '_blank');
}

/**
 * Share design via Email
 * Opens default email client with pre-filled subject and body
 */
export function shareViaEmail(messageOptions: ShareMessageOptions): void {
  const message = formatShareMessage(messageOptions);
  const subject = `Custom Box Design Quote Request - ${COMPANY_INFO.name}`;
  
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(message);
  const mailtoUrl = `mailto:?subject=${encodedSubject}&body=${encodedBody}`;
  
  window.location.href = mailtoUrl;
}

/**
 * Get a user-friendly filename for the design screenshot
 */
export function getDesignFilename(dimensions: BoxDimensions): string {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return `box-design-${dimensions.length}x${dimensions.width}x${dimensions.height}-${timestamp}.png`;
}
