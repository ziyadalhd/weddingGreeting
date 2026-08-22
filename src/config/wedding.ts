export const weddingConfig = {
  groomName: "عبدالله",
  groomFullName: "عبدالله يحيى الحدريتي",
  whatsappNumber: "966500000000",
  email: "abdullah@example.com",
  eventDate: "",
  emailSubject: "تهنئة بمناسبة زواج عبدالله",
  contactDetailsArePlaceholders: true,
} as const;

export type WeddingConfig = typeof weddingConfig;
