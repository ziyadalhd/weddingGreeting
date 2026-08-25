type MessageDetails = {
  guestName: string;
  message: string;
};

export function formatGreetingMessage({
  guestName,
  message,
}: MessageDetails): string {
  return `تهنئة من ${guestName.trim()}:\n${message.trim()}`;
}

export function buildWhatsAppShareUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export function buildEmailUrl(
  recipient: string,
  subject: string,
  body: string,
): string {
  return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
