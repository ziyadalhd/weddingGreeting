import assert from "node:assert/strict";
import test from "node:test";

import {
  buildEmailUrl,
  buildWhatsAppUrl,
  formatGreetingMessage,
} from "./message-links.ts";

test("formats a warm Arabic greeting and trims user input", () => {
  const result = formatGreetingMessage({
    guestName: "  محمد  ",
    message: "  الله يبارك لكما ويجمع بينكما بخير 🤍  ",
    groomName: "عبدالله",
  });

  assert.equal(
    result,
    "يا عبدالله،\n\nالله يبارك لكما ويجمع بينكما بخير 🤍\n\nمحبّك، محمد",
  );
});

test("normalizes the WhatsApp number and preserves Arabic punctuation", () => {
  const message = "مبروك يا عبدالله، الله يسعدكم 🤍";
  const url = buildWhatsAppUrl("+966 50 123 4567", message);

  assert.equal(new URL(url).pathname, "/966501234567");
  assert.equal(new URL(url).searchParams.get("text"), message);
});

test("encodes email recipient, subject, and multiline Arabic body", () => {
  const subject = "تهنئة زواج عبدالله";
  const body = "مبروك يا عبدالله\nمن: محمد";
  const url = buildEmailUrl("abdullah@example.com", subject, body);
  const query = url.slice(url.indexOf("?") + 1);
  const params = new URLSearchParams(query);

  assert.ok(url.startsWith("mailto:abdullah@example.com?"));
  assert.equal(params.get("subject"), subject);
  assert.equal(params.get("body"), body);
});
