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
