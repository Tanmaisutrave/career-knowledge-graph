import express from "express";
import cors from "cors";

import userRoutes from "./routes/userRoutes.js";
import skillRoutes from "./routes/skillRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Health check ──────────────────────────────────────────────
app.get("/", (_req, res) => res.json({ message: "Wexa Graph API Running 🚀", status: "ok" }));

// ── API Routes ────────────────────────────────────────────────
app.use("/api/users",           userRoutes);
app.use("/api/skills",          skillRoutes);
app.use("/api/projects",        projectRoutes);
app.use("/api/companies",       companyRoutes);
app.use("/api/jobs",            jobRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/analytics",      analyticsRoutes);

// ── Error Handling ────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
