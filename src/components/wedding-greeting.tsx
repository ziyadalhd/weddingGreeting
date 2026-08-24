"use client";

import Image from "next/image";
import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { CardTemplatePreview } from "@/components/card-template-preview";
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

type Step = "compose" | "method" | "text" | "card";
type Direction = "fwd" | "back";
type FieldErrors = { name?: string; message?: string };
type ContactKind = "phone" | "email";

const previewNameFallback = "اسمك";
const previewMessageFallback = "ستظهر تهنئتك هنا";

const maxNameLength = 50;
const maxMessageLength = 280;

const displayFont = { fontFamily: '"Thmanyah Serif Display", "Thmanyah Sans", serif' };

function toArabicNumerals(value: number): string {
  const digits = "٠١٢٣٤٥٦٧٨٩";
  return String(value).replace(/\d/g, (d) => digits[Number(d)]);
}

type CrestProps = { size?: "sm" | "lg"; reveal?: boolean };

function Crest({ size = "sm", reveal = false }: CrestProps) {
  const dimension = size === "lg" ? "size-16 text-[2rem]" : "size-9 text-[1.15rem]";

  return (
    <span
      aria-hidden="true"
      className={`crest ${reveal ? "crest-reveal" : ""} ${dimension} font-bold leading-none`}
      style={displayFont}
    >
      و
    </span>
  );
}

type IconProps = { className?: string };

