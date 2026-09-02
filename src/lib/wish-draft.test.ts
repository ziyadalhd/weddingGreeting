import assert from "node:assert/strict";
import test from "node:test";

import {
  clearPendingWish,
  maxMessageLength,
  readPendingWish,
  validateWish,
  writePendingWish,
  type WishDraft,
} from "./wish-draft.ts";

function fakeStorage(): Storage {
  const map = new Map<string, string>();

  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => void map.set(key, value),
    removeItem: (key) => void map.delete(key),
    clear: () => map.clear(),
    key: (index) => [...map.keys()][index] ?? null,
    get length() {
      return map.size;
    },
  } as Storage;
}

const draft: WishDraft = {
  guestName: "محمد",
  message: "الله يبارك لكما 🤍",
  cardStyle: "grid",
};

test("accepts a valid wish and rejects blank fields with Arabic messages", () => {
  assert.equal(validateWish(draft), null);
  assert.equal(validateWish({ guestName: "   ", message: "مبروك" }), "اكتب اسمك من فضلك");
  assert.equal(validateWish({ guestName: "محمد", message: "  " }), "اكتب تهنئتك من فضلك");
});

test("rejects a message longer than the database CHECK constraint allows", () => {
  const message = "م".repeat(maxMessageLength + 1);

  assert.equal(validateWish({ guestName: "محمد", message }), `التهنئة طويلة، الحد ${maxMessageLength} حرفًا`);
});

test("round-trips a pending wish and clears it once sent", () => {
  const storage = fakeStorage();

  assert.equal(readPendingWish(storage), null);

  writePendingWish(storage, draft);
  assert.deepEqual(readPendingWish(storage), draft);

  clearPendingWish(storage);
  assert.equal(readPendingWish(storage), null);
});

test("discards a corrupted pending wish instead of throwing", () => {
  const storage = fakeStorage();
  storage.setItem("abdullah-wedding:pending-wish", "{not json");

  assert.equal(readPendingWish(storage), null);
  assert.equal(storage.length, 0);
});
