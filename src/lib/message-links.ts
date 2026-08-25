type MessageDetails = {
  guestName: string;
  message: string;
};

export function formatGreetingMessage({
  guestName,
  message,
}: MessageDetails): string {
  return `${message.trim()}\n- ${guestName.trim()}`;
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
