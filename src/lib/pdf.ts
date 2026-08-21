import html2pdf from "html2pdf.js";

export interface PdfOptions {
  filename: string;
  header: boolean;
  footer: boolean;
  metaLeft: string;
  metaRight: string;
  watermark?: string;
}

/**
 * Renders the given A4 sheet node to a paginated PDF with optional
 * per-page header/footer and a watermark line.
 */
export async function exportResumePdf(node: HTMLElement, opts: PdfOptions) {
  const hasChrome = opts.header || opts.footer;
  const worker = html2pdf()
    .set({
      margin: [opts.header ? 9 : 0, 0, opts.footer || opts.watermark ? 11 : 0, 0],
      filename: `${opts.filename.replace(/\.pdf$/i, "")}.pdf`,
      image: { type: "jpeg", quality: 0.97 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"], avoid: [".rs-item"] },
    } as any)
    .from(node);

  await worker.toPdf().get("pdf").then((pdf: any) => {
    const pages = pdf.getNumberOfPages();
    const W = 210;
    const H = 297;
    for (let i = 1; i <= pages; i++) {
      pdf.setPage(i);
      pdf.setFont("helvetica", "normal");
      if (opts.header) {
        pdf.setFontSize(7.5);
        pdf.setTextColor(130);
        pdf.text(opts.metaRight, W - 8, 5.5, { align: "right" });
      }
      if (opts.footer || opts.watermark) {
        pdf.setFontSize(7.5);
        pdf.setTextColor(130);
        if (opts.footer) {
          pdf.text(opts.metaLeft, 8, H - 5);
          pdf.text(`Page ${i} / ${pages}`, W - 8, H - 5, { align: "right" });
        }
        if (opts.watermark) {
          pdf.setTextColor(165);
          pdf.text(opts.watermark, W / 2, H - 5, { align: "center" });
        }
      }
    }
  });

  await worker.save();
  if (hasChrome) {
    // no-op kept for readability
  }
}

export function printResume() {
  window.print();
}
