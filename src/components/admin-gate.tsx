"use client";

import { type FormEvent, useEffect, useId, useState } from "react";

import { AdminWishes } from "@/components/admin-wishes";
import { weddingConfig } from "@/config/wedding";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";

/**
 * Password-only sign-in for a single Supabase account. The gate is cosmetic;
 * the real protection is the row level security policy that only grants SELECT
 * on `wishes` to an authenticated session.
 */
export function AdminGate() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const passwordId = useId();

  useEffect(() => {
    if (!supabaseConfigured) return;

    const supabase = getSupabase();

    void supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session));
    });

    return () => data.subscription.unsubscribe();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (pending) return;

    setPending(true);
    setError("");

    try {
      const { error: signInError } = await getSupabase().auth.signInWithPassword({
        email: weddingConfig.adminEmail,
        password,
      });

      if (signInError) setError("كلمة المرور غير صحيحة");
    } catch {
      setError("تعذر الاتصال. حاول مرة أخرى.");
    } finally {
      setPassword("");
      setPending(false);
    }
  }

  async function signOut() {
    await getSupabase().auth.signOut();
  }

  // Without the environment variables there is nothing to sign in to, so say so
  // instead of leaving the page on its loading state forever.
  if (!supabaseConfigured) {
    return (
      <div className="step step-sent">
        <p className="ar" role="alert" style={{ textAlign: "center", margin: 0 }}>
          إعدادات Supabase غير مكتملة.
        </p>
      </div>
    );
  }

  if (signedIn === null) {
    return (
      <div className="step step-sent">
        <p className="ar" style={{ textAlign: "center", margin: 0 }}>
          جاري التحقق...
        </p>
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="step step-form">
        <div style={{ height: 2, background: "var(--color-accent-700)" }} />
        <h1 className="ar" style={{ margin: "6px 0 0", fontSize: 26 }}>
          التهاني
        </h1>
        <p
          className="ar"
          style={{
            margin: 0,
            fontSize: 13,
            color: "color-mix(in srgb, var(--color-text) 55%, transparent)",
          }}
        >
          هذه الصفحة لعبد الله وحده.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 12 }}
        >
          <div className="field">
            <label htmlFor={passwordId} className="ar">
              كلمة المرور
            </label>
            <input
              id={passwordId}
              type="password"
              className="input ar"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              autoFocus
            />
          </div>

          {error ? (
            <p
              className="ar"
              role="alert"
              style={{ margin: 0, fontSize: 14, color: "var(--color-accent-700)" }}
            >
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending || !password}
            className="btn btn-primary ar"
            style={{
              justifyContent: "center",
              padding: "14px 0",
              fontSize: 15,
              background: "var(--color-accent-700)",
            }}
          >
            {pending ? "جاري الدخول..." : "دخول"}
          </button>
        </form>
      </div>
    );
  }

  return <AdminWishes onSignOut={signOut} />;
}
