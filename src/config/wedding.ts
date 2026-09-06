export const weddingConfig = {
  groomName: "عبد الله",
  groomFullName: "عبد الله يحيى الحضريتي",
  whatsappNumber: "966550440918",
  whatsappDisplayNumber: "966550440918",
  email: "ziyadalhdriti@gmail.com",
  dateLine: "الجمعة ٤ سبتمبر ٢٠٢٦",
  // Supabase account the groom signs in with to read the wishes.
  adminEmail: "ziyadalhdriti@gmail.com",
  // The wedding is over: the guest-facing greeting form is closed and the
  // homepage shows a thank-you message instead. Admin wish history stays open.
  eventEnded: true,
} as const;

export type WeddingConfig = typeof weddingConfig;
