import assert from "node:assert/strict";
import test from "node:test";

import {
  buildEmailUrl,
  buildWhatsAppShareUrl,
  formatGreetingMessage,
} from "./message-links.ts";

test("formats the greeting as message then guest name, and trims user input", () => {
  const result = formatGreetingMessage({
    guestName: "  محمد  ",
    message: "  الله يبارك لكما ويجمع بينكما بخير 🤍  ",
  });

  assert.equal(result, "الله يبارك لكما ويجمع بينكما بخير 🤍\n- محمد");
});

test("builds a WhatsApp share link without a fixed recipient", () => {
  const message = "مبروك يا عبدالله، الله يسعدكم 🤍";
  const url = buildWhatsAppShareUrl(message);

  assert.equal(url, `https://wa.me/?text=${encodeURIComponent(message)}`);
});

test("encodes email recipient, subject, and multiline Arabic body", () => {
  const subject = "تهنئة زواج من محمد";
  const body = "مبروك يا عبدالله\nمن: محمد";
  const url = buildEmailUrl("abdullah@example.com", subject, body);
  const query = url.slice(url.indexOf("?") + 1);
  const params = new URLSearchParams(query);

  assert.ok(url.startsWith("mailto:abdullah@example.com?"));
  assert.equal(params.get("subject"), subject);
  assert.equal(params.get("body"), body);
});
