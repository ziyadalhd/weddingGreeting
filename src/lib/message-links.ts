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
  return `يا ${groomName}،\n\n${message.trim()}\n\nمحبّك، ${guestName.trim()}`;
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
