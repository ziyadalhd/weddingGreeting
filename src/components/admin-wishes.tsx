"use client";

import { useEffect, useMemo, useState } from "react";

import { GreetingCardDisplay } from "@/components/greeting-card-display";
import { getCardTemplate } from "@/config/card-templates";
import { weddingConfig } from "@/config/wedding";
import { fetchWishes, type WishRow } from "@/lib/wishes";

type AdminWishesProps = {
  onSignOut: () => void;
};

const mutedText = "color-mix(in srgb, var(--color-text) 55%, transparent)";
const dateFormatter = new Intl.DateTimeFormat("ar-SA", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function AdminWishes({ onSignOut }: AdminWishesProps) {
  const [wishes, setWishes] = useState<WishRow[] | null>(null);
  const [search, setSearch] = useState("");
  const [cardsView, setCardsView] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const rows = await fetchWishes();

        if (active) setWishes(rows);
      } catch {
        if (active) setError("تعذر تحميل التهاني. حدّث الصفحة.");
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  const visible = useMemo(() => {
    if (!wishes) return [];

    const term = search.trim();

    if (!term) return wishes;

    return wishes.filter(
      (wish) => wish.guestName.includes(term) || wish.message.includes(term),
    );
  }, [wishes, search]);

  return (
    <div dir="rtl" lang="ar" className="app-shell ar">
      <div className="admin-page">
        <header className="admin-header">
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
            <h1 className="ar" style={{ margin: 0, fontSize: 26 }}>
              التهاني
            </h1>
            <button type="button" onClick={onSignOut} className="btn btn-ghost ar" style={{ fontSize: 13 }}>
              خروج
            </button>
          </div>
          <p className="ar" style={{ margin: "2px 0 0", fontSize: 13, color: mutedText }}>
            {wishes === null ? "جاري التحميل..." : `${visible.length} من ${wishes.length} تهنئة`}
          </p>

          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <input
              type="search"
              className="input ar"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ابحث باسم أو كلمة..."
              aria-label="ابحث في التهاني"
              style={{ flex: "1 1 180px" }}
            />
            <button
              type="button"
              onClick={() => setCardsView((value) => !value)}
              aria-pressed={cardsView}
              className="btn btn-secondary ar"
              style={{
                flexShrink: 0,
                background: cardsView ? "var(--color-accent-700)" : undefined,
                color: cardsView ? "var(--color-bg)" : undefined,
                borderColor: cardsView ? "var(--color-accent-700)" : undefined,
              }}
            >
              عرض كبطاقات
            </button>
          </div>
        </header>

        {error ? (
          <p className="ar" role="alert" style={{ color: "var(--color-accent-700)" }}>
            {error}
          </p>
        ) : null}

        {wishes !== null && visible.length === 0 && !error ? (
          <p className="ar" style={{ color: mutedText, textAlign: "center", padding: "40px 0" }}>
            {wishes.length === 0 ? "لا توجد تهاني بعد." : "لا نتائج مطابقة."}
          </p>
        ) : null}

        <div className="admin-grid">
          {visible.map((wish) =>
            cardsView ? (
              <div key={wish.id} className="admin-card-design">
                <GreetingCardDisplay
                  template={getCardTemplate(wish.cardStyle)}
                  groomName={weddingConfig.groomFullName}
                  guestName={wish.guestName}
                  message={wish.message}
                  dateLine={weddingConfig.dateLine}
                />
                <time dateTime={wish.createdAt} className="ar" style={{ fontSize: 11, color: mutedText }}>
                  {dateFormatter.format(new Date(wish.createdAt))}
                </time>
              </div>
            ) : (
              <article key={wish.id} className="admin-card">
                <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 6 }}>
                  <h2 className="ar" style={{ margin: 0, fontSize: 17, color: "var(--color-accent-700)" }}>
                    {wish.guestName}
                  </h2>
                  <p className="ar" style={{ margin: 0, fontSize: 15, lineHeight: 1.8, whiteSpace: "pre-line" }}>
                    {wish.message}
                  </p>
                  <time dateTime={wish.createdAt} className="ar" style={{ fontSize: 11, color: mutedText }}>
                    {dateFormatter.format(new Date(wish.createdAt))}
                  </time>
                </div>
              </article>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
