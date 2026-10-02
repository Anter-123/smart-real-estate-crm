import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { authenticateJWT, requireRole, AuthRequest } from "../middleware/auth";
import { createAuditLog, prisma } from "../utils/audit";

const router = Router();

router.get("/users", authenticateJWT, requireRole(["ADMIN"]), async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        permissions: true,
        createdAt: true,
        _count: { select: { properties: true, clients: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/users", authenticateJWT, requireRole(["ADMIN"]), async (req: AuthRequest, res: Response) => {
  const { email, password, name, role, phone, permissions } = req.body;
  try {
    if (!email || !password || !name || !role) {
      return res.status(400).json({ message: "Name, email, password and role are required" });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "البريد الإلكتروني مسجل بالفعل لمستخدم آخر" });
    }

    if (phone && phone.trim()) {
      const existingPhone = await prisma.user.findFirst({ where: { phone: phone.trim() } });
      if (existingPhone) {
        return res.status(400).json({ message: "رقم الهاتف مسجل بالفعل لمستخدم آخر" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        name: name.trim(),
        role: role.toUpperCase(),
        phone: phone ? phone.trim() : null,
        permissions: Array.isArray(permissions) ? JSON.stringify(permissions) : permissions || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        permissions: true,
        createdAt: true,
      },
    });

    await createAuditLog(req.user?.id, req.user?.name, "CREATE_USER", { userId: newUser.id, name, email, role });
    res.status(201).json(newUser);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/users/:id", authenticateJWT, requireRole(["ADMIN"]), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { email, password, name, role, phone, permissions } = req.body;
  try {
    if (email) {
      const existing = await prisma.user.findFirst({ where: { email: email.trim().toLowerCase(), NOT: { id } } });
      if (existing) {
        return res.status(400).json({ message: "البريد الإلكتروني مسجل بالفعل لمستخدم آخر" });
      }
    }
    if (phone && phone.trim()) {
      const existingPhone = await prisma.user.findFirst({ where: { phone: phone.trim(), NOT: { id } } });
      if (existingPhone) {
        return res.status(400).json({ message: "رقم الهاتف مسجل بالفعل لمستخدم آخر" });
      }
    }

    const dataToUpdate: any = {};
    if (email) dataToUpdate.email = email.trim().toLowerCase();
    if (name) dataToUpdate.name = name.trim();
    if (role) dataToUpdate.role = role.toUpperCase();
    if (phone !== undefined) dataToUpdate.phone = phone ? phone.trim() : null;
    if (permissions !== undefined) {
      dataToUpdate.permissions = Array.isArray(permissions) ? JSON.stringify(permissions) : permissions;
    }
    if (password && password.trim() !== "") {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        permissions: true,
        createdAt: true,
      },
    });

    await createAuditLog(req.user?.id, req.user?.name, "UPDATE_USER", { userId: id, name: updatedUser.name, role: updatedUser.role });
    res.json(updatedUser);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/users/:id", authenticateJWT, requireRole(["ADMIN"]), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    if (req.user?.id === id) {
      return res.status(400).json({ message: "You cannot delete your own admin account" });
    }

    const userToDelete = await prisma.user.findUnique({ where: { id } });
    if (!userToDelete) {
      return res.status(404).json({ message: "User not found" });
    }

    await prisma.user.delete({ where: { id } });
    await createAuditLog(req.user?.id, req.user?.name, "DELETE_USER", { userId: id, name: userToDelete.name });
    res.json({ message: "User deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
