import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { saveAs } from "file-saver";

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const A4_IMAGE_WIDTH_PX = 2480;
const A4_IMAGE_HEIGHT_PX = 3508;
const MIN_PDF_SLICE_HEIGHT_PX = 8;

const getPreviewElement = (elementId: string) => {
  const element = document.getElementById(elementId);

  if (!element) {
    throw new Error("Document preview element not found");
  }

  return element;
};

const renderCanvas = async (elementId: string) => {
  const element = getPreviewElement(elementId);

  return html2canvas(element, {
    backgroundColor: "#ffffff",
    scale: 2,
    useCORS: true,
    logging: false,
  });
};

export const exportElementAsImage = async (elementId: string, fileName: string) => {
  const sourceCanvas = await renderCanvas(elementId);

  const a4Canvas = document.createElement("canvas");
  a4Canvas.width = A4_IMAGE_WIDTH_PX;
  a4Canvas.height = A4_IMAGE_HEIGHT_PX;

  const context = a4Canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to prepare image canvas");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, a4Canvas.width, a4Canvas.height);

  const scale = Math.min(a4Canvas.width / sourceCanvas.width, a4Canvas.height / sourceCanvas.height);
  const drawWidth = sourceCanvas.width * scale;
  const drawHeight = sourceCanvas.height * scale;
  const drawX = (a4Canvas.width - drawWidth) / 2;
  const drawY = (a4Canvas.height - drawHeight) / 2;

  context.drawImage(sourceCanvas, drawX, drawY, drawWidth, drawHeight);

  return new Promise<void>((resolve, reject) => {
    a4Canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Unable to generate image"));
        return;
      }

      saveAs(blob, `${fileName}.png`);
      resolve();
    }, "image/png");
  });
};

export const exportElementAsPdf = async (elementId: string, fileName: string) => {
  const canvas = await renderCanvas(elementId);

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const marginMm = 8;
  const printableWidthMm = A4_WIDTH_MM - marginMm * 2;
  const printableHeightMm = A4_HEIGHT_MM - marginMm * 2;

  const scalePxPerMm = canvas.width / printableWidthMm;
  const pageHeightPx = Math.ceil(printableHeightMm * scalePxPerMm);

  let sourceY = 0;
  let pageIndex = 0;

  while (sourceY < canvas.height) {
    const sliceHeightPx = Math.min(pageHeightPx, canvas.height - sourceY);

    // Avoid generating an extra blank page from tiny rounding remainders.
    if (sliceHeightPx < MIN_PDF_SLICE_HEIGHT_PX) {
      break;
    }

    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = canvas.width;
    pageCanvas.height = sliceHeightPx;

    const pageContext = pageCanvas.getContext("2d");

    if (!pageContext) {
      throw new Error("Unable to prepare PDF page canvas");
    }

    pageContext.fillStyle = "#ffffff";
    pageContext.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
    pageContext.drawImage(canvas, 0, sourceY, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);

    const pageImageData = pageCanvas.toDataURL("image/png");
    const sliceHeightMm = sliceHeightPx / scalePxPerMm;

    if (pageIndex > 0) {
      pdf.addPage();
    }

    pdf.addImage(pageImageData, "PNG", marginMm, marginMm, printableWidthMm, sliceHeightMm);

    sourceY += sliceHeightPx;
    pageIndex += 1;
  }

  pdf.save(`${fileName}.pdf`);
};