function IconMessage({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4.5 5.5h15a1 1 0 0 1 1 1v9.5a1 1 0 0 1-1 1H10l-4.4 3.3a.5.5 0 0 1-.8-.4v-2.9h-.3a1 1 0 0 1-1-1v-9.5a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M8 10h8M8 13h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconCard({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="4" y="5.5" width="16" height="14" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M9.5 5.5V4.3a2.5 2.5 0 0 1 5 0v1.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M8 15.2c1.1-1.4 2.3-1.4 4-.3 1.7-1.1 2.9-1.1 4 .3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconSend({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M20.5 3.5 3 10.2c-.7.27-.66 1.27.06 1.48l5.9 1.7 1.7 5.9c.21.72 1.2.76 1.48.06L20.5 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M20.5 3.5 9.4 12.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconMail({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="m4.2 7 7.8 5.6L19.8 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconExpand({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M15 4.5h4.5V9M9 4.5H4.5V9M15 19.5h4.5V15M9 19.5H4.5V15"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCheck({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="m5 12.5 4.3 4.3L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconSpinner({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`spinner ${className ?? ""}`} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.22" strokeWidth="2.2" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

type StepHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

function StepHeader({ eyebrow, title, description }: StepHeaderProps) {
  return (
    <header>
      {eyebrow ? (
        <p className="eyebrow mb-3 flex items-center gap-2 text-xs font-bold text-[#9C7C42]">
          <span aria-hidden="true" className="h-px w-4 bg-[#9C7C42]/60" />
          {eyebrow}
        </p>
      ) : null}
      <h1
        className="text-[2rem] leading-[1.24] font-bold tracking-[-0.02em] text-[#14312B] sm:text-[2.3rem]"
        style={displayFont}
      >
        {title}
      </h1>
      {description ? (
        <p className="mt-3 max-w-md text-[0.98rem] leading-7 text-[#5C645E]">
          {description}
        </p>
      ) : null}
    </header>
  );
}


type BackButtonProps = { onClick: () => void };

function BackButton({ onClick }: BackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="focus-ring -mr-2 inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-sm font-medium text-[#666F68] transition-colors hover:text-[#14312B]"
    >
      <span aria-hidden="true" className="text-base leading-none">→</span>
      رجوع
    </button>
  );
}

type ChoiceButtonProps = {
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
};

function ChoiceButton({
  icon,
  title,
  description,
  onClick,
  disabled = false,
}: ChoiceButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="focus-ring group flex min-h-28 w-full items-center gap-4 rounded-3xl border border-[#E6DDC8] bg-white p-5 text-right shadow-[0_1px_2px_rgba(20,49,43,0.04)] transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-[#C9AF7C] hover:shadow-[0_16px_32px_-16px_rgba(20,49,43,0.22)] active:translate-y-0 active:scale-[0.99] disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:border-[#E6DDC8] disabled:hover:shadow-[0_1px_2px_rgba(20,49,43,0.04)]"
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#9C7C42]/12 text-[#14312B] transition-colors group-hover:bg-[#9C7C42]/18">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-lg font-bold text-[#14312B]">{title}</span>
        <span className="mt-1 block text-sm leading-6 text-[#737A74]">
          {description}
        </span>
      </span>
      <span
        aria-hidden="true"
        className="text-lg text-[#9C7C42] transition-transform duration-200 group-hover:-translate-x-1"
      >
        ←
      </span>
    </button>
  );
}

function ProgressMark({ step }: { step: Step }) {
  const position = step === "compose" ? 1 : step === "method" ? 2 : 3;

  return (
    <div
      className="flex items-center gap-2.5"
      aria-label={`الخطوة ${position} من 3`}
    >
      <span className="text-xs font-bold tabular-nums text-[#9C7C42]" aria-hidden="true">
        {toArabicNumerals(position)}
        <span className="mx-1 text-[#C9AF7C]">/</span>
        <span className="text-[#B7AE9A]">{toArabicNumerals(3)}</span>
      </span>
      <span className="flex items-center gap-1.5" aria-hidden="true">
        {[1, 2, 3].map((item) => (
          <span
            key={item}
            className={`h-1.5 rounded-full transition-[width,background-color] duration-300 ease-out ${
              item === position ? "w-6 bg-[#9C7C42]" : "w-1.5 bg-[#E6DDC8]"
            }`}
          />
        ))}
      </span>
    </div>
  );
}

type ShareChoiceHintProps = {
  copiedContact: ContactKind | null;
  copyStatus: string;
  onCopy: (kind: ContactKind) => void;
};

function ShareChoiceHint({
  copiedContact,
  copyStatus,
  onCopy,
}: ShareChoiceHintProps) {
  return (
    <section
      aria-label="بيانات تواصل عبدالله"
      className="rounded-2xl border border-[#E6DDC8] bg-[#FAF6EC] p-3"
    >
      <p className="px-1 pb-2 text-sm font-bold text-[#294B43]">
        تحتاج بيانات عبدالله؟
      </p>

      <div className="space-y-2">
        <div className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-[#E6DDC8] bg-white pr-3">
          <span className="min-w-0">
            <span className="block text-xs text-[#7A807B]">رقم عبدالله</span>
            <bdi
              dir="ltr"
              className="block select-all text-sm font-bold text-[#294B43]"
            >
              {weddingConfig.whatsappDisplayNumber}
            </bdi>
          </span>
          <button
            type="button"
            onClick={() => onCopy("phone")}
            className="focus-ring flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl px-3 text-sm font-bold text-[#8C7046]"
            aria-label={
              copiedContact === "phone"
                ? "تم نسخ رقم عبدالله"
                : "نسخ رقم عبدالله"
            }
          >
            {copiedContact === "phone" ? (
              <>
                <IconCheck className="pop-in size-4 text-[#2F6B4E]" />
                <span className="text-[#2F6B4E]">تم النسخ</span>
              </>
            ) : (
              "نسخ"
            )}
          </button>
        </div>

        <div className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-[#E6DDC8] bg-white pr-3">
          <span className="min-w-0 overflow-hidden">
            <span className="block text-xs text-[#7A807B]">إيميل عبدالله</span>
            <bdi
              dir="ltr"
              className="block select-all truncate text-sm font-bold text-[#294B43]"
            >
              {weddingConfig.email}
            </bdi>
          </span>
          <button
            type="button"
            onClick={() => onCopy("email")}
            className="focus-ring flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl px-3 text-sm font-bold text-[#8C7046]"
            aria-label={
              copiedContact === "email"
                ? "تم نسخ إيميل عبدالله"
                : "نسخ إيميل عبدالله"
            }
          >
            {copiedContact === "email" ? (
              <>
                <IconCheck className="pop-in size-4 text-[#2F6B4E]" />
                <span className="text-[#2F6B4E]">تم النسخ</span>
              </>
            ) : (
              "نسخ"
            )}
          </button>
        </div>
      </div>

      <p
        className={
          copyStatus
            ? "px-1 pt-2 text-xs leading-5 text-[#69736C]"
            : "sr-only"
        }
        aria-live="polite"
      >
        {copyStatus}
      </p>
    </section>
  );
}

export function WeddingGreeting() {
  const [step, setStep] = useState<Step>("compose");
  const [direction, setDirection] = useState<Direction>("fwd");
  const [guestName, setGuestName] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [selectedTemplate, setSelectedTemplate] =
    useState<CardTemplateId>("ivory");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);
  const [canShareFiles, setCanShareFiles] = useState<boolean | null>(null);
  const [cardStatus, setCardStatus] = useState("");
  const [copiedContact, setCopiedContact] = useState<ContactKind | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  const nameId = useId();
  const messageId = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const closeImageRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    return () => {
      if (generatedUrl) {
        URL.revokeObjectURL(generatedUrl);
      }
    };
  }, [generatedUrl]);

  useEffect(() => {
    if (isImageExpanded) {
      closeImageRef.current?.focus();
    }
  }, [isImageExpanded]);

  function goTo(next: Step, dir: Direction) {
    setDirection(dir);
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleParallax(event: React.PointerEvent<HTMLDivElement>) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const { innerWidth, innerHeight } = window;
    const x = (event.clientX / innerWidth - 0.5) * -20;
    const y = (event.clientY / innerHeight - 0.5) * -20;
    const target = event.currentTarget;
    target.style.setProperty("--parallax-x", `${x.toFixed(1)}px`);
    target.style.setProperty("--parallax-y", `${y.toFixed(1)}px`);
  }

  const formattedMessage = formatGreetingMessage({
    guestName,
    message,
    groomName: weddingConfig.groomName,
  });
  const whatsappUrl = buildWhatsAppUrl(
    weddingConfig.whatsappNumber,
    formattedMessage,
  );
  const emailUrl = buildEmailUrl(
    weddingConfig.email,
    weddingConfig.emailSubject,
    formattedMessage,
  );

  function handleComposeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FieldErrors = {};

    if (guestName.trim().length < 2) {
      nextErrors.name = "اكتب اسمك أولًا";
    }

    if (message.trim().length < 5) {
      nextErrors.message = "اكتب تهنئتك لعبدالله";
    }

    setErrors(nextErrors);

    if (nextErrors.name) {
      nameRef.current?.focus();
      return;
    }

    if (nextErrors.message) {
      messageRef.current?.focus();
      return;
    }

    setGuestName(guestName.trim());
    setMessage(message.trim());
    goTo("method", "fwd");
  }

  function goBack() {
    setCardStatus("");
    setCopiedContact(null);
    setCopyStatus("");

    if (step === "method") goTo("compose", "back");
    if (step === "text") goTo("method", "back");
    if (step === "card") {
      setIsImageExpanded(false);
      goTo("method", "back");
    }
  }

  async function generateCard() {
    setIsGenerating(true);
    setCardStatus("");

    try {
      const blob = await renderGreetingCard({
        template: getCardTemplate(selectedTemplate),
        groomName: weddingConfig.groomName,
        guestName,
        message,
      });
      const file = new File([blob], "tahnia-abdullah.png", {
        type: "image/png",
      });
      const sharingIsSupported =
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] });

      setGeneratedBlob(blob);
      setGeneratedUrl(URL.createObjectURL(blob));
      setCanShareFiles(sharingIsSupported);
      goTo("card", "fwd");
    } catch {
      setCardStatus("تعذر تجهيز البطاقة. حاول مرة أخرى.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function shareCard() {
    if (!generatedBlob) return;

    const file = new File([generatedBlob], "tahnia-abdullah.png", {
      type: "image/png",
    });

    try {
      await navigator.share({
        files: [file],
        title: `تهنئة لـ${weddingConfig.groomName}`,
        text: formattedMessage,
      });
      setCardStatus("فُتحت خيارات المشاركة.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      setCanShareFiles(false);
      setCardStatus(
        "تعذرت المشاركة المباشرة. كبّر البطاقة واحفظها في الصور، ثم شاركها من جهازك.",
      );
    }
  }

  async function copyContact(kind: ContactKind) {
    const value =
      kind === "phone"
        ? weddingConfig.whatsappDisplayNumber
        : weddingConfig.email;
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
    <div className="mx-auto flex min-h-svh w-full max-w-xl flex-col overflow-x-clip sm:min-h-0 sm:py-10">
      <div
        onPointerMove={handleParallax}
        className="ornament-field app-shell flex flex-1 flex-col sm:rounded-[2rem] sm:border sm:border-[#E6DDC8] sm:bg-white sm:px-9 sm:pt-8 sm:pb-9 sm:shadow-[0_1px_2px_rgba(20,49,43,0.04),0_28px_60px_-24px_rgba(20,49,43,0.2)]"
      >
        <div className="flex min-h-11 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Crest />
            <p className="text-sm font-bold tracking-[-0.01em] text-[#14312B]">
              تهنئة لعبدالله
            </p>
          </div>
          <ProgressMark step={step} />
        </div>

        <section
          key={step}
          className={`${direction === "fwd" ? "enter-fwd" : "enter-back"} flex flex-1 flex-col pt-8 pb-2 sm:justify-center sm:py-10`}
        >
          {step === "compose" ? (
            <>
              <header className="flex flex-col items-center text-center">
                <Crest size="lg" reveal />
                <p className="eyebrow mt-5 text-xs font-bold text-[#9C7C42]">
                  تهنئة بمناسبة الزواج
                </p>
                <h1
                  className="mt-2 text-[1.9rem] leading-[1.2] font-bold tracking-[-0.02em] text-[#14312B]"
                  style={displayFont}
                >
                  اكتب تهنئتك لعبدالله
                </h1>
              </header>

              <div className="card-reveal mx-auto mt-7 w-full max-w-[15rem]">
                <div className="overflow-hidden rounded-[1.5rem] shadow-[0_1px_2px_rgba(20,49,43,0.06),0_20px_44px_-18px_rgba(20,49,43,0.3)]">
                  <CardTemplatePreview
                    template={getCardTemplate(selectedTemplate)}
                    groomName={weddingConfig.groomName}
                    guestName={guestName.trim() || previewNameFallback}
                    message={message.trim() || previewMessageFallback}
                    placeholderName={!guestName.trim()}
                    placeholderMessage={!message.trim()}
                  />
                </div>
              </div>

              <div
                className="mt-5 flex items-center justify-center gap-2.5"
                role="radiogroup"
                aria-label="تصميم البطاقة"
              >
                {cardTemplates.map((template) => {
                  const isSelected = selectedTemplate === template.id;

                  return (
                    <button
                      key={template.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={`تصميم ${template.name}`}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`focus-ring flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-bold transition-[border-color,background-color] duration-200 ${
                        isSelected
                          ? "swatch-pop border-[#9C7C42] bg-[#9C7C42]/10 text-[#14312B]"
                          : "border-[#E6DDC8] text-[#737A74] hover:border-[#C9AF7C]"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className="size-3.5 rounded-full ring-1 ring-inset ring-black/10"
                        style={{ backgroundColor: template.background }}
                      />
                      {template.name}
                    </button>
                  );
                })}
              </div>

              <form className="mt-7 space-y-6" onSubmit={handleComposeSubmit} noValidate>
                <div>
                  <label
                    htmlFor={nameId}
                    className="mb-2 block text-sm font-bold text-[#26473F]"
                  >
                    اسمك
                  </label>
                  <input
                    ref={nameRef}
                    id={nameId}
                    name="guestName"
                    type="text"
                    value={guestName}
                    onChange={(event) => {
                      setGuestName(event.target.value);
                      if (errors.name) setErrors((current) => ({ ...current, name: undefined }));
                    }}
                    maxLength={maxNameLength}
                    autoComplete="name"
                    enterKeyHint="next"
                    placeholder="اكتب اسمك"
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? `${nameId}-error` : undefined}
                    className="focus-ring min-h-14 w-full rounded-2xl border border-[#E6DDC8] bg-[#FAF6EC] px-4 text-base text-[#14312B] transition-colors placeholder:text-[#A8AAA5] focus:border-[#9C7C42] focus:bg-white focus:outline-none"
                  />
                  {errors.name ? (
                    <p id={`${nameId}-error`} className="mt-2 text-sm text-[#A3453C]">
                      {errors.name}
                    </p>
                  ) : null}
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label htmlFor={messageId} className="text-sm font-bold text-[#26473F]">
                      تهنئتك لعبدالله
                    </label>
                    <span className="text-xs tabular-nums text-[#8A8E89]" aria-live="polite">
                      {message.length}/{maxMessageLength}
                    </span>
                  </div>
                  <textarea
                    ref={messageRef}
                    id={messageId}
                    name="message"
                    value={message}
                    onChange={(event) => {
                      setMessage(event.target.value);
                      if (errors.message) {
                        setErrors((current) => ({ ...current, message: undefined }));
                      }
                    }}
                    maxLength={maxMessageLength}
                    rows={5}
                    enterKeyHint="done"
                    placeholder="مثلاً: الله يبارك لكما ويجمع بينكما بخير"
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? `${messageId}-error` : undefined}
                    className="focus-ring min-h-36 w-full resize-none rounded-2xl border border-[#E6DDC8] bg-[#FAF6EC] px-4 py-3 text-base leading-7 text-[#14312B] transition-colors placeholder:text-[#A8AAA5] focus:border-[#9C7C42] focus:bg-white focus:outline-none"
                  />
                  {errors.message ? (
                    <p id={`${messageId}-error`} className="mt-2 text-sm text-[#A3453C]">
                      {errors.message}
                    </p>
                  ) : null}
                </div>

                <button
                  type="submit"
                  className="focus-ring min-h-14 w-full rounded-2xl bg-[#14312B] px-5 text-base font-bold text-white shadow-[0_14px_28px_-14px_rgba(20,49,43,0.55)] ring-1 ring-inset ring-[#C9AF7C]/25 transition-[background-color,transform,box-shadow] duration-200 hover:bg-[#1B4038] active:scale-[0.99] active:bg-[#0F2620]"
                >
                  متابعة
                </button>
              </form>
            </>
          ) : null}

          {step === "method" ? (
            <>
              <BackButton onClick={goBack} />
              <div className="mt-5">
                <StepHeader
                  eyebrow={`مرحبًا ${guestName}`}
                  title="كيف تود إرسال تهنئتك؟"
                  description="اختر رسالة نصية أو بطاقة تهنئة."
                />
              </div>
              <div className="mt-8 space-y-3.5">
                <ChoiceButton
                  icon={<IconMessage className="size-6" />}
                  title="رسالة نصية"
                  description="أرسل تهنئتك عبر واتساب أو الإيميل"
                  onClick={() => goTo("text", "fwd")}
                  disabled={isGenerating}
                />
                <ChoiceButton
                  icon={
                    isGenerating ? (
                      <IconSpinner className="size-6" />
                    ) : (
                      <IconCard className="size-6" />
                    )
                  }
                  title={isGenerating ? "جارٍ تجهيز بطاقتك" : "بطاقة تهنئة"}
                  description="شارك بطاقتك المصمّمة من جوالك"
                  onClick={generateCard}
                  disabled={isGenerating}
                />
              </div>
              {cardStatus ? (
                <p className="mt-3 text-center text-sm text-[#A3453C]" role="alert">
                  {cardStatus}
                </p>
              ) : null}
            </>
          ) : null}

          {step === "text" ? (
            <>
              <BackButton onClick={goBack} />
              <div className="mt-5">
                <StepHeader
                  eyebrow="رسالتك جاهزة"
                  title="أرسل تهنئتك لعبدالله"
                  description="ستفتح الرسالة جاهزة، ويبقى عليك مراجعتها وإرسالها."
                />
              </div>

              <div className="mt-7 rounded-3xl border border-[#E6DDC8] bg-white p-5 shadow-[0_1px_2px_rgba(20,49,43,0.04)]">
                <p className="whitespace-pre-wrap text-[0.98rem] leading-8 text-[#294B43]">
                  {formattedMessage}
                </p>
              </div>

              {weddingConfig.contactDetailsArePlaceholders ? (
                <p className="mt-3 rounded-xl bg-[#9C7C42]/12 px-3 py-2 text-xs leading-5 text-[#735F3E]">
                  تنبيه للمطوّر: بيانات التواصل تجريبية وتحتاج تحديث قبل النشر.
                </p>
              ) : null}

              <div className="mt-6 space-y-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="focus-ring flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#14312B] px-5 text-base font-bold text-white shadow-[0_14px_28px_-14px_rgba(20,49,43,0.55)] ring-1 ring-inset ring-[#C9AF7C]/25 transition-[background-color,transform] duration-200 hover:bg-[#1B4038] active:scale-[0.99]"
                >
                  <IconSend className="size-5" />
                  إرسال على واتساب
                </a>
                <a
                  href={emailUrl}
                  className="focus-ring flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-[#E6DDC8] bg-white px-5 text-base font-bold text-[#23463E] transition-[border-color,background-color] duration-200 hover:border-[#C9AF7C] hover:bg-[#FAF6EC] active:scale-[0.99]"
                >
                  <IconMail className="size-5" />
                  إرسال بالإيميل
                </a>
              </div>
            </>
          ) : null}

          {step === "card" && generatedUrl ? (
            <>
              <BackButton onClick={goBack} />
              <div className="mt-5">
                <StepHeader
                  eyebrow="بطاقتك جاهزة"
                  title="راجع البطاقة وشاركها"
                  description="يمكنك مشاركتها مباشرة، أو تكبيرها وحفظها في الصور."
                />
              </div>

              <div className="relative mx-auto mt-7 w-full max-w-[23rem] overflow-hidden rounded-[1.6rem] shadow-[0_1px_2px_rgba(20,49,43,0.06),0_24px_60px_-16px_rgba(20,49,43,0.28)]">
                <Image
                  src={generatedUrl}
                  alt={`بطاقة تهنئة لـ${weddingConfig.groomName} من ${guestName}`}
                  width={1080}
                  height={1350}
                  unoptimized
                  className="h-auto w-full"
                />
                <button
                  type="button"
                  onClick={() => setIsImageExpanded(true)}
                  className="focus-ring absolute top-3 left-3 flex min-h-11 items-center gap-1.5 rounded-full border border-white/70 bg-white/95 px-4 text-sm font-bold text-[#23463E] shadow-sm backdrop-blur-sm transition-transform active:scale-95"
                  aria-label="تكبير البطاقة"
                >
                  <IconExpand className="size-4" />
                  تكبير
                </button>
              </div>

              <p className="mt-3 text-center text-sm leading-6 text-[#69736C]">
                لحفظها في ألبوم الصور: كبّر البطاقة، ثم اضغط عليها مطولًا واختر
                «حفظ الصورة» أو «إضافة إلى الصور» حسب جهازك.
              </p>

              <div className="mt-7 space-y-3">
                {canShareFiles ? (
                  <>
                    <button
                      type="button"
                      onClick={shareCard}
                      className="focus-ring flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#14312B] px-5 text-base font-bold text-white shadow-[0_14px_28px_-14px_rgba(20,49,43,0.55)] ring-1 ring-inset ring-[#C9AF7C]/25 transition-[background-color,transform] duration-200 hover:bg-[#1B4038] active:scale-[0.99]"
                    >
                      <IconSend className="size-5" />
                      مشاركة البطاقة
                    </button>
                    <ShareChoiceHint
                      copiedContact={copiedContact}
                      copyStatus={copyStatus}
                      onCopy={copyContact}
                    />
                  </>
                ) : (
                  <p className="rounded-2xl bg-[#9C7C42]/12 px-4 py-3 text-sm leading-6 text-[#735F3E]">
                    المشاركة المباشرة غير مدعومة هنا. كبّر البطاقة واحفظها في
                    الصور، ثم شاركها من جهازك.
                  </p>
                )}
              </div>

              {cardStatus ? (
                <p className="mt-3 text-center text-sm text-[#69736C]" role="status">
                  {cardStatus}
                </p>
              ) : null}
            </>
          ) : null}
        </section>

        <footer className="pt-6 text-center text-[11px] text-[#8A8E89]">
          تهنئة خاصة لعبدالله
        </footer>
      </div>

      {isImageExpanded && generatedUrl ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="expanded-card-title"
          onKeyDown={(event) => {
            if (event.key === "Escape") setIsImageExpanded(false);
          }}
          className="fixed inset-0 z-50 flex flex-col overflow-auto bg-[#0F211D]/95 px-3 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-4 pb-3 text-white">
            <h2 id="expanded-card-title" className="text-base font-bold">
              البطاقة بالحجم الكامل
            </h2>
            <button
              ref={closeImageRef}
              type="button"
              onClick={() => setIsImageExpanded(false)}
              className="focus-ring min-h-11 rounded-full border border-white/25 px-4 text-sm font-bold transition-colors hover:bg-white/10"
            >
              إغلاق
            </button>
          </div>

          <div className="m-auto flex w-full max-w-xl flex-col items-center gap-3">
            <Image
              src={generatedUrl}
              alt={`بطاقة تهنئة لـ${weddingConfig.groomName} من ${guestName}`}
              width={1080}
              height={1350}
              unoptimized
              className="max-h-[calc(100svh-9rem)] w-auto max-w-full rounded-2xl object-contain"
              style={{ touchAction: "pinch-zoom" }}
            />
            <p className="text-center text-sm leading-6 text-white/85">
              اضغط مطولًا على البطاقة، ثم اختر «حفظ الصورة» أو «إضافة إلى الصور».
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
