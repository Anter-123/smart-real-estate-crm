import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Logging helper
export async function createAuditLog(userId: string | undefined, userName: string | undefined, action: string, details: object) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        userName: userName || null,
        action,
        details: JSON.stringify(details),
      },
    });
  } catch (e) {
    console.error("Failed to write audit log:", e);
  }
}

export { prisma };
