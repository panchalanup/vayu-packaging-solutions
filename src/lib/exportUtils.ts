import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ScoredResult, UserInput } from '@/types/packaging';
import { CONTACT_INFO, WEBSITE_URL, COMPANY_INFO } from '@/constants';

export function exportToCSV(result: ScoredResult, input: UserInput) {
  const csvData = [
    [
      'Product Name',
      'Quantity',
      'Weight (kg)',
      'Dimensions (mm)',
      'Box Style',
      'Board Type',
      'Flute Type',
      'Liner GSM',
      'Fluting GSM',
      'ECT (lb/in)',
      'Burst Strength (kg/cm²)',
      'Internal Protection',
      'Tape Type',
      'Strapping Type',
      'Extras',
      'Price per Unit (₹)',
      'Pros',
      'Cons',
    ],
    [
      input.product_name,
      input.quantity.toString(),
      result.product_weight_kg.toString(),
      `${result.product_length_mm}×${result.product_width_mm}×${result.product_height_mm}`,
      result.box_style,
      result.board_type,
      result.flute_type,
      result.liner_gsm.toString(),
      result.fluting_gsm.toString(),
      result.ECT_lb_per_in.toString(),
      result.burst_strength_kg_cm2.toString(),
      result.internal_protection,
      result.tape_type,
      result.strapping_type,
      result.extra_packaging,
      result.estimated_price_inr.toFixed(2),
      result.pros,
      result.cons,
    ],
  ];

  const csvContent = csvData.map((row) => row.map(field => `"${field}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `packaging-spec-${Date.now()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPDF(result: ScoredResult, input: UserInput) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('Packaging Specification', 14, 22);

  // Company Info
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Vayu Packaging Solutions', 14, 30);
  doc.text(new Date().toLocaleDateString(), 14, 35);

  // Product Details
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text('Product Information', 14, 48);

  const productInfo = [
    ['Product Name', input.product_name],
    ['Quantity', input.quantity.toString()],
    ['Weight', `${result.product_weight_kg} kg`],
    ['Dimensions', `${result.product_length_mm} × ${result.product_width_mm} × ${result.product_height_mm} mm`],
    ['Fragility', input.fragility],
    ['Transport', input.transport_type],
  ];

  autoTable(doc, {
    startY: 52,
    head: [],
    body: productInfo,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40 },
      1: { cellWidth: 140 },
    },
  });

  // Box Specifications
  doc.setFontSize(14);
  doc.text('Box Specifications', 14, (doc as any).lastAutoTable.finalY + 15);

  const boxSpecs = [
    ['Box Style', result.box_style],
    ['Board Type', result.board_type],
    ['Flute Type', result.flute_type],
    ['Liner GSM', result.liner_gsm.toString()],
    ['Fluting GSM', result.fluting_gsm.toString()],
    ['ECT (lb/in)', result.ECT_lb_per_in.toString()],
    ['Burst Strength', `${result.burst_strength_kg_cm2} kg/cm²`],
  ];

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 19,
    head: [],
    body: boxSpecs,
    theme: 'striped',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 130 },
    },
  });

  // Protection & Accessories
  doc.setFontSize(14);
  doc.text('Protection & Accessories', 14, (doc as any).lastAutoTable.finalY + 15);

  const accessories = [
    ['Internal Protection', result.internal_protection],
    ['Tape Type', result.tape_type],
    ['Strapping Type', result.strapping_type],
    ['Extra Packaging', result.extra_packaging],
  ];

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 19,
    head: [],
    body: accessories,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 130 },
    },
  });

  // Pricing
  doc.setFontSize(14);
  doc.text('Pricing', 14, (doc as any).lastAutoTable.finalY + 15);

  const pricing = [
    ['Price per Unit', `₹${result.estimated_price_inr.toFixed(2)}`],
    ['Total Cost (estimated)', `₹${(result.estimated_price_inr * input.quantity).toFixed(2)}`],
  ];

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 19,
    head: [],
    body: pricing,
    theme: 'grid',
    styles: { fontSize: 11, cellPadding: 4, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 130, halign: 'right' },
    },
  });

  // Pros & Cons
  if ((doc as any).lastAutoTable.finalY < 250) {
    doc.setFontSize(12);
    doc.text('Pros', 14, (doc as any).lastAutoTable.finalY + 15);
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(result.pros, 14, (doc as any).lastAutoTable.finalY + 22, { maxWidth: 180 });

    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text('Cons', 14, (doc as any).lastAutoTable.finalY + 35);
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(result.cons, 14, (doc as any).lastAutoTable.finalY + 42, { maxWidth: 180 });
  }

  // Disclaimer
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  const disclaimerText = 'Disclaimer: Recommendations generated by Vayu Packaging Solutions\' Smart Packaging Finder tool. Please verify with packaging experts before final selection.';
  doc.text(disclaimerText, 14, 275, { maxWidth: 180, align: 'justify' });
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Contact: ${CONTACT_INFO.phone} | ${CONTACT_INFO.email} | ${WEBSITE_URL}`, 105, 285, { align: 'center' });

  // Save
  doc.save(`packaging-quote-${Date.now()}.pdf`);
}

export function generateEmailTemplate(result: ScoredResult, input: UserInput): string {
  return `Subject: Request for quote — Packaging for ${input.product_name}, qty ${input.quantity}

