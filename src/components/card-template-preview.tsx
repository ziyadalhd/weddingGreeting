import type { CardTemplate } from "@/config/card-templates";

type CardTemplatePreviewProps = {
  template: CardTemplate;
  groomName: string;
  guestName: string;
  message: string;
  compact?: boolean;
  placeholderName?: boolean;
  placeholderMessage?: boolean;
};

export function CardTemplatePreview({
  template,
  groomName,
  guestName,
  message,
  compact = false,
  placeholderName = false,
  placeholderMessage = false,
}: CardTemplatePreviewProps) {
  return (
    <div
      className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.35rem] transition-colors duration-500 ease-out"
      style={{ backgroundColor: template.background, color: template.text }}
      aria-hidden="true"
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

      <div className="relative z-10 flex h-full flex-col items-center px-[13%] py-[14%] text-center">
        <p
          className={`mt-[7%] font-bold ${
            compact ? "text-lg" : "text-4xl sm:text-5xl"
          }`}
          style={{ fontFamily: '"Thmanyah Serif Display", "Thmanyah Sans", serif' }}
        >
          إلى {groomName}
        </p>
        <span
          className={`mt-[7%] block h-px transition-colors duration-500 ${compact ? "w-6" : "w-12"}`}
          style={{ backgroundColor: template.accent }}
        />
        <p
          className={`mt-auto max-h-[42%] overflow-hidden [overflow-wrap:anywhere] leading-[1.75] transition-opacity duration-300 ${
            compact ? "text-[7px]" : "text-base sm:text-lg"
          } ${placeholderMessage ? "opacity-40" : ""}`}
          style={{ fontFamily: '"Thmanyah Serif Text", "Thmanyah Sans", serif' }}
        >
          {message}
        </p>
        <div className="mt-auto">
          <p
            className={compact ? "text-[6px]" : "text-[11px] sm:text-xs"}
            style={{ color: template.mutedText }}
          >
            من:
          </p>
          <p
            className={`mt-1 font-bold transition-opacity duration-300 ${
              compact ? "text-[8px]" : "text-sm sm:text-base"
            } ${placeholderName ? "opacity-40" : ""}`}
          >
            {guestName}
          </p>
        </div>
      </div>
    </div>
  );
}
