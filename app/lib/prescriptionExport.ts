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

/** Styles for the print iframe — shared by both print and PDF download. */
const IFRAME_PRINT_STYLES = `
  @page { size: A4; margin: 0; }
  html, body {
    margin: 0;
    padding: 0;
    background: #ffffff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    text-rendering: geometricPrecision;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
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


function stylePrescriptionCloneForPrint(clone: HTMLElement): void {
  clone.style.width = "210mm";
  clone.style.minHeight = "297mm";
  clone.style.height = "297mm";
  clone.style.boxShadow = "none";
  clone.style.margin = "0";
  clone.style.border = "none";
}


function buildIframeDocument(extraStyles: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Prescription</title>
  ${copyPageStyles()}
  <style>${extraStyles}</style>
</head>
<body></body>
</html>`;
}

function createPrescriptionIframe(
  element: HTMLElement,
  extraStyles: string,
  prepareClone: (clone: HTMLElement) => void,
): {
  iframe: HTMLIFrameElement;
  iframeDoc: Document;
  card: HTMLElement;
} {
  const iframe = document.createElement("iframe");
  iframe.setAttribute(
    "style",
    `position:fixed;left:-9999px;top:0;width:${A4_WIDTH_PX}px;height:${A4_HEIGHT_PX}px;border:0;visibility:hidden`,
  );
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument ?? iframe.contentWindow?.document;
  if (!iframeDoc) {
    iframe.remove();
    throw new Error("Could not create prescription export frame");
  }

  const clone = element.cloneNode(true) as HTMLElement;
  prepareClone(clone);

  iframeDoc.open();
  iframeDoc.write(buildIframeDocument(extraStyles));
  iframeDoc.body.appendChild(clone);
  iframeDoc.close();

  const card = iframeDoc.getElementById(PRESCRIPTION_CARD_ID) ?? clone;

  return { iframe, iframeDoc, card };
}

async function waitForStylesheets(doc: Document): Promise<void> {
  const links = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));

  await Promise.all(
    links.map(
      (link) =>
        new Promise<void>((resolve) => {
          const sheet = link as HTMLLinkElement;
          if (sheet.sheet) {
            resolve();
            return;
          }
          link.addEventListener("load", () => resolve(), { once: true });
          link.addEventListener("error", () => resolve(), { once: true });
          setTimeout(resolve, 5000);
        }),
    ),
  );
}

async function waitForIframeReady(
  iframeDoc: Document,
  delayMs = 250,
): Promise<void> {
  await waitForStylesheets(iframeDoc);

  if (iframeDoc.fonts?.ready) {
    await iframeDoc.fonts.ready;
  }

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

  await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
}

export function printPrescription(element: HTMLElement): void {
  const { iframe, card } = createPrescriptionIframe(
    element,
    IFRAME_PRINT_STYLES,
    stylePrescriptionCloneForPrint,
  );
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
  const [{ default: html2canvas}, { jsPDF }] = await Promise.all([
    import("html2canvas-pro"),
    import("jspdf"),
  ]);
  

  // Reuse the exact same iframe pipeline as printPrescription()
  const { iframe, iframeDoc, card } = createPrescriptionIframe(
    element,
    IFRAME_PRINT_STYLES,
    stylePrescriptionCloneForPrint,
  );

  try {
<<<<<<< HEAD
    await waitForIframeRender();
  
=======
    await waitForIframeReady(iframeDoc);
>>>>>>> 2d7ad80b977929210e27a43c76d44b38492a14da

    // html2canvas derives its rendering context from card.ownerDocument,
    // which is the iframe document — same styles/fonts as printPrescription().
    const canvas = await html2canvas(card, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      foreignObjectRendering: true,
      logging: false,
      imageTimeout: 0,
      windowWidth: A4_WIDTH_PX,
      windowHeight: A4_HEIGHT_PX,
    });

<<<<<<< HEAD

    const imgData = canvas.toDataURL("image/jpeg", 0.92);
=======
    const imgData = canvas.toDataURL("image/png");
>>>>>>> 2d7ad80b977929210e27a43c76d44b38492a14da
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    pdf.addImage(imgData, "PNG", 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);
    pdf.save(filename);
  } finally {
    iframe.remove();
  }
}

export { PRESCRIPTION_CARD_ID };
