import type { CardTemplate } from "@/config/card-templates";

const cardWidth = 1200;
const cardHeight = 1500;
const margin = 110;
const fontFamily = '"IBM Plex Sans Arabic", Tahoma, Arial, sans-serif';

type RenderCardOptions = {
  template: CardTemplate;
  groomName: string;
  guestName: string;
  message: string;
  dateLine: string;
};

function arFont(weight: number, size: number): string {
  return `${weight} ${size}px ${fontFamily}`;
}

function wrapLines(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;

    if (context.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }

  if (line) lines.push(line);
  return lines;
}

function drawFrame(
  context: CanvasRenderingContext2D,
  color: string,
) {
  context.strokeStyle = color;
  context.lineWidth = 2;
  context.strokeRect(45, 45, cardWidth - 90, cardHeight - 90);

  context.fillStyle = color;
  const s = 14;
  const corners: Array<[number, number]> = [
    [45, 45],
    [cardWidth - 45, 45],
    [45, cardHeight - 45],
    [cardWidth - 45, cardHeight - 45],
  ];

  for (const [x, y] of corners) {
    context.save();
    context.translate(x, y);
    context.rotate(Math.PI / 4);
    context.fillRect(-s / 2, -s / 2, s, s);
    context.restore();
  }
}

function drawRings(
  context: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
) {
  context.strokeStyle = color;
  context.lineWidth = 3;
  context.beginPath();
  context.arc(cx - r * 0.55, cy, r, 0, Math.PI * 2);
  context.stroke();
  context.beginPath();
  context.arc(cx + r * 0.55, cy, r, 0, Math.PI * 2);
  context.stroke();
}

function drawFramedCard(
  context: CanvasRenderingContext2D,
  template: CardTemplate,
  groomName: string,
  guestName: string,
  message: string,
  dateLine: string,
  nameFontSize: number,
) {
  drawFrame(context, template.divider);
  context.fillStyle = template.accent;
  context.fillRect(margin, 90, cardWidth - margin * 2, 6);

  let y = 190;
  context.textAlign = "right";
  context.fillStyle = template.dark ? template.mutedText : template.accent;
  context.font = arFont(600, 26);
  context.fillText("بمناسبة زواج", cardWidth - margin, y);
  drawRings(context, cardWidth - margin - 220, y - 8, 13, template.accent);

  y += nameFontSize === 130 ? 110 : 100;
  context.fillStyle = template.text;
  context.font = arFont(700, nameFontSize);
  context.fillText(groomName, cardWidth - margin, y);
  y += 56;

  context.fillStyle = template.mutedText;
  context.font = arFont(400, 26);
  context.fillText(dateLine, cardWidth - margin, y);
  y += 46;

  context.strokeStyle = template.divider;
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(margin, y);
  context.lineTo(cardWidth - margin, y);
  context.stroke();
  y += 56;

  context.fillStyle = template.text;
  context.font = arFont(400, 32);
  const lines = wrapLines(context, `«${message}»`, cardWidth - margin * 2);
  for (const line of lines) {
    context.fillText(line, cardWidth - margin, y);
    y += 46;
  }
  y += 20;

  context.fillStyle = template.accent;
  context.font = arFont(700, 28);
  context.fillText(`— ${guestName}`, cardWidth - margin, y);
}

function drawLedgerCard(
  context: CanvasRenderingContext2D,
  template: CardTemplate,
  groomName: string,
  guestName: string,
  message: string,
  dateLine: string,
) {
  context.fillStyle = template.accent;
  context.fillRect(0, 0, cardWidth, 8);

  let y = 150;
  context.textAlign = "right";
  drawRings(context, cardWidth - margin - 20, y - 40, 13, template.accent);

  const rows: Array<[string, string]> = [
    ["المناسبة", `زواج ${groomName}`],
    ["التاريخ", dateLine],
    ["من", guestName],
  ];

  for (const [label, value] of rows) {
    context.fillStyle = template.mutedText;
    context.font = arFont(400, 22);
    context.fillText(label, cardWidth - margin, y);

    context.fillStyle = label === "من" ? template.accent : template.text;
    context.font = arFont(700, 32);
    context.fillText(value, cardWidth - margin, y + 44);
    y += 100;

    context.strokeStyle = template.divider;
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(margin, y);
    context.lineTo(cardWidth - margin, y);
    context.stroke();
    y += 50;
  }

  context.fillStyle = template.mutedText;
  context.font = arFont(400, 22);
  context.fillText("الرسالة", cardWidth - margin, y);
  y += 50;

  context.fillStyle = template.text;
  context.font = arFont(400, 32);
  const lines = wrapLines(context, message, cardWidth - margin * 2);
  for (const line of lines) {
    context.fillText(line, cardWidth - margin, y);
    y += 46;
  }

  context.fillStyle = template.accent;
  context.fillRect(0, cardHeight - 8, cardWidth, 8);
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
  dateLine,
}: RenderCardOptions): Promise<Blob> {
  await document.fonts?.load(arFont(700, 120)).catch(() => undefined);
  await document.fonts?.ready;

  const canvas = document.createElement("canvas");
  canvas.width = cardWidth;
  canvas.height = cardHeight;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is unavailable in this browser.");
  }

  context.direction = "rtl";
  context.fillStyle = template.background;
  context.fillRect(0, 0, cardWidth, cardHeight);

  if (template.id === "ledger") {
    drawLedgerCard(context, template, groomName, guestName, message, dateLine);
  } else {
    drawFramedCard(
      context,
      template,
      groomName,
      guestName,
      message,
      dateLine,
      template.id === "poster" ? 130 : 120,
    );
  }

  return canvasToBlob(canvas);
}
