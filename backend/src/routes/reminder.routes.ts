import { Router, Request, Response } from "express";
import { authenticateJWT, AuthRequest } from "../middleware/auth";
import { prisma } from "../utils/audit";

const router = Router();

router.get("/reminders", authenticateJWT, async (req: Request, res: Response) => {
  try {
    const reminders = await prisma.reminder.findMany({
      include: { client: true, user: true },
      orderBy: { time: "asc" },
    });
    res.json(reminders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/reminders", authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;
    const reminder = await prisma.reminder.create({
      data: {
        title: data.title,
        description: data.description,
        time: new Date(data.time),
        status: "PENDING",
        clientId: data.clientId || null,
        userId: req.user?.id || "",
      },
    });
    res.status(201).json(reminder);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/reminders/:id", authenticateJWT, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const data = req.body;
    const reminder = await prisma.reminder.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        time: data.time ? new Date(data.time) : undefined,
        status: data.status,
        clientId: data.clientId || null,
      },
    });
    res.json(reminder);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/reminders/:id", authenticateJWT, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.reminder.delete({ where: { id } });
    res.json({ message: "Reminder deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
