"use client";

import Image from "next/image";
import {
  type PointerEvent as ReactPointerEvent,
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

type Phase = "composing" | "sealed";
type ContactKind = "phone" | "email";

const displayFont = { fontFamily: '"Thmanyah Serif Display", "Thmanyah Sans", serif' };

type IconProps = { className?: string };

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

function Crest() {
  return (
    <span
      aria-hidden="true"
      className="crest size-9 text-[1.15rem] font-bold leading-none"
      style={displayFont}
    >
      و
    </span>
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
            <bdi dir="ltr" className="block select-all text-sm font-bold text-[#294B43]">
              {weddingConfig.whatsappDisplayNumber}
            </bdi>
          </span>
          <button
            type="button"
            onClick={() => onCopy("phone")}
            className="focus-ring flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl px-3 text-sm font-bold text-[#8C7046]"
            aria-label={copiedContact === "phone" ? "تم نسخ رقم عبدالله" : "نسخ رقم عبدالله"}
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
            <bdi dir="ltr" className="block select-all truncate text-sm font-bold text-[#294B43]">
              {weddingConfig.email}
            </bdi>
          </span>
          <button
            type="button"
            onClick={() => onCopy("email")}
            className="focus-ring flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl px-3 text-sm font-bold text-[#8C7046]"
            aria-label={copiedContact === "email" ? "تم نسخ إيميل عبدالله" : "نسخ إيميل عبدالله"}
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
        className={copyStatus ? "px-1 pt-2 text-xs leading-5 text-[#69736C]" : "sr-only"}
        aria-live="polite"
      >
        {copyStatus}
      </p>
    </section>
  );
}

export function WeddingGreeting() {
  const [phase, setPhase] = useState<Phase>("composing");
  const [guestName, setGuestName] = useState("");
  const [message, setMessage] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<CardTemplateId>("ivory");
  const [sealError, setSealError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);
  const [showSaveFallback, setShowSaveFallback] = useState(false);
  const [showTextDelivery, setShowTextDelivery] = useState(false);
  const [cardStatus, setCardStatus] = useState("");
  const [copiedContact, setCopiedContact] = useState<ContactKind | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  const messageId = useId();
  const nameId = useId();
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const closeImageRef = useRef<HTMLButtonElement>(null);
  const swipeStartX = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (generatedUrl) URL.revokeObjectURL(generatedUrl);
    };
  }, [generatedUrl]);

  useEffect(() => {
    if (isImageExpanded) closeImageRef.current?.focus();
  }, [isImageExpanded]);

  const formattedMessage = formatGreetingMessage({
    guestName,
    message,
    groomName: weddingConfig.groomName,
  });
  const whatsappUrl = buildWhatsAppUrl(weddingConfig.whatsappNumber, formattedMessage);
  const emailUrl = buildEmailUrl(
    weddingConfig.email,
    weddingConfig.emailSubject,
    formattedMessage,
  );

  function triggerShake() {
    setIsShaking(false);
    requestAnimationFrame(() => setIsShaking(true));
  }

  function discardGeneratedCard() {
    setGeneratedBlob(null);
    setGeneratedUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    setShowSaveFallback(false);
  }

  function handleSeal() {
    if (message.trim().length < 5) {
      setSealError("اكتب كلمتك لعبدالله أول");
      messageRef.current?.focus();
      triggerShake();
      return;
    }

    if (guestName.trim().length < 2) {
      setSealError("وقّع البطاقة باسمك");
      nameRef.current?.focus();
      triggerShake();
      return;
    }

    setSealError(null);
    setGuestName(guestName.trim());
    setMessage(message.trim());
    setPhase("sealed");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function editGreeting() {
    discardGeneratedCard();
    setShowTextDelivery(false);
    setCopiedContact(null);
    setCopyStatus("");
    setCardStatus("");
    setPhase("composing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function changeTemplate(id: CardTemplateId) {
    if (phase !== "composing") return;
    setSelectedTemplate(id);
  }

  function stepTemplate(delta: number) {
    const index = cardTemplates.findIndex((item) => item.id === selectedTemplate);
    const next = (index + delta + cardTemplates.length) % cardTemplates.length;
    setSelectedTemplate(cardTemplates[next].id);
  }

  function handleSwipeStart(event: ReactPointerEvent<HTMLDivElement>) {
    if (phase !== "composing") return;
    swipeStartX.current = event.clientX;
  }

  function handleSwipeEnd(event: ReactPointerEvent<HTMLDivElement>) {
    if (phase !== "composing" || swipeStartX.current === null) return;
    const dx = event.clientX - swipeStartX.current;
    swipeStartX.current = null;
    if (Math.abs(dx) < 50) return;
    stepTemplate(dx < 0 ? 1 : -1);
  }

  function handleParallax(event: ReactPointerEvent<HTMLDivElement>) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const { innerWidth, innerHeight } = window;
    const x = (event.clientX / innerWidth - 0.5) * -20;
    const y = (event.clientY / innerHeight - 0.5) * -20;
    event.currentTarget.style.setProperty("--parallax-x", `${x.toFixed(1)}px`);
    event.currentTarget.style.setProperty("--parallax-y", `${y.toFixed(1)}px`);
  }

  async function shareGreetingCard() {
    setIsGenerating(true);
    setCardStatus("");

    try {
      let blob = generatedBlob;
      if (!blob) {
        blob = await renderGreetingCard({
          template: getCardTemplate(selectedTemplate),
          groomName: weddingConfig.groomName,
          guestName,
          message,
        });
        setGeneratedBlob(blob);
        setGeneratedUrl(URL.createObjectURL(blob));
      }

      const file = new File([blob], "tahnia-abdullah.png", { type: "image/png" });
      const sharingIsSupported =
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] });

      if (sharingIsSupported) {
        await navigator.share({
          files: [file],
          title: `تهنئة لـ${weddingConfig.groomName}`,
          text: formattedMessage,
        });
        setCardStatus("فُتحت خيارات المشاركة.");
      } else {
        setShowSaveFallback(true);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShowSaveFallback(true);
      setCardStatus(
        "تعذرت المشاركة المباشرة. كبّر البطاقة واحفظها في الصور، ثم شاركها من جهازك.",
      );
    } finally {
      setIsGenerating(false);
    }
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

  const composing = phase === "composing";

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-xl flex-col overflow-x-clip sm:min-h-0 sm:py-10">
      <div
        onPointerMove={handleParallax}
        className="ornament-field app-shell flex flex-1 flex-col sm:rounded-[2rem] sm:border sm:border-[#E6DDC8] sm:bg-white sm:px-9 sm:pt-8 sm:pb-9 sm:shadow-[0_1px_2px_rgba(20,49,43,0.04),0_28px_60px_-24px_rgba(20,49,43,0.2)]"
      >
        <div className="flex min-h-11 items-center gap-2.5">
          <Crest />
          <p className="text-sm font-bold tracking-[-0.01em] text-[#14312B]">
            تهنئة لعبدالله
          </p>
        </div>

        <section className="flex flex-1 flex-col pt-6 pb-2 sm:justify-center sm:py-8">
          <header className="text-center">
            <p className="eyebrow text-xs font-bold text-[#9C7C42]">
              {composing ? "تهنئة بمناسبة الزواج" : "تهنئتك جاهزة"}
            </p>
            <h1
              className="mt-2 text-[1.6rem] leading-[1.25] font-bold tracking-[-0.02em] text-[#14312B] sm:text-[1.9rem]"
              style={displayFont}
            >
              {composing ? "اكتب تهنئتك على البطاقة" : "وقّعتها وختمتها"}
            </h1>
          </header>

          <div className="card-reveal mx-auto mt-6 w-full max-w-[17rem]">
            <div
              onPointerDown={handleSwipeStart}
              onPointerUp={handleSwipeEnd}
              onAnimationEnd={() => isShaking && setIsShaking(false)}
              className={`overflow-hidden rounded-[1.5rem] shadow-[0_1px_2px_rgba(20,49,43,0.06),0_22px_48px_-18px_rgba(20,49,43,0.32)] ${
                isShaking ? "card-shake" : ""
              } ${composing ? "touch-pan-y" : ""}`}
            >
              <CardTemplatePreview
                editable
                locked={!composing}
                sealed={!composing}
                template={getCardTemplate(selectedTemplate)}
                groomName={weddingConfig.groomName}
                guestName={guestName}
                message={message}
                messageId={messageId}
                nameId={nameId}
                messageRef={messageRef}
                nameRef={nameRef}
                onMessageChange={(value) => {
                  setMessage(value);
                  if (sealError) setSealError(null);
                }}
                onNameChange={(value) => {
                  setGuestName(value);
                  if (sealError) setSealError(null);
                }}
                messagePlaceholder="اكتب كلمتك لعبدالله هنا…"
                namePlaceholder="اسمك"
              />
            </div>
          </div>

          {sealError ? (
            <p className="mt-3 text-center text-sm font-medium text-[#A3453C]" role="alert">
              {sealError}
            </p>
          ) : null}

          {composing ? (
            <>
              <div className="mt-6 flex flex-col items-center gap-2.5">
                <div
                  role="radiogroup"
                  aria-label="تصميم البطاقة"
                  className="flex items-center gap-3.5"
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
                        onClick={() => changeTemplate(template.id)}
                        className="focus-ring grid place-items-center rounded-full p-1"
                      >
                        <span
                          className={`block rounded-full ring-1 ring-inset ring-black/10 transition-all duration-200 ${
                            isSelected
                              ? "size-4 shadow-[0_0_0_2px_#FFFFFF,0_0_0_4px_#9C7C42]"
                              : "size-3"
                          }`}
                          style={{ backgroundColor: template.background }}
                        />
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-[#9C8A6A]">اسحب البطاقة لتغيّر التصميم</p>
              </div>

              <button
                type="button"
                onClick={handleSeal}
                className="focus-ring group mt-7 flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#14312B] px-5 text-base font-bold text-white shadow-[0_14px_28px_-14px_rgba(20,49,43,0.55)] ring-1 ring-inset ring-[#C9AF7C]/25 transition-[background-color,transform] duration-200 hover:bg-[#1B4038] active:scale-[0.99]"
              >
                <span
                  className="grid size-8 place-items-center rounded-full border border-[#C9AF7C]/70 text-[#E7D3A5] transition-transform duration-200 group-active:scale-90"
                  style={displayFont}
                  aria-hidden="true"
                >
                  و
                </span>
                اختم التهنئة وأرسلها
              </button>
            </>
          ) : (
            <>
              <p className="mt-6 text-center text-[0.95rem] leading-7 text-[#5C645E]">
                كيف توصّلها لعبدالله؟
              </p>

              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  onClick={shareGreetingCard}
                  disabled={isGenerating}
                  className="focus-ring flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#14312B] px-5 text-base font-bold text-white shadow-[0_14px_28px_-14px_rgba(20,49,43,0.55)] ring-1 ring-inset ring-[#C9AF7C]/25 transition-[background-color,transform] duration-200 hover:bg-[#1B4038] active:scale-[0.99] disabled:cursor-wait disabled:opacity-65"
                >
                  {isGenerating ? (
                    <>
                      <IconSpinner className="size-5" />
                      جارٍ تجهيز البطاقة
                    </>
                  ) : (
                    <>
                      <IconSend className="size-5" />
                      شاركها بطاقة
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowTextDelivery((current) => !current)}
                  aria-expanded={showTextDelivery}
                  className="focus-ring flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-[#E6DDC8] bg-white px-5 text-base font-bold text-[#23463E] transition-[border-color,background-color] duration-200 hover:border-[#C9AF7C] hover:bg-[#FAF6EC] active:scale-[0.99]"
                >
                  <IconMessage className="size-5" />
                  أرسلها رسالة
                </button>

                {showTextDelivery ? (
                  <div className="screen-enter space-y-3 rounded-2xl border border-[#E6DDC8] bg-[#FAF6EC] p-3">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="focus-ring flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#14312B] px-4 text-sm font-bold text-white transition-colors hover:bg-[#1B4038]"
                    >
                      <IconSend className="size-4" />
                      واتساب
                    </a>
                    <a
                      href={emailUrl}
                      className="focus-ring flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#CFC6B7] bg-white px-4 text-sm font-bold text-[#23463E] transition-colors hover:bg-[#F3EEE2]"
                    >
                      <IconMail className="size-4" />
                      إيميل
                    </a>
                  </div>
                ) : null}
              </div>

              {showSaveFallback && generatedUrl ? (
                <div className="screen-enter mt-5 space-y-3">
                  <div className="relative mx-auto w-full max-w-[20rem] overflow-hidden rounded-[1.4rem] shadow-[0_1px_2px_rgba(20,49,43,0.06),0_20px_48px_-18px_rgba(20,49,43,0.3)]">
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
                  <p className="text-center text-sm leading-6 text-[#69736C]">
                    كبّر البطاقة، ثم اضغط عليها مطولًا واختر «حفظ الصورة» أو «إضافة إلى
                    الصور» حسب جهازك.
                  </p>
                </div>
              ) : null}

              {generatedBlob ? (
                <div className="mt-4">
                  <ShareChoiceHint
                    copiedContact={copiedContact}
                    copyStatus={copyStatus}
                    onCopy={copyContact}
                  />
                </div>
              ) : null}

              {cardStatus ? (
                <p className="mt-3 text-center text-sm text-[#69736C]" role="status">
                  {cardStatus}
                </p>
              ) : null}

              <button
                type="button"
                onClick={editGreeting}
                className="focus-ring mx-auto mt-6 inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-[#666F68] transition-colors hover:text-[#14312B]"
              >
                <span aria-hidden="true">→</span>
                عدّل التهنئة
              </button>
            </>
          )}
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
