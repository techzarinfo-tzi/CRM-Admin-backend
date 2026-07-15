import { Router } from "express";
import { createLead, listLeads, updateLeadStatus, deleteLead } from "../controllers/lead.controller.js";
import { protect, adminOnly } from "../middlewares/auth.middleware.js";

const router = Router();

// Public
router.post("/", createLead);

// Admin
router.get("/admin/all", protect, adminOnly, listLeads);
router.patch("/admin/:id/status", protect, adminOnly, updateLeadStatus);
router.delete("/admin/:id", protect, adminOnly, deleteLead);

export default router;
