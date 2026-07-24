const PRESCRIPTION_CARD_ID = "prescription-card";
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

export function getPrescriptionFilename(displayId: string): string {
  const safeId = displayId.replace(/[^\w-]/g, "_");
  return `Prescription_${safeId}.pdf`;
}

function copyPageStyles(): string {
  return Array.from(
    document.querySelectorAll('link[rel="stylesheet"], style'),
  )
    .map((node) => node.outerHTML)
    .join("\n");
}

const IFRAME_PRINT_STYLES = `
  @page { size: A4; margin: 0; }
  html, body {
    margin: 0;
    padding: 0;
    background: #ffffff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  #prescription-card {
    width: 210mm !important;
    min-height: 297mm !important;
    height: 297mm !important;
    margin: 0 !important;
    box-shadow: none !important;
    border: none !important;
  }
`;

function createPrescriptionIframe(element: HTMLElement): {
  iframe: HTMLIFrameElement;
  card: HTMLElement;
} {
  const iframe = document.createElement("iframe");
  iframe.setAttribute(
    "style",
    "position:fixed;left:-9999px;top:0;width:794px;height:1123px;border:0;visibility:hidden",
  );
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument ?? iframe.contentWindow?.document;
  if (!iframeDoc) {
    iframe.remove();
    throw new Error("Could not create prescription export frame");
  }

  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.width = "210mm";
  clone.style.minHeight = "297mm";
  clone.style.height = "297mm";
  clone.style.boxShadow = "none";
  clone.style.margin = "0";
  clone.style.border = "none";

  iframeDoc.open();
  iframeDoc.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Prescription</title>
  ${copyPageStyles()}
  <style>${IFRAME_PRINT_STYLES}</style>
</head>
<body></body>
</html>`);
  iframeDoc.body.appendChild(clone);
  iframeDoc.close();

  return { iframe, card: clone };
}

async function waitForIframeRender(): Promise<void> {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
  await new Promise<void>((resolve) => setTimeout(resolve, 100));
}

export function printPrescription(element: HTMLElement): void {
  const { iframe, card } = createPrescriptionIframe(element);
  const iframeWindow = iframe.contentWindow;
  if (!iframeWindow) {
    iframe.remove();
    return;
  }

  const cleanup = () => {
    iframe.remove();
    iframeWindow.removeEventListener("afterprint", cleanup);
  };

  iframeWindow.addEventListener("afterprint", cleanup);

  setTimeout(() => {
    iframeWindow.focus();
    iframeWindow.print();
  }, 250);

  setTimeout(cleanup, 60_000);

  void card;
}

export async function downloadPrescriptionPdf(
  element: HTMLElement,
  filename: string,
): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas-pro"),
    import("jspdf"),
  ]);

  const { iframe, card } = createPrescriptionIframe(element);

  try {
    await waitForIframeRender();

    const canvas = await html2canvas(card, {
      scale: 1.5,
      width: A4_WIDTH_PX,
      height: A4_HEIGHT_PX,
      windowWidth: A4_WIDTH_PX,
      windowHeight: A4_HEIGHT_PX,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.92);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    pdf.addImage(imgData, "JPEG", 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);
    pdf.save(filename);
  } finally {
    iframe.remove();
  }
}

export { PRESCRIPTION_CARD_ID };