Dear Supplier,

Please provide a quote for the following packaging solution:

Product: ${input.product_name}
Qty: ${input.quantity} units

Box Specifications:
- Style: ${result.box_style}
- Board Type: ${result.board_type}
- Flute: ${result.flute_type}
- ECT: ${result.ECT_lb_per_in} lb/in
- Liner GSM: ${result.liner_gsm}
- Dimensions: ${result.product_length_mm} × ${result.product_width_mm} × ${result.product_height_mm} mm

Protection & Accessories:
- Internal Protection: ${result.internal_protection}
- Tape: ${result.tape_type}
- Strapping: ${result.strapping_type}
- Extras: ${result.extra_packaging}

Transport: ${input.transport_type}

Please provide your best quote including:
- Unit price
- Lead time
- Minimum order quantity
- Payment terms

Thank you for your prompt response.

Best regards,
[Your Name]
[Your Contact]`;
}

export function generateWhatsAppMessage(result: ScoredResult, input: UserInput): string {
  const totalCost = result.estimated_price_inr * input.quantity;
  
  return `Hi! 👋

I found a packaging recommendation using an online tool. Can you help verify if this is suitable for my needs?

📦 *My Product:*
• Product: ${input.product_name}
• Weight: ${result.product_weight_kg} kg
• Dimensions: ${result.product_length_mm} × ${result.product_width_mm} × ${result.product_height_mm} mm
• Fragility: ${result.fragility_level}
• Transport: ${result.transport_type}
• Quantity: ${input.quantity} units

*Recommended Packaging Solution:*
✅ Box Style: ${result.box_style}
✅ Board: ${result.board_type}, ${result.flute_type} Flute
✅ Strength: ECT ${result.ECT_lb_per_in} lb/in | Burst ${result.burst_strength_kg_cm2} kg/cm²
✅ Protection: ${result.internal_protection}
✅ Tape: ${result.tape_type}
${result.strapping_type !== 'None' ? `✅ Strapping: ${result.strapping_type}` : ''}
${result.extra_packaging !== 'None' ? `✅ Extras: ${result.extra_packaging}` : ''}

*Estimated Pricing:*
💰 Per Unit: ₹${result.estimated_price_inr.toFixed(2)}
💰 Total (${input.quantity} units): ₹${totalCost.toFixed(2)}

*Why Recommended:*
${result.reasons.slice(0, 2).map(r => `• ${r}`).join('\n')}

⚠️ This is a preliminary recommendation. I need your expert opinion to finalize.

━━━━━━━━━━━━━━━━
_Recommendation generated by:_
*Smart Packaging Finder Tool*
By ${COMPANY_INFO.name}

📞 ${CONTACT_INFO.phone}
✉️ ${CONTACT_INFO.email}
🌐 ${WEBSITE_URL}`;
}
