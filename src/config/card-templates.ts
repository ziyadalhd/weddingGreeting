export type CardTemplateId = "grid" | "poster" | "ledger";

export type CardTemplate = {
  id: CardTemplateId;
  name: string;
  description: string;
  background: string;
  text: string;
  mutedText: string;
  accent: string;
  divider: string;
  dark: boolean;
};

export const cardTemplates: readonly CardTemplate[] = [
  {
    id: "grid",
    name: "شبكة",
    description: "إطار وخطوط دقيقة",
    background: "#f3f2f2",
    text: "#201e1d",
    mutedText: "rgba(32, 30, 29, 0.55)",
    accent: "#ae1800",
    divider: "rgba(32, 30, 29, 0.35)",
    dark: false,
  },
  {
    id: "poster",
    name: "ملصق",
    description: "حقل داكن أنيق",
    background: "#2d2b2b",
    text: "#f3f2f2",
    mutedText: "rgba(243, 242, 242, 0.8)",
    accent: "#ae1800",
    divider: "rgba(243, 242, 242, 0.35)",
    dark: true,
  },
  {
    id: "ledger",
    name: "دفتر",
    description: "صفوف مذهّبة الطراز",
    background: "#eae9e9",
    text: "#201e1d",
    mutedText: "rgba(32, 30, 29, 0.55)",
    accent: "#ae1800",
    divider: "rgba(32, 30, 29, 0.35)",
    dark: false,
  },
] as const;

export function getCardTemplate(id: CardTemplateId): CardTemplate {
  const template = cardTemplates.find((item) => item.id === id);

  if (!template) {
    throw new Error(`Unknown card template: ${id}`);
  }

  return template;
}
