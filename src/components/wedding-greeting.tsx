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

type Step = "compose" | "method" | "text" | "templates" | "card";
type FieldErrors = { name?: string; message?: string };

const maxNameLength = 50;
const maxMessageLength = 280;

type StepHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

function StepHeader({ eyebrow, title, description }: StepHeaderProps) {
  return (
    <header>
      {eyebrow ? (
        <p className="mb-3 text-sm font-medium text-[#9A7B49]">{eyebrow}</p>
      ) : null}
      <h1 className="text-[2rem] leading-[1.3] font-bold tracking-[-0.025em] text-[#183C34] sm:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-3 max-w-md text-[0.98rem] leading-7 text-[#69736C]">
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
      className="focus-ring -mr-2 inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-sm font-medium text-[#69736C] transition-colors hover:text-[#183C34]"
    >
      <span aria-hidden="true">→</span>
      رجوع
    </button>
  );
}

type ChoiceButtonProps = {
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
};

function ChoiceButton({ icon, title, description, onClick }: ChoiceButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="focus-ring group flex min-h-28 w-full items-center gap-4 rounded-3xl border border-[#DED8CC] bg-[#FCFAF5] p-5 text-right transition-[border-color,background-color,transform] hover:-translate-y-0.5 hover:border-[#BAA47F] hover:bg-white active:translate-y-0"
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#EEE8DD] text-xl text-[#183C34]">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-lg font-bold text-[#183C34]">{title}</span>
        <span className="mt-1 block text-sm leading-6 text-[#737A74]">
          {description}
        </span>
      </span>
      <span
        aria-hidden="true"
        className="text-lg text-[#A58B61] transition-transform group-hover:-translate-x-0.5"
      >
        ←
      </span>
    </button>
  );
}

function ProgressMark({ step }: { step: Step }) {
  const position =
    step === "compose" ? 1 : step === "method" ? 2 : step === "card" ? 4 : 3;

  return (
    <div className="flex items-center gap-1.5" aria-label={`الخطوة ${position} من 4`}>
      {[1, 2, 3, 4].map((item) => (
        <span
          key={item}
          className={`h-1.5 rounded-full transition-[width,background-color] ${
            item === position ? "w-6 bg-[#9B7D4F]" : "w-1.5 bg-[#D8D1C5]"
          }`}
        />
      ))}
    </div>
  );
}

