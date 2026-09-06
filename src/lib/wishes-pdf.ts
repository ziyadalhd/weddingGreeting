import type { WishRow } from "@/lib/wishes";

const pageWidthMm = 210;
const pageHeightMm = 297;
const pxPerMm = 3.7795;
const pageWidthPx = Math.round(pageWidthMm * pxPerMm);

const dateFormatter = new Intl.DateTimeFormat("ar-SA", {
  dateStyle: "medium",
  timeStyle: "short",
});

type BuiltDocument = {
  root: HTMLElement;
  /** Each block (heading, then one per wish) that must never be split across a page. */
  blocks: HTMLElement[];
};

/**
 * Builds an offscreen, plain-colored (no color-mix) Arabic document listing
 * every wish, so html2canvas rasterizes exactly what a browser would render.
 */
function buildDocument(wishes: WishRow[], title: string): BuiltDocument {
  const root = document.createElement("div");
  root.dir = "rtl";
  root.lang = "ar";
  Object.assign(root.style, {
    position: "fixed",
    top: "0",
    insetInlineStart: "-100000px",
    width: `${pageWidthPx}px`,
    padding: "48px",
    background: "#ffffff",
    color: "#201e1d",
    fontFamily: '"IBM Plex Sans Arabic", Tahoma, Arial, sans-serif',
    boxSizing: "border-box",
  } satisfies Partial<CSSStyleDeclaration>);

  const heading = document.createElement("h1");
  heading.textContent = title;
  Object.assign(heading.style, {
    margin: "0 0 24px",
    fontSize: "28px",
    borderBottom: "2px solid #ae1800",
    paddingBottom: "12px",
  } satisfies Partial<CSSStyleDeclaration>);
  root.appendChild(heading);

  const blocks: HTMLElement[] = [heading];

  for (const wish of wishes) {
    const entry = document.createElement("div");
    Object.assign(entry.style, {
      padding: "16px 0",
      borderBottom: "1px solid #d7d3d3",
      breakInside: "avoid",
    } satisfies Partial<CSSStyleDeclaration>);

    const name = document.createElement("div");
    name.textContent = wish.guestName;
    Object.assign(name.style, {
      fontSize: "17px",
      fontWeight: "700",
      color: "#ae1800",
    } satisfies Partial<CSSStyleDeclaration>);

    const message = document.createElement("div");
    message.textContent = wish.message;
    Object.assign(message.style, {
      fontSize: "15px",
      lineHeight: "1.8",
      whiteSpace: "pre-line",
      margin: "6px 0",
    } satisfies Partial<CSSStyleDeclaration>);

    const date = document.createElement("div");
    date.textContent = dateFormatter.format(new Date(wish.createdAt));
    Object.assign(date.style, {
      fontSize: "11px",
      color: "#7d7979",
    } satisfies Partial<CSSStyleDeclaration>);

    entry.append(name, message, date);
    root.appendChild(entry);
    blocks.push(entry);
  }

  return { root, blocks };
}

/** Renders every wish to a paginated A4 PDF and triggers a download. */
export async function downloadWishesPdf(wishes: WishRow[], title: string, fileName: string): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas-pro"),
    import("jspdf"),
  ]);

  await document.fonts?.ready;

  const { root: node, blocks } = buildDocument(wishes, title);
  document.body.appendChild(node);

  try {
    const nodeTop = node.getBoundingClientRect().top;
    // Bottom edge of each block, in CSS px relative to the document's own top,
    // rounded up so a block's own boundary never gets sliced by float error.
    const blockBottomsCss = blocks.map((block) => Math.ceil(block.getBoundingClientRect().bottom - nodeTop));

    const canvas = await html2canvas(node, { scale: 2, backgroundColor: "#ffffff" });
    const scale = canvas.width / node.offsetWidth;
    const pageCapacityPx = Math.round((canvas.width / pageWidthMm) * pageHeightMm);

    // Only ever cut a page at a block boundary (or, as a last resort, inside a
    // single block taller than one page) so a name/message is never split.
    const breakPointsPx = [0];
    let pageStartPx = 0;
    let blockTopPx = 0;

    for (const bottomCss of blockBottomsCss) {
      const bottomPx = Math.min(canvas.height, Math.round(bottomCss * scale));

      if (bottomPx - pageStartPx > pageCapacityPx) {
        // This block doesn't fit in what's left of the current page.
        if (blockTopPx > pageStartPx) {
          // Content already sits on this page: start a fresh page before this block.
          breakPointsPx.push(blockTopPx);
          pageStartPx = blockTopPx;
        }

        // The block alone is still taller than a full page: fall back to slicing
        // through it, since there is no boundary left to break on cleanly.
        while (bottomPx - pageStartPx > pageCapacityPx) {
          const cut = pageStartPx + pageCapacityPx;
          breakPointsPx.push(cut);
          pageStartPx = cut;
        }
      }

      blockTopPx = bottomPx;
    }

    if (breakPointsPx[breakPointsPx.length - 1] < canvas.height) {
      breakPointsPx.push(canvas.height);
    }

    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    let pageIndex = 0;

    for (let i = 1; i < breakPointsPx.length; i += 1) {
      const startPx = breakPointsPx[i - 1];
      const endPx = breakPointsPx[i];
      const sliceHeightPx = endPx - startPx;

      if (sliceHeightPx <= 0) continue;

      const slice = document.createElement("canvas");
      slice.width = canvas.width;
      slice.height = sliceHeightPx;

      const sliceContext = slice.getContext("2d");
      if (!sliceContext) throw new Error("Canvas is unavailable in this browser.");

      sliceContext.drawImage(canvas, 0, -startPx);

      const imageData = slice.toDataURL("image/png");
      const sliceHeightMm = (sliceHeightPx / canvas.width) * pageWidthMm;

      if (pageIndex > 0) pdf.addPage();
      pdf.addImage(imageData, "PNG", 0, 0, pageWidthMm, sliceHeightMm);

      pageIndex += 1;
    }

    pdf.save(fileName);
  } finally {
    node.remove();
  }
}
