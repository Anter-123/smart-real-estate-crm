import { Router, Request, Response } from "express";
import { authenticateJWT } from "../middleware/auth";
import { upload } from "../middleware/upload";

const port = process.env.PORT || 5000;
const router = Router();

router.post("/upload", authenticateJWT, upload.array("images", 10), (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    const fileUrls = files.map((file) => `${baseUrl}/uploads/${file.filename}`);
    res.json({ urls: fileUrls });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to upload image" });
  }
});

export default router;
