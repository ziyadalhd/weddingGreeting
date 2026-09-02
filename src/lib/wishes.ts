import type { CardTemplateId } from "@/config/card-templates";
import { getSupabase } from "@/lib/supabase";
import {
  clearPendingWish,
  readPendingWish,
  writePendingWish,
  type WishDraft,
} from "@/lib/wish-draft";

export type WishRow = WishDraft & {
  id: string;
  createdAt: string;
};

/**
 * Persists a wish, writing it to local storage first so a failed request can be
 * retried on a later visit instead of being lost on venue Wi-Fi.
 */
export async function saveWish(storage: Storage, draft: WishDraft): Promise<void> {
  writePendingWish(storage, draft);

  const { error } = await getSupabase().from("wishes").insert({
    guest_name: draft.guestName.trim(),
    message: draft.message.trim(),
    card_style: draft.cardStyle,
  });

  if (error) throw error;

  clearPendingWish(storage);
}

/** Re-sends a wish left behind by an earlier failed submission, if any. */
export async function flushPendingWish(storage: Storage): Promise<void> {
  const pending = readPendingWish(storage);

  if (pending) await saveWish(storage, pending);
}

/** Admin view: every wish, newest first. Requires a signed-in session. */
export async function fetchWishes(): Promise<WishRow[]> {
  const { data, error } = await getSupabase()
    .from("wishes")
    .select("id, guest_name, message, card_style, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id as string,
    guestName: row.guest_name as string,
    message: row.message as string,
    cardStyle: row.card_style as CardTemplateId,
    createdAt: row.created_at as string,
  }));
}
