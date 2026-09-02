"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { WishCard } from "@/components/steps/wish-card";
import { WishForm } from "@/components/steps/wish-form";
import { WishPick } from "@/components/steps/wish-pick";
import { WishSent } from "@/components/steps/wish-sent";
import { getCardTemplate, type CardTemplateId } from "@/config/card-templates";
import { weddingConfig } from "@/config/wedding";
import { renderGreetingCard } from "@/lib/card-renderer";
import { flushPendingWish } from "@/lib/wishes";

type Step = "intro" | "form" | "pick" | "card" | "sent";

const cardFileName = "تهنئة-عبد الله.png";
const mutedText = "color-mix(in srgb, var(--color-text) 60%, transparent)";

function riseIn(duration: string, delay: string): string {
  return `riseIn ${duration} ease ${delay} both`;
}

export function WeddingGreeting() {
  const [step, setStep] = useState<Step>("intro");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [cardStyle, setCardStyle] = useState<CardTemplateId>("grid");
  const [cardStatus, setCardStatus] = useState("");
  const [copiedContact, setCopiedContact] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // A wish left unsent by an earlier failed submission is delivered on the next
  // visit, so a guest on bad venue Wi-Fi does not lose it.
  useEffect(() => {
    void flushPendingWish(window.localStorage).catch(() => undefined);
  }, []);

  const template = getCardTemplate(cardStyle);

  async function buildCard(): Promise<Blob> {
    return renderGreetingCard({
      template,
      groomName: weddingConfig.groomFullName,
      guestName: name,
      message,
      dateLine: weddingConfig.dateLine,
    });
  }

  async function downloadCard() {
    setCardStatus("");

    try {
      const blob = await buildCard();
      setPreviewBlob(blob);
      setPreviewUrl(URL.createObjectURL(blob));
    } catch {
      setCardStatus("تعذر تجهيز البطاقة. حاول مرة أخرى.");
    }
  }

  function closePreview() {
    setPreviewUrl(null);
    setPreviewBlob(null);
  }

  async function saveImage() {
    if (!previewUrl || !previewBlob) return;

    const file = new File([previewBlob], cardFileName, { type: "image/png" });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    const link = document.createElement("a");
    link.href = previewUrl;
    link.download = cardFileName;
    link.click();
  }

  async function shareCard() {
    setCardStatus("");

    try {
      const blob = await buildCard();
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

  async function copyPhone() {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API is unavailable");
      }

      await navigator.clipboard.writeText(weddingConfig.whatsappDisplayNumber);
      setCopiedContact(true);
      setCopyStatus("تم نسخ رقم عبد الله");
    } catch {
      setCopiedContact(false);
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
              color: mutedText,
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
            onClick={() => setStep("form")}
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
        <WishForm
          name={name}
          message={message}
          onNameChange={setName}
          onMessageChange={setMessage}
          onBack={() => setStep("intro")}
          onNext={() => setStep("pick")}
        />
      ) : null}

      {step === "pick" ? (
        <WishPick
          cardStyle={cardStyle}
          onPick={(id) => {
            setCardStyle(id);
            setStep("card");
          }}
          onBack={() => setStep("form")}
        />
      ) : null}

      {step === "card" ? (
        <WishCard
          name={name}
          message={message}
          cardStyle={cardStyle}
          template={template}
          onChangeDesign={() => setStep("pick")}
          onEditMessage={() => setStep("form")}
          onSaved={() => setStep("sent")}
        />
      ) : null}

      {step === "sent" ? (
        <WishSent
          guestName={name.trim()}
          cardStatus={cardStatus}
          copiedContact={copiedContact}
          copyStatus={copyStatus}
          onDownload={downloadCard}
          onShare={shareCard}
          onCopyPhone={copyPhone}
        />
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

            <button
              type="button"
              onClick={saveImage}
              className="btn btn-primary ar"
              style={{
                justifyContent: "center",
                padding: "14px 0",
                fontSize: 15,
                background: "var(--color-accent-700)",
              }}
            >
              تحميل الصورة للجهاز
            </button>

            <p
              className="ar"
              style={{
                margin: 0,
                fontSize: 12,
                lineHeight: 1.7,
                textAlign: "center",
                color: "color-mix(in srgb, var(--color-text) 55%, transparent)",
              }}
            >
              أو يمكنك الضغط مطولاً على الصورة ثم اختيار حفظ في الصور
            </p>

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
