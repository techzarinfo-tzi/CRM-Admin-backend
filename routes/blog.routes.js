import { Router } from "express";
import {
  createBlog,
  updateBlog,
  deleteBlog,
  toggleBlogStatus,
  getAdminBlogById,
  listAdminBlogs,
  listPublicBlogs,
  getPublicBlogBySlug,
  uploadImage,
} from "../controllers/blog.controller.js";
import { protect, adminOnly } from "../middlewares/auth.middleware.js";
import { uploadBlogImage } from "../middlewares/upload.middleware.js";

const router = Router();

// Public
router.get("/", listPublicBlogs);
router.get("/:slug", getPublicBlogBySlug);

// Admin
router.get("/admin/all", protect, adminOnly, listAdminBlogs);
router.get("/admin/:id", protect, adminOnly, getAdminBlogById);
router.post("/admin/upload-image", protect, adminOnly, uploadBlogImage.single("featuredImage"), uploadImage);
router.post("/admin", protect, adminOnly, createBlog);
router.put("/admin/:id", protect, adminOnly, updateBlog);
router.patch("/admin/:id/status", protect, adminOnly, toggleBlogStatus);
router.delete("/admin/:id", protect, adminOnly, deleteBlog);

export default router;
