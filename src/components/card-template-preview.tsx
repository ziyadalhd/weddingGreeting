import { memo } from "react";

import type { CardTemplate } from "@/config/card-templates";

type CardTemplatePreviewProps = {
  template: CardTemplate;
  groomName: string;
};

function CardTemplatePreviewComponent({
  template,
  groomName,
}: CardTemplatePreviewProps) {
  const label = `${template.name} — ${template.description}`;

  if (template.id === "poster") {
    return (
      <div
        className="ar"
        style={{
          flex: 1,
          aspectRatio: "5/3",
          background: "var(--color-neutral-900)",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 4,
          textAlign: "right",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 22, color: "var(--color-bg)" }}>
          {groomName}
        </div>
        <div
          style={{
            fontSize: 10,
            color: "color-mix(in srgb, var(--color-bg) 75%, transparent)",
          }}
        >
          {label}
        </div>
      </div>
    );
  }

  if (template.id === "ledger") {
    return (
      <div
        className="ar"
        style={{
          flex: 1,
          aspectRatio: "5/3",
          background: "var(--color-surface)",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 6,
          textAlign: "right",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--color-divider)",
            paddingBottom: 4,
          }}
        >
          <span
            style={{
              fontSize: 10,
              color: "color-mix(in srgb, var(--color-text) 55%, transparent)",
            }}
          >
            المناسبة
          </span>
          <span style={{ fontSize: 12, fontWeight: 700 }}>زواج {groomName}</span>
        </div>
        <div
          style={{
            fontSize: 10,
            color: "color-mix(in srgb, var(--color-text) 55%, transparent)",
          }}
        >
          {label}
        </div>
      </div>
    );
  }

  return (
    <div
      className="ar"
      style={{
        position: "relative",
        flex: 1,
        aspectRatio: "5/3",
        background: "var(--color-bg)",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 4,
        textAlign: "right",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 6,
          border: "1px solid var(--color-divider)",
        }}
      />
      <div
        style={{
          height: 2,
          background: "var(--color-accent-700)",
          width: "40%",
          alignSelf: "flex-end",
          marginBottom: 4,
        }}
      />
      <div style={{ fontWeight: 700, fontSize: 22 }}>{groomName}</div>
      <div
        style={{
          fontSize: 10,
          color: "color-mix(in srgb, var(--color-text) 55%, transparent)",
        }}
      >
        {label}
      </div>
    </div>
  );
}

export const CardTemplatePreview = memo(CardTemplatePreviewComponent);
