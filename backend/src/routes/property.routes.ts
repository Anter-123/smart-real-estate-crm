import { Router, Request, Response } from "express";
import { authenticateJWT, requireRole, AuthRequest } from "../middleware/auth";
import { createAuditLog, prisma } from "../utils/audit";

const router = Router();

router.get("/properties", authenticateJWT, async (req: Request, res: Response) => {
  try {
    const properties = await prisma.property.findMany({
      include: { agent: true, owner: true, broker: true },
      orderBy: { dateAdded: "desc" },
    });
    res.json(properties);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/properties", authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;

    if (!data.address || !data.ownerId || !data.price || !data.area) {
      return res.status(400).json({ message: "العنوان، المالك، السعر والمساحة حقول مطلوبة" });
    }

    // Check duplicate property for same owner & address
    const existingProp = await prisma.property.findFirst({
      where: {
        address: data.address.trim(),
        ownerId: data.ownerId,
        type: data.type,
        floorNumber: data.floorNumber ? Number(data.floorNumber) : null,
      },
    });
    if (existingProp) {
      return res.status(400).json({ message: `هذا العقار مسجل بالفعل بنفس العنوان والمالك (كود العقار: ${existingProp.propertyId})` });
    }
    
    // Auto-generate Property ID
    const count = await prisma.property.count();
    const propertyId = `PROP-${1000 + count + 1}`;

    const property = await prisma.property.create({
      data: {
        propertyId,
        type: data.type,
        listingType: data.listingType,
        address: data.address,
        area: Number(data.area),
        bedrooms: data.bedrooms ? Number(data.bedrooms) : null,
        bathrooms: data.bathrooms ? Number(data.bathrooms) : null,
        floorNumber: data.floorNumber ? Number(data.floorNumber) : null,
        finishing: data.finishing,
        furnished: Boolean(data.furnished),
        price: Number(data.price),
        images: JSON.stringify(data.images || []),
        videos: data.videos ? JSON.stringify(data.videos) : null,
        description: data.description,
        status: "AVAILABLE",
        notes: data.notes,
        agentId: data.agentId || req.user?.id,
        ownerId: data.ownerId,
        brokerId: data.brokerId || null,
      },
    });

    await createAuditLog(req.user?.id, req.user?.name, "CREATE_PROPERTY", { propertyId, type: data.type });
    res.status(201).json(property);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/properties/:id", authenticateJWT, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const data = req.body;
    const property = await prisma.property.update({
      where: { id },
      data: {
        type: data.type,
        listingType: data.listingType,
        address: data.address,
        area: Number(data.area),
        bedrooms: data.bedrooms ? Number(data.bedrooms) : null,
        bathrooms: data.bathrooms ? Number(data.bathrooms) : null,
        floorNumber: data.floorNumber ? Number(data.floorNumber) : null,
        finishing: data.finishing,
        furnished: Boolean(data.furnished),
        price: Number(data.price),
        images: JSON.stringify(data.images || []),
        description: data.description,
        status: data.status,
        notes: data.notes,
        agentId: data.agentId || null,
        ownerId: data.ownerId,
        brokerId: data.brokerId || null,
      },
    });

    await createAuditLog(req.user?.id, req.user?.name, "UPDATE_PROPERTY", { id, propertyId: property.propertyId });
    res.json(property);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/properties/:id", authenticateJWT, requireRole(["ADMIN", "MANAGER"]), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.property.delete({ where: { id } });
    await createAuditLog(req.user?.id, req.user?.name, "DELETE_PROPERTY", { id });
    res.json({ message: "Property deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
