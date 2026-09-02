"use client";

import { type FormEvent, useId, useRef, useState } from "react";

import { weddingConfig } from "@/config/wedding";
import { maxMessageLength, maxNameLength, validateWish } from "@/lib/wish-draft";

type WishFormProps = {
  name: string;
  message: string;
  onNameChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
};

const mutedText = "color-mix(in srgb, var(--color-text) 55%, transparent)";

export function WishForm({
  name,
  message,
  onNameChange,
  onMessageChange,
  onBack,
  onNext,
}: WishFormProps) {
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const nameId = useId();
  const messageId = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const invalid = validateWish({ guestName: name, message });

    if (invalid) {
      setError(invalid);
      setShake(true);
      (name.trim() ? messageRef : nameRef).current?.focus();
      setTimeout(() => setShake(false), 400);
      return;
    }

    setError("");
    onNext();
  }

  return (
    <div className="step step-form">
      <div style={{ height: 2, background: "var(--color-accent-700)" }} />
      <h2 className="ar" style={{ margin: "6px 0 0", fontSize: 26 }}>
        تهنئتك لعبد الله
      </h2>
      <p className="ar" style={{ margin: 0, fontSize: 13, color: mutedText }}>
        بمناسبة الزواج - {weddingConfig.dateLine}
      </p>

      <form
        onSubmit={handleSubmit}
        noValidate
        style={{ display: "flex", flexDirection: "column", gap: 20 }}
      >
        <div className="field" style={{ marginTop: 8 }}>
          <label htmlFor={nameId} className="ar">
            اسمك
          </label>
          <input
            ref={nameRef}
            id={nameId}
            name="guestName"
            type="text"
            className="input ar"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            maxLength={maxNameLength}
            autoComplete="name"
            enterKeyHint="next"
            placeholder="اكتب اسمك كما تحب ان يظهر..."
            style={{ animation: shake ? "shake 0.4s ease" : "none" }}
          />
        </div>

        <div className="field">
          <label htmlFor={messageId} className="ar">
            تهنئتك
          </label>
          <textarea
            ref={messageRef}
            id={messageId}
            name="message"
            className="input ar"
            rows={4}
            value={message}
            onChange={(event) => onMessageChange(event.target.value)}
            maxLength={maxMessageLength}
            enterKeyHint="done"
            placeholder="اكتب تهنئتك هنا..."
            style={{ animation: shake ? "shake 0.4s ease" : "none" }}
          />
        </div>

        {error ? (
          <p className="ar" role="alert" style={{ margin: 0, fontSize: 14, color: "var(--color-accent-700)" }}>
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className="btn btn-primary ar"
          style={{
            justifyContent: "center",
            padding: "16px 0",
            fontSize: 16,
            marginTop: 6,
            background: "var(--color-accent-700)",
          }}
        >
          التالي: اختر تصميم البطاقة
        </button>
        <button
          type="button"
          onClick={onBack}
          className="btn btn-ghost ar"
          style={{ justifyContent: "center" }}
        >
          رجوع
        </button>
      </form>
    </div>
  );
}
