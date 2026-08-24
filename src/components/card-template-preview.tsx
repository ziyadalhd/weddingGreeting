import type { Ref } from "react";

import type { CardTemplate } from "@/config/card-templates";

const displayFontFamily = '"Thmanyah Serif Display", "Thmanyah Sans", serif';
const textFontFamily = '"Thmanyah Serif Text", "Thmanyah Sans", serif';

type CardTemplatePreviewProps = {
  template: CardTemplate;
  groomName: string;
  guestName: string;
  message: string;
  compact?: boolean;
  placeholderName?: boolean;
  placeholderMessage?: boolean;
  editable?: boolean;
  locked?: boolean;
  sealed?: boolean;
  messageId?: string;
  nameId?: string;
  messageRef?: Ref<HTMLTextAreaElement>;
  nameRef?: Ref<HTMLInputElement>;
  onMessageChange?: (value: string) => void;
  onNameChange?: (value: string) => void;
  messagePlaceholder?: string;
  namePlaceholder?: string;
};

export function CardTemplatePreview({
  template,
  groomName,
  guestName,
  message,
  compact = false,
  placeholderName = false,
  placeholderMessage = false,
  editable = false,
  locked = false,
  sealed = false,
  messageId,
  nameId,
  messageRef,
  nameRef,
  onMessageChange,
  onNameChange,
  messagePlaceholder,
  namePlaceholder,
}: CardTemplatePreviewProps) {
  return (
    <div
      className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.35rem] transition-colors duration-500 ease-out"
      style={{ backgroundColor: template.background, color: template.text }}
      aria-hidden={editable ? undefined : true}
    >
      <div
        className={`absolute inset-[5.5%] ${
          template.ornament === "frame"
            ? "border border-current opacity-35"
            : ""
        }`}
        style={{ color: template.accent }}
      />

      {template.ornament === "arch" ? (
        <div
          className="absolute inset-x-[8%] top-[10%] bottom-[7%] rounded-t-[999px] border border-b-0 opacity-50"
          style={{ borderColor: template.accent }}
        />
      ) : null}

      {template.ornament === "corners" ? (
        <>
          <span
            className="absolute -right-8 -top-8 size-20 rounded-full border opacity-45"
            style={{ borderColor: template.accent }}
          />
          <span
            className="absolute -bottom-8 -left-8 size-20 rounded-full border opacity-45"
            style={{ borderColor: template.accent }}
          />
        </>
      ) : null}

      {sealed ? (
        <span
          className="wax-stamp stamp-in absolute left-[9%] top-[8%] z-20 grid size-14 place-items-center rounded-full text-xl font-bold sm:size-16 sm:text-2xl"
          style={{
            color: template.accent,
            borderColor: template.accent,
            fontFamily: displayFontFamily,
          }}
          aria-hidden="true"
        >
          و
        </span>
      ) : null}

      <div className="relative z-10 flex h-full flex-col items-center px-[13%] py-[14%] text-center">
        <p
          className={`mt-[7%] font-bold ${
            compact ? "text-lg" : "text-4xl sm:text-5xl"
          }`}
          style={{ fontFamily: displayFontFamily }}
        >
          إلى {groomName}
        </p>
        <span
          className={`mt-[7%] block h-px transition-colors duration-500 ${compact ? "w-6" : "w-12"}`}
          style={{ backgroundColor: template.accent }}
        />

        {editable ? (
          <div className="mt-auto flex min-h-0 w-full flex-1 items-center">
            <textarea
              ref={messageRef}
              id={messageId}
              value={message}
              onChange={(event) => onMessageChange?.(event.target.value)}
              readOnly={locked}
              rows={3}
              aria-label="تهنئتك لعبدالله"
              placeholder={messagePlaceholder}
              className="card-input h-full max-h-full w-full resize-none text-center text-base leading-[1.75] sm:text-lg"
              style={{ fontFamily: textFontFamily, caretColor: template.accent }}
            />
          </div>
        ) : (
          <p
            className={`mt-auto max-h-[42%] overflow-hidden [overflow-wrap:anywhere] leading-[1.75] transition-opacity duration-300 ${
              compact ? "text-[7px]" : "text-base sm:text-lg"
            } ${placeholderMessage ? "opacity-40" : ""}`}
            style={{ fontFamily: textFontFamily }}
          >
            {message}
          </p>
        )}

        <div className="mt-auto w-full">
          <p
            className={compact ? "text-[6px]" : "text-[11px] sm:text-xs"}
            style={{ color: template.mutedText }}
          >
            من:
          </p>
          {editable ? (
            <input
              ref={nameRef}
              id={nameId}
              type="text"
              value={guestName}
              onChange={(event) => onNameChange?.(event.target.value)}
              readOnly={locked}
              aria-label="اسمك"
              placeholder={namePlaceholder}
              className="card-input mt-1 w-full text-center text-sm font-bold sm:text-base"
              style={{ caretColor: template.accent }}
            />
          ) : (
            <p
              className={`mt-1 font-bold transition-opacity duration-300 ${
                compact ? "text-[8px]" : "text-sm sm:text-base"
              } ${placeholderName ? "opacity-40" : ""}`}
            >
              {guestName}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
