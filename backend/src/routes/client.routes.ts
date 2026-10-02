import { Router, Request, Response } from "express";
import { authenticateJWT, requireRole, AuthRequest } from "../middleware/auth";
import { createAuditLog, prisma } from "../utils/audit";

const router = Router();

router.get("/clients", authenticateJWT, async (req: Request, res: Response) => {
  try {
    const clients = await prisma.client.findMany({
      include: { requirements: true, agent: true, broker: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(clients);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/clients", authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;

    if (!data.name || !data.phone) {
      return res.status(400).json({ message: "اسم العميل ورقم الهاتف مطلوبان" });
    }

    // Check duplicate phone
    const existingPhone = await prisma.client.findFirst({
      where: { phone: data.phone.trim() },
    });
    if (existingPhone) {
      return res.status(400).json({ message: `رقم الهاتف (${data.phone}) مسجل بالفعل لعميل آخر (${existingPhone.name})` });
    }

    // Check duplicate email if provided
    if (data.email && data.email.trim()) {
      const existingEmail = await prisma.client.findFirst({
        where: { email: data.email.trim() },
      });
      if (existingEmail) {
        return res.status(400).json({ message: `البريد الإلكتروني (${data.email}) مسجل بالفعل لعميل آخر (${existingEmail.name})` });
      }
    }

    const count = await prisma.client.count();
    const clientId = `CLI-${1000 + count + 1}`;

    const client = await prisma.client.create({
      data: {
        clientId,
        name: data.name.trim(),
        phone: data.phone.trim(),
        whatsapp: (data.whatsapp || data.phone).trim(),
        email: data.email ? data.email.trim() : null,
        clientType: data.clientType || "BUYER",
        pipelineStep: "NEW",
        agentId: data.agentId || req.user?.id,
        brokerId: data.brokerId || null,
      },
    });

    if (data.requirements) {
      const reqData = data.requirements;
      await prisma.requirement.create({
        data: {
          clientId: client.id,
          listingType: reqData.listingType,
          type: reqData.type,
          preferredAreas: JSON.stringify(reqData.preferredAreas || []),
          minBudget: reqData.minBudget ? Number(reqData.minBudget) : null,
          maxBudget: reqData.maxBudget ? Number(reqData.maxBudget) : null,
          minArea: reqData.minArea ? Number(reqData.minArea) : null,
          bedrooms: reqData.bedrooms ? Number(reqData.bedrooms) : null,
          furnished: Boolean(reqData.furnished),
          notes: reqData.notes,
          priority: reqData.priority || "MEDIUM",
        },
      });
    }

    await createAuditLog(req.user?.id, req.user?.name, "CREATE_CLIENT", { clientId, name: data.name });
    res.status(201).json(client);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/clients/:id", authenticateJWT, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const data = req.body;

    if (data.phone) {
      const existingPhone = await prisma.client.findFirst({
        where: { phone: data.phone.trim(), NOT: { id } },
      });
      if (existingPhone) {
        return res.status(400).json({ message: `رقم الهاتف (${data.phone}) مسجل بالفعل لعميل آخر (${existingPhone.name})` });
      }
    }

    if (data.email && data.email.trim()) {
      const existingEmail = await prisma.client.findFirst({
        where: { email: data.email.trim(), NOT: { id } },
      });
      if (existingEmail) {
        return res.status(400).json({ message: `البريد الإلكتروني (${data.email}) مسجل بالفعل لعميل آخر (${existingEmail.name})` });
      }
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        name: data.name ? data.name.trim() : undefined,
        phone: data.phone ? data.phone.trim() : undefined,
        whatsapp: data.whatsapp ? data.whatsapp.trim() : undefined,
        email: data.email !== undefined ? (data.email ? data.email.trim() : null) : undefined,
        clientType: data.clientType,
        pipelineStep: data.pipelineStep,
        agentId: data.agentId || null,
        brokerId: data.brokerId || null,
      },
    });

    if (data.requirements) {
      const reqData = data.requirements;
      await prisma.requirement.upsert({
        where: { clientId: id },
        update: {
          listingType: reqData.listingType,
          type: reqData.type,
          preferredAreas: JSON.stringify(reqData.preferredAreas || []),
          minBudget: reqData.minBudget ? Number(reqData.minBudget) : null,
          maxBudget: reqData.maxBudget ? Number(reqData.maxBudget) : null,
          minArea: reqData.minArea ? Number(reqData.minArea) : null,
          bedrooms: reqData.bedrooms ? Number(reqData.bedrooms) : null,
          furnished: Boolean(reqData.furnished),
          notes: reqData.notes,
          priority: reqData.priority || "MEDIUM",
        },
        create: {
          clientId: id,
          listingType: reqData.listingType,
          type: reqData.type,
          preferredAreas: JSON.stringify(reqData.preferredAreas || []),
          minBudget: reqData.minBudget ? Number(reqData.minBudget) : null,
          maxBudget: reqData.maxBudget ? Number(reqData.maxBudget) : null,
          minArea: reqData.minArea ? Number(reqData.minArea) : null,
          bedrooms: reqData.bedrooms ? Number(reqData.bedrooms) : null,
          furnished: Boolean(reqData.furnished),
          notes: reqData.notes,
          priority: reqData.priority || "MEDIUM",
        },
      });
    }

    await createAuditLog(req.user?.id, req.user?.name, "UPDATE_CLIENT", { id, name: data.name });
    res.json(client);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/clients/:id", authenticateJWT, requireRole(["ADMIN", "MANAGER"]), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.client.delete({ where: { id } });
    await createAuditLog(req.user?.id, req.user?.name, "DELETE_CLIENT", { id });
    res.json({ message: "Client deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
