export const officialEmail = "contact@meritifyacademy.com";
export const officialPhoneDisplay = "0666 01 30 76";
export const officialPhoneLink = "+213666013076";
export const officialWhatsAppUrl = process.env.NEXT_PUBLIC_WHATSAPP_URL || `https://wa.me/${officialPhoneLink}`;

export function getWhatsAppHref(message?: string) {
  if (!message) return officialWhatsAppUrl;
  return `${officialWhatsAppUrl}${officialWhatsAppUrl.includes("?") ? "&" : "?"}text=${encodeURIComponent(message)}`;
}
