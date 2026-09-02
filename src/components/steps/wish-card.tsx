"use client";

import { useState } from "react";

import { GreetingCardDisplay } from "@/components/greeting-card-display";
import type { CardTemplate, CardTemplateId } from "@/config/card-templates";
import { weddingConfig } from "@/config/wedding";
import { saveWish } from "@/lib/wishes";

type WishCardProps = {
  name: string;
  message: string;
  cardStyle: CardTemplateId;
  template: CardTemplate;
  onChangeDesign: () => void;
  onEditMessage: () => void;
  onSaved: () => void;
};

const mutedText = "color-mix(in srgb, var(--color-text) 60%, transparent)";

export function WishCard({
  name,
  message,
  cardStyle,
  template,
  onChangeDesign,
  onEditMessage,
  onSaved,
}: WishCardProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function send() {
    if (pending) return;

    setPending(true);
    setError("");

    try {
      await saveWish(window.localStorage, { guestName: name, message, cardStyle });
      onSaved();
    } catch {
      setError("تعذر إرسال التهنئة. تأكد من الاتصال ثم حاول مرة أخرى.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="step step-card">
      <GreetingCardDisplay
        template={template}
        groomName={weddingConfig.groomFullName}
        guestName={name}
        message={message}
        dateLine={weddingConfig.dateLine}
      />

      <p
        className="ar"
        style={{
          margin: "4px 0 0",
          fontSize: 13,
          lineHeight: 1.7,
          textAlign: "center",
          color: mutedText,
        }}
      >
        هذه معاينة بطاقتك. يمكنك تغيير التصميم أو تعديل تهنئتك قبل الإرسال.
      </p>

      {error ? (
        <p
          className="ar"
          role="alert"
          style={{ margin: 0, fontSize: 14, textAlign: "center", color: "var(--color-accent-700)" }}
        >
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={send}
        disabled={pending}
        className="btn btn-primary ar"
        style={{
          justifyContent: "center",
          padding: "16px 0",
          fontSize: 16,
          background: "var(--color-accent-700)",
        }}
      >
        {pending ? "جاري الإرسال..." : "إرسال التهنئة"}
      </button>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 12,
          marginTop: 4,
          paddingTop: 16,
          borderTop: "1px solid var(--color-divider)",
        }}
      >
        <button
          type="button"
          onClick={onChangeDesign}
          disabled={pending}
          className="btn btn-secondary ar"
          style={{ fontSize: 14, padding: "10px 18px" }}
        >
          تغيير التصميم
        </button>
        <button
          type="button"
          onClick={onEditMessage}
          disabled={pending}
          className="btn btn-secondary ar"
          style={{ fontSize: 14, padding: "10px 18px" }}
        >
          تعديل التهنئة
        </button>
      </div>
    </div>
  );
}
