export const weddingConfig = {
  groomName: "عبد الله",
  groomFullName: "عبد الله يحيى الحضريتي",
  whatsappNumber: "966550440918",
  whatsappDisplayNumber: "966550440918",
  email: "ziyadalhdriti@gmail.com",
  dateLine: "الجمعة ٤ سبتمبر ٢٠٢٦",
  // Supabase account the groom signs in with to read the wishes.
  adminEmail: "ziyadalhdriti@gmail.com",
} as const;

export type WeddingConfig = typeof weddingConfig;
