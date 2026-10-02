import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs";
import { authenticateJWT, requireRole, AuthRequest } from "../middleware/auth";
import { createAuditLog, prisma } from "../utils/audit";
import { sendWhatsAppMessage, DEFAULT_TEMPLATE_AR, DEFAULT_TEMPLATE_EN, compileTemplate, getPropertyTypeLabel } from "../whatsapp";

const router = Router();

// Dynamic Bilingual Templates Storage
const TEMPLATES_FILE = path.join(__dirname, "../../templates.json");
let whatsappTemplateAr = DEFAULT_TEMPLATE_AR;
let whatsappTemplateEn = DEFAULT_TEMPLATE_EN;

if (fs.existsSync(TEMPLATES_FILE)) {
  try {
    const raw = fs.readFileSync(TEMPLATES_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (parsed) {
      if (parsed.templateAr) whatsappTemplateAr = parsed.templateAr;
      if (parsed.templateEn) whatsappTemplateEn = parsed.templateEn;
      if (parsed.template && !parsed.templateEn) whatsappTemplateEn = parsed.template;
    }
  } catch (e) {
    console.error("Failed to load templates file, using default.");
  }
}

router.get("/whatsapp/templates", authenticateJWT, (req: Request, res: Response) => {
  res.json({
    templateAr: whatsappTemplateAr,
    templateEn: whatsappTemplateEn,
    template: whatsappTemplateAr,
  });
});

router.put("/whatsapp/templates", authenticateJWT, requireRole(["ADMIN", "MANAGER"]), (req: Request, res: Response) => {
  const { templateAr, templateEn, template } = req.body;
  if (templateAr) whatsappTemplateAr = templateAr;
  if (templateEn) whatsappTemplateEn = templateEn;
  if (template && !templateAr) whatsappTemplateAr = template;

  try {
    fs.writeFileSync(
      TEMPLATES_FILE,
      JSON.stringify({
        templateAr: whatsappTemplateAr,
        templateEn: whatsappTemplateEn,
      })
    );
  } catch (e) {
    console.error("Failed to save templates to disk", e);
  }

  res.json({
    message: "Templates updated successfully",
    templateAr: whatsappTemplateAr,
    templateEn: whatsappTemplateEn,
  });
});

router.get("/whatsapp/logs", authenticateJWT, async (req: Request, res: Response) => {
  try {
    const logs = await prisma.whatsAppLog.findMany({
      include: { client: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/whatsapp/send-alert", authenticateJWT, async (req: AuthRequest, res: Response) => {
  const { clientId, propertyId, lang = "ar" } = req.body;
  try {
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    const property = await prisma.property.findUnique({ where: { id: propertyId } });

    if (!client || !property) {
      return res.status(404).json({ message: "Client or Property not found" });
    }

    const templateToUse = lang === "en" ? whatsappTemplateEn : whatsappTemplateAr;
    const propertyTypeLabel = getPropertyTypeLabel(property.type, lang === "en" ? "en" : "ar");
    const priceFormatted = lang === "en" ? `${property.price.toLocaleString()} EGP` : `${property.price.toLocaleString()} ج.م`;

    const targetPhone = client.whatsapp?.trim() || client.phone?.trim();
    if (!targetPhone) {
      return res.status(400).json({
        message: lang === "en" 
          ? "Client does not have a registered phone or WhatsApp number" 
          : "العميل ليس لديه رقم هاتف أو واتساب مسجل",
      });
    }

    // Compile template
    const text = compileTemplate(templateToUse, {
      clientName: client.name,
      type: propertyTypeLabel,
      location: property.address,
      price: priceFormatted,
      area: String(property.area),
      bedrooms: String(property.bedrooms || 0),
      link: `http://localhost:5173/properties?search=${encodeURIComponent(property.propertyId)}`,
    });

    const result = await sendWhatsAppMessage(client.id, targetPhone, text);
    
    if (result.success) {
      await createAuditLog(req.user?.id, req.user?.name, "SEND_WHATSAPP_NOTIFICATION", {
        clientId: client.id,
        propertyId: property.id,
        status: "SENT",
        lang,
      });
      res.json(result);
    } else {
      res.status(400).json({ message: result.error });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
