"use client";

import Image from "next/image";
import { type FormEvent, useEffect, useId, useRef, useState } from "react";

import { CardTemplatePreview } from "@/components/card-template-preview";
import { GreetingCardDisplay } from "@/components/greeting-card-display";
import {
  cardTemplates,
  getCardTemplate,
  type CardTemplateId,
} from "@/config/card-templates";
import { weddingConfig } from "@/config/wedding";
import { renderGreetingCard } from "@/lib/card-renderer";
import {
  buildEmailUrl,
  buildWhatsAppUrl,
  formatGreetingMessage,
} from "@/lib/message-links";

type Step = "intro" | "form" | "pick" | "card";
type ContactKind = "phone" | "email";
type SentVia = "whatsapp" | "email";

const maxNameLength = 50;
const maxMessageLength = 280;
const cardFileName = "تهنئة-عبدالله.png";

function riseIn(duration: string, delay: string): string {
  return `riseIn ${duration} ease ${delay} both`;
}

export function WeddingGreeting() {
  const [step, setStep] = useState<Step>("intro");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [cardStyle, setCardStyle] = useState<CardTemplateId>("grid");
  const [shake, setShake] = useState(false);
  const [sentVia, setSentVia] = useState<SentVia | null>(null);
  const [cardStatus, setCardStatus] = useState("");
  const [copiedContact, setCopiedContact] = useState<ContactKind | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [supportsDirectDownload] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches,
  );

  const nameId = useId();
  const messageId = useId();
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const template = getCardTemplate(cardStyle);
  const formattedMessage = formatGreetingMessage({ guestName: name, message });
  const whatsappUrl = buildWhatsAppUrl(
    weddingConfig.whatsappNumber,
    formattedMessage,
  );
  const emailUrl = buildEmailUrl(
    weddingConfig.email,
    `تهنئة زواج من ${name}`,
    formattedMessage,
  );

  function goForm() {
    setStep("form");
  }

  function backToIntro() {
    setStep("intro");
  }

  function backToForm() {
    setSentVia(null);
    setCardStatus("");
    setCopiedContact(null);
    setCopyStatus("");
    setStep("form");
  }

  function backToPick() {
    setSentVia(null);
    setCardStatus("");
    setCopiedContact(null);
    setCopyStatus("");
    setStep("pick");
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim() || !message.trim()) {
      setShake(true);
      nameRef.current?.focus();
      setTimeout(() => setShake(false), 400);
      return;
    }

    setName(name.trim());
    setMessage(message.trim());
    setStep("pick");
  }

  function pickStyle(id: CardTemplateId) {
    setCardStyle(id);
    setStep("card");
  }

  async function downloadCard() {
    setCardStatus("");

    try {
      const blob = await renderGreetingCard({
        template,
        groomName: weddingConfig.groomFullName,
        guestName: name,
        message,
        dateLine: weddingConfig.dateLine,
      });
      setPreviewUrl(URL.createObjectURL(blob));
    } catch {
      setCardStatus("تعذر تجهيز البطاقة. حاول مرة أخرى.");
    }
  }

  function closePreview() {
    setPreviewUrl(null);
  }

  function downloadImageDirect() {
    if (!previewUrl) return;

    const link = document.createElement("a");
    link.href = previewUrl;
    link.download = cardFileName;
    link.click();
  }

  async function shareCard() {
    setCardStatus("");

    try {
      const blob = await renderGreetingCard({
        template,
        groomName: weddingConfig.groomFullName,
        guestName: name,
        message,
        dateLine: weddingConfig.dateLine,
      });
      const file = new File([blob], cardFileName, { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `إلى العريس / ${weddingConfig.groomFullName}`,
            text: `إلى العريس / ${weddingConfig.groomFullName}`,
          });
          return;
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }
        }
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = cardFileName;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setCardStatus("تعذر تجهيز البطاقة. حاول مرة أخرى.");
    }
  }

  function sendText() {
    window.open(whatsappUrl, "_blank");
    setSentVia("whatsapp");
  }

  function sendEmail() {
    setSentVia("email");
  }

  async function copyContact(kind: ContactKind) {
    const value =
      kind === "phone" ? weddingConfig.whatsappDisplayNumber : weddingConfig.email;
    const label = kind === "phone" ? "رقم عبدالله" : "إيميل عبدالله";

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API is unavailable");
      }

      await navigator.clipboard.writeText(value);
      setCopiedContact(kind);
      setCopyStatus(`تم نسخ ${label}`);
    } catch {
      setCopiedContact(null);
      setCopyStatus("تعذر النسخ تلقائيًا. اضغط مطولًا على البيانات لنسخها.");
    }
  }

  return (
    <div dir="rtl" lang="ar" className="app-shell ar">
      {step === "intro" ? (
        <div className="step step-intro">
          <div
            style={{
              height: 3,
              background: "var(--color-accent-700)",
              width: "100%",
              animation: riseIn("0.5s", "0s"),
            }}
          />
          <div
            style={{
              display: "inline-flex",
              alignSelf: "flex-end",
              border: "1px solid var(--color-accent-700)",
              color: "var(--color-accent-700)",
              fontSize: 12,
              letterSpacing: "0.08em",
              padding: "4px 12px",
              animation: riseIn("0.6s", "0.1s"),
            }}
          >
            دعوة تهنئة
          </div>
          <h1
            className="ar"
            style={{
              fontWeight: 700,
              fontSize: "clamp(46px,13vw,68px)",
              lineHeight: 1.05,
              margin: "6px 0 0",
              animation: riseIn("0.7s", "0.18s"),
            }}
          >
            حيّاكم الله
          </h1>
          <h2
            className="ar"
            style={{
              fontWeight: 700,
              fontSize: "clamp(26px,7vw,36px)",
              lineHeight: 1.15,
              margin: 0,
              color: "var(--color-accent-700)",
              animation: riseIn("0.7s", "0.26s"),
            }}
          >
            في زواج {weddingConfig.groomName}
          </h2>
          <p
            className="ar"
            style={{
              fontSize: 14,
              color: "color-mix(in srgb, var(--color-text) 60%, transparent)",
              margin: "2px 0 0",
              animation: riseIn("0.7s", "0.32s"),
            }}
          >
            {weddingConfig.dateLine}
          </p>
          <div
            style={{
              height: 1,
              background: "var(--color-divider)",
              width: "100%",
              margin: "8px 0",
              animation: riseIn("0.6s", "0.36s"),
            }}
          />
          <p
            className="ar"
            style={{
              fontSize: 16,
              lineHeight: 1.95,
              whiteSpace: "pre-line",
              margin: 0,
              color: "var(--color-text)",
              animation: riseIn("0.7s", "0.42s"),
            }}
          >
            {"في ليلةٍ تكتمل فيها الأفراح، وتُزفّ فيها أجمل الأمنيات،\nنسعد بحضوركم ومشاركتكم فرحتنا،\nفوجودكم بيننا هو أجمل ما تكتمل به سعادتنا"}
          </p>
          <h3
            className="ar"
            style={{
              fontWeight: 700,
              fontSize: 24,
              margin: "8px 0 0",
              color: "var(--color-accent-700)",
              animation: riseIn("0.6s", "0.48s"),
            }}
          >
            شاركونا الفرحة
          </h3>
          <div
            style={{
              height: 2,
              background: "var(--color-divider)",
              width: "100%",
              margin: "10px 0",
              animation: riseIn("0.6s", "0.52s"),
            }}
          />
          <button
            type="button"
            onClick={goForm}
            className="btn btn-primary ar"
            style={{
              width: "100%",
              justifyContent: "center",
              padding: "16px 0",
              fontSize: 17,
              background: "var(--color-accent-700)",
              animation: riseIn("0.6s", "0.58s"),
            }}
          >
            اكتب تهنئتك
          </button>
        </div>
      ) : null}

      {step === "form" ? (
        <div className="step step-form">
          <div style={{ height: 2, background: "var(--color-accent-700)" }} />
          <h2 className="ar" style={{ margin: "6px 0 0", fontSize: 26 }}>
            تهنئتك لعبدالله
          </h2>
          <p
            className="ar"
            style={{
              margin: 0,
              fontSize: 13,
              color: "color-mix(in srgb, var(--color-text) 55%, transparent)",
            }}
          >
            بمناسبة الزواج - {weddingConfig.dateLine}
          </p>

          <form
            onSubmit={handleFormSubmit}
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
                onChange={(event) => setName(event.target.value)}
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
                id={messageId}
                name="message"
                className="input ar"
                rows={4}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={maxMessageLength}
                enterKeyHint="done"
                placeholder="اكتب تهنئتك هنا..."
                style={{ animation: shake ? "shake 0.4s ease" : "none" }}
              />
            </div>

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
              onClick={backToIntro}
              className="btn btn-ghost ar"
              style={{ justifyContent: "center" }}
            >
              رجوع
            </button>
          </form>
        </div>
      ) : null}

      {step === "pick" ? (
        <div className="step step-pick">
          <div style={{ height: 2, background: "var(--color-accent-700)" }} />
          <h2 className="ar" style={{ margin: "6px 0 0", fontSize: 24 }}>
            اختر تصميم بطاقتك
          </h2>

          <div
            role="radiogroup"
            aria-label="تصميم البطاقة"
            className="contain-content"
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            {cardTemplates.map((item) => (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={cardStyle === item.id}
                aria-label={`تصميم ${item.name}`}
                onClick={() => pickStyle(item.id)}
                style={{
                  all: "unset",
                  cursor: "pointer",
                  border: "1px solid var(--color-divider)",
                  display: "flex",
                  overflow: "hidden",
                  width: "100%",
                }}
              >
                <CardTemplatePreview template={item} groomName={weddingConfig.groomFullName} />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={backToForm}
            className="btn btn-ghost ar"
            style={{ justifyContent: "center" }}
          >
            رجوع للتعديل
          </button>
        </div>
      ) : null}

      {step === "card" ? (
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
              color: "color-mix(in srgb, var(--color-text) 60%, transparent)",
            }}
          >
            يمكنك حفظ البطاقة كصورة لمشاركتها، أو إرسال تهنئتك مباشرة كنص عبر
            الواتساب والإيميل
          </p>

          <div
            className="contain-content"
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            <p className="ar" style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>
              حفظ ومشاركة البطاقة
            </p>
            <button
              type="button"
              onClick={downloadCard}
              className="btn btn-secondary ar"
              style={{ justifyContent: "center", padding: "14px 0", fontSize: 15 }}
            >
              حفظ الصورة
            </button>
            <button
              type="button"
              onClick={shareCard}
              className="btn btn-secondary ar"
              style={{ justifyContent: "center", padding: "14px 0", fontSize: 15 }}
            >
              مشاركة الصورة
            </button>
          </div>

          <div
            className="contain-content"
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            <p className="ar" style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>
              مشاركة التهنئة كنص
            </p>
            <button
              type="button"
              onClick={sendText}
              className="btn btn-primary ar"
              style={{
                justifyContent: "center",
                padding: "16px 0",
                fontSize: 16,
                background: "var(--color-accent-700)",
              }}
            >
              إرسال كنص عبر الواتساب
            </button>
            <a
              href={emailUrl}
              onClick={sendEmail}
              className="btn btn-primary ar"
              style={{
                justifyContent: "center",
                padding: "16px 0",
                fontSize: 16,
                background: "var(--color-accent-700)",
              }}
            >
              إرسال كنص عبر الإيميل
            </a>
          </div>

          <div
            className="ar contain-content"
            style={{
              border: "1px solid var(--color-divider)",
              padding: 14,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              textAlign: "right",
            }}
            aria-label="بيانات تواصل عبدالله"
          >
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>
              بيانات التواصل
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                border: "1px solid var(--color-divider)",
                background: "var(--color-surface)",
                padding: "8px 10px",
              }}
            >
              <span style={{ minWidth: 0 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: 11,
                    color: "color-mix(in srgb, var(--color-text) 55%, transparent)",
                  }}
                >
                  رقم عبدالله
                </span>
                <bdi
                  dir="ltr"
                  style={{ display: "block", fontSize: 14, fontWeight: 700 }}
                >
                  {weddingConfig.whatsappDisplayNumber}
                </bdi>
              </span>
              <button
                type="button"
                onClick={() => copyContact("phone")}
                className="btn btn-ghost ar"
                style={{ fontSize: 13, flexShrink: 0 }}
                aria-label={
                  copiedContact === "phone" ? "تم نسخ رقم عبدالله" : "نسخ رقم عبدالله"
                }
              >
                {copiedContact === "phone" ? "تم النسخ ✓" : "نسخ"}
              </button>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                border: "1px solid var(--color-divider)",
                background: "var(--color-surface)",
                padding: "8px 10px",
              }}
            >
              <span style={{ minWidth: 0, overflow: "hidden" }}>
                <span
                  style={{
                    display: "block",
                    fontSize: 11,
                    color: "color-mix(in srgb, var(--color-text) 55%, transparent)",
                  }}
                >
                  إيميل عبدالله
                </span>
                <bdi
                  dir="ltr"
                  style={{
                    display: "block",
                    fontSize: 14,
                    fontWeight: 700,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {weddingConfig.email}
                </bdi>
              </span>
              <button
                type="button"
                onClick={() => copyContact("email")}
                className="btn btn-ghost ar"
                style={{ fontSize: 13, flexShrink: 0 }}
                aria-label={
                  copiedContact === "email" ? "تم نسخ إيميل عبدالله" : "نسخ إيميل عبدالله"
                }
              >
                {copiedContact === "email" ? "تم النسخ ✓" : "نسخ"}
              </button>
            </div>

            {copyStatus ? (
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: "color-mix(in srgb, var(--color-text) 55%, transparent)",
                }}
                aria-live="polite"
              >
                {copyStatus}
              </p>
            ) : null}
          </div>

          {cardStatus ? (
            <p
              className="ar"
              style={{
                textAlign: "center",
                fontSize: 14,
                color: "color-mix(in srgb, var(--color-text) 55%, transparent)",
              }}
              role="alert"
            >
              {cardStatus}
            </p>
          ) : null}

          {sentVia ? (
            <div
              className="ar"
              style={{
                border: "1px solid var(--color-accent-700)",
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 4,
                textAlign: "right",
                animation: "riseIn 0.4s ease both",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 14 }}>
                {sentVia === "whatsapp" ? "تم فتح واتساب" : "تم فتح تطبيق البريد"}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "color-mix(in srgb, var(--color-text) 60%, transparent)",
                }}
              >
                أكمل الإرسال من عندك لتصل تهنئتك لعبدالله.
              </div>
            </div>
          ) : null}

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 12,
              marginTop: 8,
              paddingTop: 16,
              borderTop: "1px solid var(--color-divider)",
            }}
          >
            <button
              type="button"
              onClick={backToPick}
              className="btn btn-secondary ar"
              style={{ fontSize: 14, padding: "10px 18px" }}
            >
              تغيير التصميم
            </button>
            <button
              type="button"
              onClick={backToForm}
              className="btn btn-secondary ar"
              style={{ fontSize: 14, padding: "10px 18px" }}
            >
              تعديل التهنئة
            </button>
          </div>
        </div>
      ) : null}

      {previewUrl ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="معاينة البطاقة"
          onClick={closePreview}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            background: "var(--color-neutral-900)",
          }}
        >
          <div
            className="contain-content"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 420,
              maxHeight: "92vh",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              padding: 18,
              background: "var(--color-bg)",
              border: "1px solid var(--color-divider)",
            }}
          >
            <Image
              src={previewUrl}
              alt={`بطاقة تهنئة لـ${weddingConfig.groomFullName} من ${name}`}
              width={1200}
              height={1500}
              unoptimized
              style={{
                width: "100%",
                maxHeight: "60vh",
                height: "auto",
                objectFit: "contain",
                border: "1px solid var(--color-divider)",
              }}
            />

            {supportsDirectDownload ? (
              <button
                type="button"
                onClick={downloadImageDirect}
                className="btn btn-primary ar"
                style={{
                  justifyContent: "center",
                  padding: "14px 0",
                  fontSize: 15,
                  background: "var(--color-accent-700)",
                }}
              >
                تحميل الصورة
              </button>
            ) : (
              <div
                className="ar"
                style={{
                  background:
                    "color-mix(in srgb, var(--color-accent-700) 10%, var(--color-surface))",
                  border: "1px solid var(--color-accent-700)",
                  borderInlineStart: "4px solid var(--color-accent-700)",
                  padding: "12px 14px",
                  fontSize: 13,
                  fontWeight: 700,
                  lineHeight: 1.7,
                  textAlign: "right",
                  color: "var(--color-text)",
                }}
              >
                اضغط مطولاً على الصورة ثم اختر حفظ في الصور
              </div>
            )}

            <button
              type="button"
              onClick={closePreview}
              className="btn btn-secondary ar"
              style={{ justifyContent: "center", padding: "12px 0", fontSize: 14 }}
            >
              إغلاق
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
