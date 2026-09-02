"use client";

import { weddingConfig } from "@/config/wedding";

type WishSentProps = {
  guestName: string;
  cardStatus: string;
  copiedContact: boolean;
  copyStatus: string;
  onDownload: () => void;
  onShare: () => void;
  onCopyPhone: () => void;
};

const mutedText = "color-mix(in srgb, var(--color-text) 60%, transparent)";

function riseIn(delay: string): string {
  return `riseIn 0.6s ease ${delay} both`;
}

export function WishSent({
  guestName,
  cardStatus,
  copiedContact,
  copyStatus,
  onDownload,
  onShare,
  onCopyPhone,
}: WishSentProps) {
  return (
    <div className="step step-sent">
      <div
        aria-hidden="true"
        style={{
          alignSelf: "center",
          display: "grid",
          placeItems: "center",
          width: 76,
          height: 76,
          border: "2px solid var(--color-accent-700)",
          animation: "markIn 0.4s ease both",
        }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path
            d="M9 20.5 L17 28 L31 12"
            stroke="var(--color-accent-700)"
            strokeWidth="3"
            strokeLinecap="square"
            strokeDasharray="48"
            style={{ animation: "drawCheck 0.6s ease-out 0.25s both" }}
          />
        </svg>
      </div>

      <div
        aria-hidden="true"
        style={{
          height: 2,
          width: "100%",
          background: "var(--color-accent-700)",
          transformOrigin: "right",
          animation: "wipeIn 0.4s ease-out 0.5s both",
        }}
      />

      <h2
        className="ar"
        role="status"
        aria-live="polite"
        style={{
          margin: 0,
          fontSize: 30,
          textAlign: "center",
          animation: riseIn("0.6s"),
        }}
      >
        وصلت تهنئتك
      </h2>

      <p
        className="ar"
        style={{
          margin: 0,
          fontSize: 18,
          fontWeight: 700,
          textAlign: "center",
          color: "var(--color-accent-700)",
          animation: riseIn("0.68s"),
        }}
      >
        شكرًا لك يا {guestName}
      </p>

      <p
        className="ar"
        style={{
          margin: 0,
          fontSize: 15,
          lineHeight: 1.9,
          textAlign: "center",
          color: mutedText,
          animation: riseIn("0.76s"),
        }}
      >
        حُفظت تهنئتك وستصل {weddingConfig.groomName} كاملة.
        <br />
        شكرًا لمشاركتك الفرحة.
      </p>

      <div
        className="contain-content"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginTop: 8,
          animation: riseIn("0.86s"),
        }}
      >
        <p className="ar" style={{ margin: 0, fontSize: 13, fontWeight: 700, textAlign: "center" }}>
          احفظ بطاقتك أو شاركها
        </p>
        <button
          type="button"
          onClick={onDownload}
          className="btn btn-secondary ar"
          style={{ justifyContent: "center", padding: "14px 0", fontSize: 15 }}
        >
          حفظ الصورة
        </button>
        <button
          type="button"
          onClick={onShare}
          className="btn btn-secondary ar"
          style={{ justifyContent: "center", padding: "14px 0", fontSize: 15 }}
        >
          مشاركة الصورة
        </button>
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
          animation: riseIn("0.94s"),
        }}
        aria-label="بيانات تواصل عبد الله"
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
              رقم عبد الله
            </span>
            <bdi dir="ltr" style={{ display: "block", fontSize: 14, fontWeight: 700 }}>
              {weddingConfig.whatsappDisplayNumber}
            </bdi>
          </span>
          <button
            type="button"
            onClick={onCopyPhone}
            className="btn btn-ghost ar"
            style={{ fontSize: 13, flexShrink: 0 }}
            aria-label={copiedContact ? "تم نسخ رقم عبد الله" : "نسخ رقم عبد الله"}
          >
            {copiedContact ? "تم النسخ ✓" : "نسخ"}
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
          role="alert"
          style={{
            textAlign: "center",
            fontSize: 14,
            color: "color-mix(in srgb, var(--color-text) 55%, transparent)",
          }}
        >
          {cardStatus}
        </p>
      ) : null}
    </div>
  );
}
