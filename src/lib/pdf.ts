import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf.mjs";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.mjs",
  import.meta.url
).toString();

type RawTextItem = {
  str?: string;
  transform?: number[];
  hasEOL?: boolean;
};

export type ExtractedPdfPage = {
  pageNumber: number;
  content: string;
};

function normalizePageText(items: RawTextItem[]) {
  const lines: string[] = [];
  let currentLine = "";
  let lastY: number | null = null;

  for (const item of items) {
    const rawText = item.str?.trim();
    if (!rawText) {
      continue;
    }

    const y = item.transform?.[5] ?? null;
    const isNewLine = lastY !== null && y !== null && Math.abs(lastY - y) > 2;

    if (isNewLine || item.hasEOL) {
      if (currentLine.trim()) {
        lines.push(currentLine.trim());
      }
      currentLine = rawText;
    } else {
      currentLine = `${currentLine} ${rawText}`.trim();
    }

    lastY = y;
  }

  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export async function extractPdfPages(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const loadingTask = getDocument({ data: bytes, useWorkerFetch: false, isEvalSupported: false });
  const pdf = await loadingTask.promise;
  const pages: ExtractedPdfPage[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const content = normalizePageText(textContent.items as RawTextItem[]);

    if (content) {
      pages.push({ pageNumber, content });
    }
  }

  return {
    pages,
    pageCount: pdf.numPages,
    text: pages.map((page) => page.content).join("\n\n"),
  };
}