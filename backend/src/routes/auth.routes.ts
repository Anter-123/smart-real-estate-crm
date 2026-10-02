import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { authenticateJWT, AuthRequest, jwtSecret } from "../middleware/auth";
import { createAuditLog, prisma } from "../utils/audit";

const router = Router();

router.post("/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      jwtSecret,
      { expiresIn: "7d" }
    );

    // Audit Log
    await createAuditLog(user.id, user.name, "USER_LOGIN", { email: user.email });

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role, name: user.name, permissions: user.permissions },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/auth/me", authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      select: { id: true, email: true, name: true, role: true, phone: true, permissions: true },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
