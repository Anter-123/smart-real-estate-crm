import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

// Route Modules
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import uploadRoutes from "./routes/upload.routes";
import propertyRoutes from "./routes/property.routes";
import ownerRoutes from "./routes/owner.routes";
import clientRoutes from "./routes/client.routes";
import brokerRoutes from "./routes/broker.routes";
import dealRoutes from "./routes/deal.routes";
import reminderRoutes from "./routes/reminder.routes";
import matchingRoutes from "./routes/matching.routes";
import whatsappRoutes from "./routes/whatsapp.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import auditRoutes from "./routes/audit.routes";

// Initialize environment
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Register All API Route Modules
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", uploadRoutes);
app.use("/api", propertyRoutes);
app.use("/api", ownerRoutes);
app.use("/api", clientRoutes);
app.use("/api", brokerRoutes);
app.use("/api", dealRoutes);
app.use("/api", reminderRoutes);
app.use("/api", matchingRoutes);
app.use("/api", whatsappRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", auditRoutes);

// ----------------------------------------------------
// SWAGGER API DOCUMENTATION
// ----------------------------------------------------
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Smart Real Estate CRM API",
      version: "1.0.0",
      description: "REST API Documentation for the Smart Real Estate CRM System",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: "Local Development Server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: [__filename], // Swagger JSDoc scans annotations in this file
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Swagger annotations
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in to the system
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */

// Start Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`API Documentation available at http://localhost:${port}/api-docs`);
});
