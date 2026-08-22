type MessageDetails = {
  guestName: string;
  message: string;
  groomName: string;
};

export function formatGreetingMessage({
  guestName,
  message,
  groomName,
}: MessageDetails): string {
  return `إلى ${groomName}،\n\n${message.trim()}\n\nمن: ${guestName.trim()}`;
}

export function buildWhatsAppUrl(
  whatsappNumber: string,
  message: string,
): string {
  const normalizedNumber = whatsappNumber.replace(/\D/g, "");

  return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`;
}

export function buildEmailUrl(
  recipient: string,
  subject: string,
  body: string,
): string {
  return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
