import type { CardTemplateId } from "@/config/card-templates";

export const maxNameLength = 50;
export const maxMessageLength = 280;

const pendingKey = "abdullah-wedding:pending-wish";

export type WishDraft = {
  guestName: string;
  message: string;
  cardStyle: CardTemplateId;
};

/** Returns an Arabic error message, or null when the draft is valid. */
export function validateWish(
  draft: Pick<WishDraft, "guestName" | "message">,
): string | null {
  const guestName = draft.guestName.trim();
  const message = draft.message.trim();

  if (!guestName) return "اكتب اسمك من فضلك";
  if (guestName.length > maxNameLength) return `الاسم طويل، الحد ${maxNameLength} حرفًا`;
  if (!message) return "اكتب تهنئتك من فضلك";
  if (message.length > maxMessageLength) return `التهنئة طويلة، الحد ${maxMessageLength} حرفًا`;

  return null;
}

export function readPendingWish(storage: Storage): WishDraft | null {
  const raw = storage.getItem(pendingKey);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as WishDraft;
  } catch {
    storage.removeItem(pendingKey);
    return null;
  }
}

export function writePendingWish(storage: Storage, draft: WishDraft): void {
  storage.setItem(pendingKey, JSON.stringify(draft));
}

export function clearPendingWish(storage: Storage): void {
  storage.removeItem(pendingKey);
}
