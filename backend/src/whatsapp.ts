import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface WhatsAppTemplateData {
  clientName: string;
  type: string;
  location: string;
  price: string;
  area: string;
  bedrooms: string;
  link: string;
}

export const DEFAULT_TEMPLATE_AR = 
`مرحباً {clientName}،
يسرنا إبلاغك بتوفر عقار جديد مطابق لمتطلباتك تماماً:

🏢 نوع العقار: {type}
📍 الموقع: {location}
💰 السعر: {price}
📐 المساحة: {area} م²
🛏️ غرف النوم: {bedrooms}

🔗 للاطلاع على كافة التفاصيل والصور اضغط هنا:
{link}`;

export const DEFAULT_TEMPLATE_EN = 
`Hello {clientName},
A new {type} matching your requirements is now available:

🏢 Property Type: {type}
📍 Location: {location}
💰 Price: {price}
📐 Area: {area} sqm
🛏️ Bedrooms: {bedrooms}

🔗 Click here to view details and photos:
{link}`;

export const DEFAULT_TEMPLATE = DEFAULT_TEMPLATE_AR;

export function getPropertyTypeLabel(type: string, lang: 'ar' | 'en' = 'ar'): string {
  const map: Record<string, { ar: string; en: string }> = {
    APARTMENT: { ar: "شقة سكنية", en: "Apartment" },
    VILLA: { ar: "فيلا مستقلة", en: "Villa" },
    OFFICE: { ar: "مكتب إداري", en: "Office" },
    SHOP: { ar: "محل تجاري", en: "Shop" },
    LAND: { ar: "أرض", en: "Land" },
  };
  return map[type.toUpperCase()] ? map[type.toUpperCase()][lang] : type;
}

/**
 * Replaces placeholders in template with actual values
 */
export function compileTemplate(template: string, data: WhatsAppTemplateData): string {
  return template
    .replace(/{clientName}/g, data.clientName)
    .replace(/{type}/g, data.type)
    .replace(/{location}/g, data.location)
    .replace(/{price}/g, data.price)
    .replace(/{area}/g, data.area)
    .replace(/{bedrooms}/g, data.bedrooms)
    .replace(/{link}/g, data.link);
}

/**
 * Formats a phone number for wa.me API link (e.g. cleans up characters and adds country code)
 */
export function formatPhoneNumber(phone?: string | null): string {
  if (!phone) return "";
  let cleaned = phone.replace(/\D/g, "");
  // Remove leading 00 if international format e.g. 0020... -> 20...
  while (cleaned.startsWith("00")) {
    cleaned = cleaned.substring(2);
  }
  // Local Egyptian mobile number starts with 01 and length is 11 (e.g. 01012345678 -> 201012345678)
  if (cleaned.startsWith("01") && cleaned.length === 11) {
    cleaned = "2" + cleaned;
  }
  return cleaned;
}

/**
 * Simulates sending a WhatsApp alert. Saves a log in the database.
 */
export async function sendWhatsAppMessage(
  clientId: string,
  clientPhone: string,
  messageText: string
) {
  try {
    const cleanedPhone = formatPhoneNumber(clientPhone);
    if (!cleanedPhone) {
      return {
        success: false,
        error: "رقم الهاتف غير صالح للإرسال عبر واتساب",
      };
    }
    const waLink = `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(messageText)}`;

    const log = await prisma.whatsAppLog.create({
      data: {
        clientId: clientId,
        message: messageText,
        status: "SENT",
        direction: "OUTBOUND",
      },
    });

    return {
      success: true,
      log,
      waLink,
    };
  } catch (error: any) {
    console.error("Error logging WhatsApp message:", error);
    return {
      success: false,
      error: error.message || "Failed to log WhatsApp alert",
    };
  }
}
