import { weddingConfig } from "@/config/wedding";

export function EventClosed() {
  return (
    <div dir="rtl" lang="ar" className="app-shell ar">
      <div className="step step-sent" style={{ textAlign: "center" }}>
        <div style={{ height: 2, background: "var(--color-accent-700)", margin: "0 auto 8px" }} />
        <h1 style={{ margin: 0, fontSize: 28 }}>شكرًا لكم</h1>
        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.9 }}>
          {`انتهت مناسبة زواج ${weddingConfig.groomName}، وأُغلق استقبال التهاني.\nشكرًا لكل من شاركنا الفرحة.`}
        </p>
      </div>
    </div>
  );
}
