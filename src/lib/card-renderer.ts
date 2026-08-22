import type { CardTemplate } from "@/config/card-templates";

const cardWidth = 1080;
const cardHeight = 1350;
const sansFontFamily = '"Thmanyah Sans", Tahoma, Arial, sans-serif';
const displayFontFamily =
  '"Thmanyah Serif Display", "Thmanyah Sans", Tahoma, serif';
const textFontFamily =
  '"Thmanyah Serif Text", "Thmanyah Sans", Tahoma, serif';

type RenderCardOptions = {
  template: CardTemplate;
  groomName: string;
  guestName: string;
  message: string;
};

type FittedText = {
  fontSize: number;
  lineHeight: number;
  lines: string[];
};

function drawFrameOrnament(
  context: CanvasRenderingContext2D,
  template: CardTemplate,
) {
  context.save();
  context.strokeStyle = template.accent;
  context.lineWidth = 2;
  context.globalAlpha = 0.78;

  if (template.ornament === "frame") {
    context.strokeRect(58, 58, cardWidth - 116, cardHeight - 116);
    context.strokeRect(72, 72, cardWidth - 144, cardHeight - 144);
  }

  if (template.ornament === "arch") {
    context.beginPath();
    context.moveTo(98, cardHeight - 98);
    context.lineTo(98, 470);
    context.arc(cardWidth / 2, 470, cardWidth / 2 - 98, Math.PI, 0);
    context.lineTo(cardWidth - 98, cardHeight - 98);
    context.stroke();

    context.beginPath();
    context.arc(cardWidth / 2, 168, 5, 0, Math.PI * 2);
    context.fillStyle = template.accent;
    context.fill();
  }

  if (template.ornament === "corners") {
    const radius = 120;
    const inset = 62;

    context.beginPath();
    context.arc(inset, inset, radius, 0, Math.PI / 2);
    context.moveTo(cardWidth - inset - radius, inset);
    context.arc(cardWidth - inset, inset, radius, Math.PI / 2, Math.PI);
    context.moveTo(inset + radius, cardHeight - inset);
    context.arc(inset, cardHeight - inset, radius, -Math.PI / 2, 0);
    context.moveTo(cardWidth - inset, cardHeight - inset - radius);
    context.arc(
      cardWidth - inset,
      cardHeight - inset,
      radius,
      Math.PI,
      Math.PI * 1.5,
    );
    context.stroke();
  }

  context.restore();
}

function wrapParagraph(
  context: CanvasRenderingContext2D,
  paragraph: string,
  maxWidth: number,
): string[] {
  const words = paragraph.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;

    if (context.measureText(candidate).width <= maxWidth || !currentLine) {
      currentLine = candidate;
      continue;
    }

    lines.push(currentLine);
    currentLine = word;
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [""];
}

function wrapMessage(
  context: CanvasRenderingContext2D,
  message: string,
  maxWidth: number,
): string[] {
  return message
    .split(/\n+/)
    .flatMap((paragraph) => wrapParagraph(context, paragraph, maxWidth));
}

function fitMessage(
  context: CanvasRenderingContext2D,
  message: string,
  maxWidth: number,
  maxHeight: number,
): FittedText {
  for (let fontSize = 58; fontSize >= 36; fontSize -= 2) {
    const lineHeight = Math.round(fontSize * 1.62);
    context.font = `500 ${fontSize}px ${textFontFamily}`;
    const lines = wrapMessage(context, message, maxWidth);

    if (lines.length * lineHeight <= maxHeight) {
      return { fontSize, lineHeight, lines };
    }
  }

  const fontSize = 36;
  const lineHeight = Math.round(fontSize * 1.58);
  const maxLines = Math.floor(maxHeight / lineHeight);
  context.font = `500 ${fontSize}px ${textFontFamily}`;
  const lines = wrapMessage(context, message, maxWidth);
  const visibleLines = lines.slice(0, maxLines);

  if (lines.length > maxLines && visibleLines.length > 0) {
    let lastLine = visibleLines.at(-1) ?? "";

    while (
      lastLine.length > 1 &&
      context.measureText(`${lastLine}…`).width > maxWidth
    ) {
      lastLine = lastLine.slice(0, -1).trimEnd();
    }

    visibleLines[visibleLines.length - 1] = `${lastLine}…`;
  }

  return { fontSize, lineHeight, lines: visibleLines };
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error("Canvas could not be converted to PNG."));
    }, "image/png");
  });
}

export async function renderGreetingCard({
  template,
  groomName,
  guestName,
  message,
}: RenderCardOptions): Promise<Blob> {
  await Promise.all([
    document.fonts?.load('500 58px "Thmanyah Serif Text"').catch(() => undefined),
    document.fonts?.load('700 82px "Thmanyah Serif Display"').catch(() => undefined),
    document.fonts?.load('500 30px "Thmanyah Sans"').catch(() => undefined),
  ]);
  await document.fonts?.ready;

  const canvas = document.createElement("canvas");
  canvas.width = cardWidth;
  canvas.height = cardHeight;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is unavailable in this browser.");
  }

  context.fillStyle = template.background;
  context.fillRect(0, 0, cardWidth, cardHeight);
  drawFrameOrnament(context, template);

  context.direction = "rtl";
  context.textAlign = "center";
  context.textBaseline = "middle";

  context.fillStyle = template.text;
  context.font = `700 82px ${displayFontFamily}`;
  context.fillText(`إلى ${groomName}`, cardWidth / 2, 300);

  context.strokeStyle = template.accent;
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(cardWidth / 2 - 54, 378);
  context.lineTo(cardWidth / 2 + 54, 378);
  context.stroke();

  const fitted = fitMessage(context, message.trim(), 760, 510);
  context.fillStyle = template.text;
  context.font = `500 ${fitted.fontSize}px ${textFontFamily}`;

  const textBlockHeight = fitted.lines.length * fitted.lineHeight;
  const firstLineY = 675 - textBlockHeight / 2 + fitted.lineHeight / 2;

  fitted.lines.forEach((line, index) => {
    context.fillText(
      line,
      cardWidth / 2,
      firstLineY + index * fitted.lineHeight,
    );
  });

  context.fillStyle = template.mutedText;
  context.font = `400 30px ${sansFontFamily}`;
  context.fillText("من:", cardWidth / 2, 1110);

  context.fillStyle = template.text;
  context.font = `700 42px ${sansFontFamily}`;
  context.fillText(guestName.trim(), cardWidth / 2, 1172);

  return canvasToBlob(canvas);
}
