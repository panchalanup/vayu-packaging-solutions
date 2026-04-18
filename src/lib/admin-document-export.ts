import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { saveAs } from "file-saver";

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
  const canvas = await renderCanvas(elementId);

  return new Promise<void>((resolve, reject) => {
    canvas.toBlob((blob) => {
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
  const imageData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imageWidth = pageWidth;
  const imageHeight = (canvas.height * imageWidth) / canvas.width;

  let currentHeight = imageHeight;
  let position = 0;

  pdf.addImage(imageData, "PNG", 0, position, imageWidth, imageHeight);

  while (currentHeight > pageHeight) {
    position = currentHeight - imageHeight;
    currentHeight -= pageHeight;
    pdf.addPage();
    pdf.addImage(imageData, "PNG", 0, -position, imageWidth, imageHeight);
  }

  pdf.save(`${fileName}.pdf`);
};