export function WeddingGreeting() {
  const [step, setStep] = useState<Step>("compose");
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

  const nameId = useId();
  const messageId = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    return () => {
      if (generatedUrl) {
        URL.revokeObjectURL(generatedUrl);
      }
    };
  }, [generatedUrl]);

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
      nextErrors.name = "اكتب اسمك عشان نضيفه للتهنئة";
    }

    if (message.trim().length < 5) {
      nextErrors.message = "اكتب كلمة حلوة لعبدالله";
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
    setStep("method");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setCardStatus("");

    if (step === "method") setStep("compose");
    if (step === "text" || step === "templates") setStep("method");
    if (step === "card") setStep("templates");

    window.scrollTo({ top: 0, behavior: "smooth" });
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
      setStep("card");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setCardStatus("ما قدرنا نجهّز البطاقة. جرّب مرة ثانية.");
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
      setCardStatus("تم فتح خيارات المشاركة 🤍");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      setCanShareFiles(false);
      setCardStatus("المشاركة المباشرة ما اشتغلت. احفظ الصورة وشاركها من جهازك.");
    }
  }

  return (
    <div className="app-shell mx-auto flex min-h-svh w-full max-w-xl flex-col">
      <div className="flex min-h-11 items-center justify-between">
        <p className="text-sm font-bold tracking-[-0.01em] text-[#183C34]">
          فرحة عبدالله
          <span className="mr-1 text-[#A88956]" aria-hidden="true">
            •
          </span>
        </p>
        <ProgressMark step={step} />
      </div>

      <section
        key={step}
        className="screen-enter flex flex-1 flex-col pt-8 pb-2 sm:justify-center sm:py-12"
      >
        {step === "compose" ? (
          <>
            <StepHeader
              eyebrow="ليلة تبقى في الذاكرة"
              title="عبدالله يشاركك فرحته 🤍"
              description="اترك له كلمة حلوة تبقى معه بعد هالليلة. ما راح تاخذ منك إلا لحظة."
            />

            <form className="mt-9 space-y-5" onSubmit={handleComposeSubmit} noValidate>
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
                  className="focus-ring min-h-14 w-full rounded-2xl border border-[#DCD5C9] bg-[#FCFAF5] px-4 text-base text-[#183C34] placeholder:text-[#A8AAA5] focus:border-[#AA9167] focus:outline-none"
                />
                {errors.name ? (
                  <p id={`${nameId}-error`} className="mt-2 text-sm text-[#A34E46]">
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
                  className="focus-ring min-h-36 w-full resize-none rounded-2xl border border-[#DCD5C9] bg-[#FCFAF5] px-4 py-3 text-base leading-7 text-[#183C34] placeholder:text-[#A8AAA5] focus:border-[#AA9167] focus:outline-none"
                />
                {errors.message ? (
                  <p id={`${messageId}-error`} className="mt-2 text-sm text-[#A34E46]">
                    {errors.message}
                  </p>
                ) : null}
              </div>

              <button
                type="submit"
                className="focus-ring min-h-14 w-full rounded-2xl bg-[#183C34] px-5 text-base font-bold text-white transition-colors hover:bg-[#214C42] active:bg-[#12332C]"
              >
                كمّل
              </button>
            </form>
          </>
        ) : null}

        {step === "method" ? (
          <>
            <BackButton onClick={goBack} />
            <div className="mt-5">
              <StepHeader
                eyebrow={`يا هلا ${guestName}`}
                title="وش تحب ترسل؟"
                description="اختر الطريقة اللي تناسبك، وتهنئتك جاهزة."
              />
            </div>
            <div className="mt-8 space-y-3">
              <ChoiceButton
                icon={<span aria-hidden="true">✦</span>}
                title="رسالة نصية"
                description="أرسلها مباشرة على واتساب أو بالإيميل"
                onClick={() => setStep("text")}
              />
              <ChoiceButton
                icon={<span aria-hidden="true">▧</span>}
                title="بطاقة تهنئة"
                description="اختر تصميمًا أنيقًا وشارك الصورة من جوالك"
                onClick={() => setStep("templates")}
              />
            </div>
          </>
        ) : null}

        {step === "text" ? (
          <>
            <BackButton onClick={goBack} />
            <div className="mt-5">
              <StepHeader
                eyebrow="رسالتك جاهزة"
                title="أرسلها بالطريقة اللي تناسبك"
                description="بنفتح لك التطبيق والرسالة مكتوبة. راجعها واضغط إرسال بنفسك."
              />
            </div>

            <div className="mt-7 rounded-3xl border border-[#DED8CC] bg-[#FCFAF5] p-5">
              <p className="whitespace-pre-wrap text-[0.98rem] leading-8 text-[#294B43]">
                {formattedMessage}
              </p>
            </div>

            {weddingConfig.contactDetailsArePlaceholders ? (
              <p className="mt-3 rounded-xl bg-[#EEE8DD] px-3 py-2 text-xs leading-5 text-[#735F3E]">
                تنبيه للمطوّر: بيانات التواصل تجريبية وتحتاج تحديث قبل النشر.
              </p>
            ) : null}

            <div className="mt-6 space-y-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="focus-ring flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#183C34] px-5 text-base font-bold text-white transition-colors hover:bg-[#214C42]"
              >
                <span aria-hidden="true">◉</span>
                إرسال على واتساب
              </a>
              <a
                href={emailUrl}
                className="focus-ring flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-[#CFC6B7] bg-[#FCFAF5] px-5 text-base font-bold text-[#23463E] transition-colors hover:bg-white"
              >
                <span aria-hidden="true">✉</span>
                إرسال بالإيميل
              </a>
            </div>
          </>
        ) : null}

        {step === "templates" ? (
          <>
            <BackButton onClick={goBack} />
            <div className="mt-5">
              <StepHeader
                eyebrow="بطاقة خاصة منّك"
                title="اختر البطاقة اللي تعجبك"
                description="ثلاثة تصاميم بسيطة، وتهنئتك بتطلع جاهزة داخلها."
              />
            </div>

            <div className="mt-7 grid grid-cols-3 gap-2.5" role="radiogroup" aria-label="تصميم البطاقة">
              {cardTemplates.map((template) => {
                const isSelected = selectedTemplate === template.id;

                return (
                  <button
                    key={template.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`focus-ring min-w-0 rounded-[1.2rem] border p-1.5 text-right transition-[border-color,box-shadow] ${
                      isSelected
                        ? "border-[#987A4B] shadow-[0_0_0_2px_rgba(152,122,75,0.14)]"
                        : "border-[#DED8CC]"
                    }`}
                  >
                    <CardTemplatePreview
                      template={template}
                      groomName={weddingConfig.groomName}
                      guestName={guestName}
                      message={message}
                      compact
                    />
                    <span className="mt-2 block truncate px-1 text-sm font-bold text-[#26473F]">
                      {template.name}
                    </span>
                    <span className="mb-1 block truncate px-1 text-[11px] text-[#7A807B]">
                      {template.description}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={generateCard}
              disabled={isGenerating}
              className="focus-ring mt-7 min-h-14 w-full rounded-2xl bg-[#183C34] px-5 text-base font-bold text-white transition-colors hover:bg-[#214C42] disabled:cursor-wait disabled:opacity-65"
            >
              {isGenerating ? "نجهّز بطاقتك…" : "معاينة البطاقة"}
            </button>
            {cardStatus ? (
              <p className="mt-3 text-center text-sm text-[#A34E46]" role="alert">
                {cardStatus}
              </p>
            ) : null}
          </>
        ) : null}

        {step === "card" && generatedUrl ? (
          <>
            <BackButton onClick={goBack} />
            <div className="mt-5">
              <StepHeader
                eyebrow="تهنئتك جاهزة 🤍"
                title="معاينة البطاقة"
                description="شاركها مباشرة، أو احفظها عندك لو جهازك ما يدعم مشاركة الصور."
              />
            </div>

            <div className="mx-auto mt-7 w-full max-w-[23rem] overflow-hidden rounded-[1.6rem] shadow-[0_18px_50px_rgba(49,56,51,0.12)]">
              <Image
                src={generatedUrl}
                alt={`بطاقة تهنئة لـ${weddingConfig.groomName} من ${guestName}`}
                width={1080}
                height={1350}
                unoptimized
                className="h-auto w-full"
              />
            </div>

            <div className="mt-7 space-y-3">
              {canShareFiles ? (
                <>
                  <button
                    type="button"
                    onClick={shareCard}
                    className="focus-ring min-h-14 w-full rounded-2xl bg-[#183C34] px-5 text-base font-bold text-white transition-colors hover:bg-[#214C42]"
                  >
                    مشاركة البطاقة
                  </button>
                  <p className="px-1 text-center text-xs leading-5 text-[#737A74]">
                    اختر واتساب من خيارات المشاركة لإرسال البطاقة مع التهنئة.
                  </p>
                </>
              ) : (
                <p className="rounded-2xl bg-[#EEE8DD] px-4 py-3 text-sm leading-6 text-[#735F3E]">
                  المشاركة المباشرة غير مدعومة هنا. احفظ الصورة وشاركها من جهازك.
                </p>
              )}

              <a
                href={generatedUrl}
                download="tahnia-abdullah.png"
                className="focus-ring flex min-h-14 w-full items-center justify-center rounded-2xl border border-[#CFC6B7] bg-[#FCFAF5] px-5 text-base font-bold text-[#23463E] transition-colors hover:bg-white"
              >
                حفظ الصورة
              </a>
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
        بكل حب، صُممت لفرحة عبدالله
      </footer>
    </div>
  );
}
