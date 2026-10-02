import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET || "smart-crm-super-secret-key-2026-06";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

// Authentication JWT Middleware
export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, jwtSecret, (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({ message: "Forbidden: Invalid Token" });
      }
      req.user = decoded;
      next();
    });
  } else {
    res.status(401).json({ message: "Unauthorized: Missing Token" });
  }
};

// Role Based Authorization Middleware
export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: Insufficient Permissions" });
    }
    next();
  };
};

export { jwtSecret };
