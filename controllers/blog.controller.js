import fs from "fs";
import path from "path";
import Blog from "../models/blog.model.js";
import { slugify } from "../utils/slugify.js";
import { uploadDir } from "../middlewares/upload.middleware.js";
import { buildBlogSchemaMarkup } from "../utils/blogSchema.js";

const withSchemaMarkup = (blog, req) => ({
  ...blog.toObject(),
  schemaMarkup: buildBlogSchemaMarkup(blog, req),
});

const deleteImageFile = (imagePath) => {
  if (!imagePath) return;
  const filePath = path.join(uploadDir, path.basename(imagePath));
  fs.unlink(filePath, () => {});
};

const parseKeywords = (value) => {
  if (Array.isArray(value)) return value.map((k) => k.trim()).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
  }
  return [];
};

// MongoDB's hard per-document limit is 16MB (BSON). This keeps content safely
// under that ceiling so oversized posts fail with a clean error instead of
// crashing the BSON serializer.
const MAX_CONTENT_BYTES = 14 * 1024 * 1024;

const assertContentSize = (content) => {
  if (content && Buffer.byteLength(content, "utf8") > MAX_CONTENT_BYTES) {
    const err = new Error("Blog content is too large (max ~14MB)");
    err.statusCode = 413;
    throw err;
  }
};

export const uploadImage = (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image uploaded" });
  res.status(201).json({ url: `/uploads/blogs/${req.file.filename}` });
};

export const createBlog = async (req, res, next) => {
  try {
    const { title, content, metaTitle, metaDescription, status, featuredImage } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "title and content are required" });
    }

    assertContentSize(content);

    const slug = req.body.slug ? slugify(req.body.slug) : slugify(title);

    const existing = await Blog.findOne({ slug });
    if (existing) {
      return res.status(409).json({ message: "Slug already in use" });
    }

    const resolvedStatus = status === "published" ? "published" : "draft";

    const blog = await Blog.create({
      title,
      slug,
      content,
      metaTitle,
      metaDescription,
      metaKeywords: parseKeywords(req.body.metaKeywords),
      featuredImage: featuredImage || "",
      status: resolvedStatus,
      publishedAt: resolvedStatus === "published" ? new Date() : null,
      author: req.userId,
    });

    res.status(201).json({ blog: withSchemaMarkup(blog, req) });
  } catch (err) {
    next(err);
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const { title, content, metaTitle, metaDescription, status } = req.body;

    assertContentSize(content);

    if (req.body.slug || title) {
      const nextSlug = slugify(req.body.slug || title);
      if (nextSlug !== blog.slug) {
        const existing = await Blog.findOne({ slug: nextSlug, _id: { $ne: blog._id } });
        if (existing) {
          return res.status(409).json({ message: "Slug already in use" });
        }
        blog.slug = nextSlug;
      }
    }

    if (title !== undefined) blog.title = title;
    if (content !== undefined) blog.content = content;
    if (metaTitle !== undefined) blog.metaTitle = metaTitle;
    if (metaDescription !== undefined) blog.metaDescription = metaDescription;
    if (req.body.metaKeywords !== undefined) blog.metaKeywords = parseKeywords(req.body.metaKeywords);

    if (req.body.featuredImage !== undefined && req.body.featuredImage !== blog.featuredImage) {
      deleteImageFile(blog.featuredImage);
      blog.featuredImage = req.body.featuredImage;
    }

    if (status && status !== blog.status) {
      blog.status = status;
      blog.publishedAt = status === "published" ? new Date() : null;
    }

    await blog.save();
    res.status(200).json({ blog: withSchemaMarkup(blog, req) });
  } catch (err) {
    next(err);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    deleteImageFile(blog.featuredImage);
    res.status(200).json({ message: "Blog deleted" });
  } catch (err) {
    next(err);
  }
};

export const toggleBlogStatus = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    blog.status = blog.status === "published" ? "draft" : "published";
    blog.publishedAt = blog.status === "published" ? new Date() : null;
    await blog.save();

    res.status(200).json({ blog });
  } catch (err) {
    next(err);
  }
};

export const getAdminBlogById = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.status(200).json({ blog: withSchemaMarkup(blog, req) });
  } catch (err) {
    next(err);
  }
};

export const listAdminBlogs = async (req, res, next) => {
  try {
    const { search = "", sort = "latest", status, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (search) filter.title = { $regex: search, $options: "i" };
    if (status && ["draft", "published"].includes(status)) filter.status = status;

    const sortOption = sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .sort(sortOption)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Blog.countDocuments(filter),
    ]);

    res.status(200).json({
      blogs,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
};

export const listPublicBlogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);

    const filter = { status: "published" };

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .select("title slug featuredImage metaDescription publishedAt createdAt")
        .sort({ publishedAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Blog.countDocuments(filter),
    ]);

    res.status(200).json({
      blogs,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
};

export const getPublicBlogBySlug = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, status: "published" });
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.status(200).json({ blog: withSchemaMarkup(blog, req) });
  } catch (err) {
    next(err);
  }
};
