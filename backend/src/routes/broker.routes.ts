import { Router, Request, Response } from "express";
import { authenticateJWT, requireRole, AuthRequest } from "../middleware/auth";
import { createAuditLog, prisma } from "../utils/audit";

const router = Router();

router.get("/brokers", authenticateJWT, async (req: Request, res: Response) => {
  try {
    const brokers = await prisma.broker.findMany({
      include: { properties: true, clients: true, deals: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(brokers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/brokers", authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;

    if (!data.name || !data.phone) {
      return res.status(400).json({ message: "اسم الوسيط ورقم الهاتف مطلوبان" });
    }

    const existingPhone = await prisma.broker.findFirst({
      where: { phone: data.phone.trim() },
    });
    if (existingPhone) {
      return res.status(400).json({ message: `رقم الهاتف (${data.phone}) مسجل بالفعل لوسيط آخر (${existingPhone.name})` });
    }

    const broker = await prisma.broker.create({
      data: {
        name: data.name.trim(),
        phone: data.phone.trim(),
        whatsapp: (data.whatsapp || data.phone).trim(),
        commissionPct: Number(data.commissionPct || 2.5),
      },
    });
    await createAuditLog(req.user?.id, req.user?.name, "CREATE_BROKER", { name: data.name });
    res.status(201).json(broker);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/brokers/:id", authenticateJWT, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const data = req.body;

    if (data.phone) {
      const existingPhone = await prisma.broker.findFirst({
        where: { phone: data.phone.trim(), NOT: { id } },
      });
      if (existingPhone) {
        return res.status(400).json({ message: `رقم الهاتف (${data.phone}) مسجل بالفعل لوسيط آخر (${existingPhone.name})` });
      }
    }

    const broker = await prisma.broker.update({
      where: { id },
      data: {
        name: data.name ? data.name.trim() : undefined,
        phone: data.phone ? data.phone.trim() : undefined,
        whatsapp: data.whatsapp ? data.whatsapp.trim() : undefined,
        commissionPct: data.commissionPct !== undefined ? Number(data.commissionPct) : undefined,
      },
    });
    res.json(broker);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/brokers/:id", authenticateJWT, requireRole(["ADMIN", "MANAGER"]), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.broker.delete({ where: { id } });
    res.json({ message: "Broker deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
