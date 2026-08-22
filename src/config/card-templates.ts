export type CardTemplateId = "ivory" | "midnight" | "rose";

export type CardTemplate = {
  id: CardTemplateId;
  name: string;
  background: string;
  surface: string;
  text: string;
  mutedText: string;
  accent: string;
  ornament: "frame" | "arch" | "corners";
};

export const cardTemplates: readonly CardTemplate[] = [
  {
    id: "ivory",
    name: "عاجي",
    background: "#F5F0E7",
    surface: "#FBF8F2",
    text: "#183D35",
    mutedText: "#6F776F",
    accent: "#A98C5C",
    ornament: "frame",
  },
  {
    id: "midnight",
    name: "كحلي",
    background: "#132437",
    surface: "#182B40",
    text: "#F6F0E5",
    mutedText: "#C8C6BE",
    accent: "#C3A36A",
    ornament: "arch",
  },
  {
    id: "rose",
    name: "وردي",
    background: "#F3EAE8",
    surface: "#F8F1EF",
    text: "#512F3D",
    mutedText: "#806D73",
    accent: "#B18370",
    ornament: "corners",
  },
] as const;

export function getCardTemplate(id: CardTemplateId): CardTemplate {
  const template = cardTemplates.find((item) => item.id === id);

  if (!template) {
    throw new Error(`Unknown card template: ${id}`);
  }

  return template;
}
