"use client";

import { CardTemplatePreview } from "@/components/card-template-preview";
import { cardTemplates, type CardTemplateId } from "@/config/card-templates";
import { weddingConfig } from "@/config/wedding";

type WishPickProps = {
  cardStyle: CardTemplateId;
  onPick: (id: CardTemplateId) => void;
  onBack: () => void;
};

export function WishPick({ cardStyle, onPick, onBack }: WishPickProps) {
  return (
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
            onClick={() => onPick(item.id)}
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
        onClick={onBack}
        className="btn btn-ghost ar"
        style={{ justifyContent: "center" }}
      >
        رجوع
      </button>
    </div>
  );
}
