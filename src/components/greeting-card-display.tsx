import { memo, type CSSProperties } from "react";

import type { CardTemplate } from "@/config/card-templates";

type GreetingCardDisplayProps = {
  template: CardTemplate;
  groomName: string;
  guestName: string;
  message: string;
  dateLine: string;
};

const tickBase: CSSProperties = {
  position: "absolute",
  width: 8,
  height: 8,
  background: "var(--color-accent-700)",
  transform: "rotate(45deg)",
};

const nameFontSize = 24;

function GreetingCardDisplayComponent({
  template,
  groomName,
  guestName,
  message,
  dateLine,
}: GreetingCardDisplayProps) {
  const isPoster = template.id === "poster";

  if (template.id === "ledger") {
    return (
      <div
        className="ar"
        style={{
          position: "relative",
          background: "var(--color-surface)",
          padding: "26px 22px",
          display: "flex",
          flexDirection: "column",
          textAlign: "right",
        }}
      >
        <div
          style={{
            height: 3,
            background: "var(--color-accent-700)",
            marginBottom: 16,
          }}
        />
        {[
          ["المناسبة", `زواج ${groomName}`, false],
          ["التاريخ", dateLine, false],
          ["من", guestName, true],
        ].map(([label, value, isAccent]) => (
          <div
            key={label as string}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: "1px solid var(--color-divider)",
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: "color-mix(in srgb, var(--color-text) 55%, transparent)",
              }}
            >
              {label}
            </span>
            <span
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: isAccent ? "var(--color-accent-700)" : undefined,
              }}
            >
              {value}
            </span>
          </div>
        ))}

        <div style={{ padding: "10px 0" }}>
          <div
            style={{
              fontSize: 11,
              color: "color-mix(in srgb, var(--color-text) 55%, transparent)",
              marginBottom: 6,
            }}
          >
            الرسالة
          </div>
          <div style={{ fontSize: 28, lineHeight: 1.5 }}>{message}</div>
        </div>

        <div
          style={{
            height: 3,
            background: "var(--color-accent-700)",
            marginTop: 6,
          }}
        />
      </div>
    );
  }

  return (
    <div
      className="ar"
      style={{
        position: "relative",
        background: isPoster ? "var(--color-neutral-900)" : "var(--color-bg)",
        border: isPoster ? undefined : "1px solid var(--color-divider)",
        padding: "34px 26px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        textAlign: "right",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 9,
          border: `1px solid ${
            isPoster
              ? "color-mix(in srgb, var(--color-bg) 25%, transparent)"
              : "var(--color-divider)"
          }`,
          pointerEvents: "none",
        }}
      />
      <div style={{ ...tickBase, top: 5, right: 5 }} />
      <div style={{ ...tickBase, top: 5, left: 5 }} />
      <div style={{ ...tickBase, bottom: 5, right: 5 }} />
      <div style={{ ...tickBase, bottom: 5, left: 5 }} />

      <div style={{ height: 3, background: "var(--color-accent-700)", width: "100%" }} />

      <div
        style={{
          textAlign: "right",
          marginTop: 10,
        }}
      >
        <span
          style={{
            fontSize: 12,
            letterSpacing: "0.06em",
            color: isPoster
              ? "color-mix(in srgb, var(--color-bg) 80%, transparent)"
              : "var(--color-accent-700)",
          }}
        >
          بمناسبة زواج
        </span>
      </div>

      <div
        style={{
          fontWeight: 700,
          fontSize: nameFontSize,
          lineHeight: 1.5,
          padding: "6px 0",
          letterSpacing: "-0.01em",
          color: isPoster ? "var(--color-bg)" : undefined,
        }}
      >
        {groomName}
      </div>
      <div
        style={{
          fontSize: 13,
          color: isPoster
            ? "color-mix(in srgb, var(--color-bg) 80%, transparent)"
            : "color-mix(in srgb, var(--color-text) 55%, transparent)",
        }}
      >
        {dateLine}
      </div>
      <div
        style={{
          height: 1,
          background: isPoster
            ? "color-mix(in srgb, var(--color-bg) 30%, transparent)"
            : "var(--color-divider)",
          margin: "8px 0 22px",
        }}
      />
      <div
        style={{
          fontSize: 28,
          lineHeight: 1.5,
          color: isPoster ? "var(--color-bg)" : undefined,
        }}
      >
        «{message}»
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: "var(--color-accent-700)",
          marginTop: 4,
        }}
      >
        — {guestName}
      </div>
    </div>
  );
}

export const GreetingCardDisplay = memo(GreetingCardDisplayComponent);
