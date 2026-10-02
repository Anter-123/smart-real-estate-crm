import { Router, Request, Response } from "express";
import { authenticateJWT, requireRole } from "../middleware/auth";
import { prisma } from "../utils/audit";

const router = Router();

router.get("/audit-logs", authenticateJWT, async (req: any, res: Response) => {
  try {
    const isAgent = req.user?.role === "AGENT";
    const where = isAgent ? { userId: req.user.id } : {};
    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
