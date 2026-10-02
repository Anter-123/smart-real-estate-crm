import { Router, Request, Response } from "express";
import { authenticateJWT, requireRole, AuthRequest } from "../middleware/auth";
import { createAuditLog, prisma } from "../utils/audit";

const router = Router();

router.get("/owners", authenticateJWT, async (req: Request, res: Response) => {
  try {
    const owners = await prisma.owner.findMany({
      include: { properties: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(owners);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/owners", authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;

    if (!data.name || !data.phone) {
      return res.status(400).json({ message: "اسم المالك ورقم الهاتف مطلوبان" });
    }

    // Check duplicate phone
    const existingPhone = await prisma.owner.findFirst({
      where: { phone: data.phone.trim() },
    });
    if (existingPhone) {
      return res.status(400).json({ message: `رقم الهاتف (${data.phone}) مسجل بالفعل لمالك آخر (${existingPhone.name})` });
    }

    // Check duplicate email if provided
    if (data.email && data.email.trim()) {
      const existingEmail = await prisma.owner.findFirst({
        where: { email: data.email.trim() },
      });
      if (existingEmail) {
        return res.status(400).json({ message: `البريد الإلكتروني (${data.email}) مسجل بالفعل لمالك آخر (${existingEmail.name})` });
      }
    }

    // Check duplicate nationalId if provided
    if (data.nationalId && data.nationalId.trim()) {
      const existingNat = await prisma.owner.findFirst({
        where: { nationalId: data.nationalId.trim() },
      });
      if (existingNat) {
        return res.status(400).json({ message: `الرقم القومي (${data.nationalId}) مسجل بالفعل لمالك آخر (${existingNat.name})` });
      }
    }

    const count = await prisma.owner.count();
    const ownerId = `OWN-${1000 + count + 1}`;

    const owner = await prisma.owner.create({
      data: {
        ownerId,
        name: data.name.trim(),
        phone: data.phone.trim(),
        whatsapp: (data.whatsapp || data.phone).trim(),
        email: data.email ? data.email.trim() : null,
        address: data.address ? data.address.trim() : null,
        nationalId: data.nationalId ? data.nationalId.trim() : null,
        notes: data.notes || null,
      },
    });
    await createAuditLog(req.user?.id, req.user?.name, "CREATE_OWNER", { ownerId, name: data.name });
    res.status(201).json(owner);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/owners/:id", authenticateJWT, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const data = req.body;

    if (data.phone) {
      const existingPhone = await prisma.owner.findFirst({
        where: { phone: data.phone.trim(), NOT: { id } },
      });
      if (existingPhone) {
        return res.status(400).json({ message: `رقم الهاتف (${data.phone}) مسجل بالفعل لمالك آخر (${existingPhone.name})` });
      }
    }

    if (data.email && data.email.trim()) {
      const existingEmail = await prisma.owner.findFirst({
        where: { email: data.email.trim(), NOT: { id } },
      });
      if (existingEmail) {
        return res.status(400).json({ message: `البريد الإلكتروني (${data.email}) مسجل بالفعل لمالك آخر (${existingEmail.name})` });
      }
    }

    if (data.nationalId && data.nationalId.trim()) {
      const existingNat = await prisma.owner.findFirst({
        where: { nationalId: data.nationalId.trim(), NOT: { id } },
      });
      if (existingNat) {
        return res.status(400).json({ message: `الرقم القومي (${data.nationalId}) مسجل بالفعل لمالك آخر (${existingNat.name})` });
      }
    }

    const owner = await prisma.owner.update({
      where: { id },
      data: {
        name: data.name ? data.name.trim() : undefined,
        phone: data.phone ? data.phone.trim() : undefined,
        whatsapp: data.whatsapp ? data.whatsapp.trim() : undefined,
        email: data.email !== undefined ? (data.email ? data.email.trim() : null) : undefined,
        address: data.address !== undefined ? (data.address ? data.address.trim() : null) : undefined,
        nationalId: data.nationalId !== undefined ? (data.nationalId ? data.nationalId.trim() : null) : undefined,
        notes: data.notes !== undefined ? data.notes : undefined,
      },
    });
    await createAuditLog(req.user?.id, req.user?.name, "UPDATE_OWNER", { id, name: data.name });
    res.json(owner);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/owners/:id", authenticateJWT, requireRole(["ADMIN", "MANAGER"]), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.owner.delete({ where: { id } });
    await createAuditLog(req.user?.id, req.user?.name, "DELETE_OWNER", { id });
    res.json({ message: "Owner deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
