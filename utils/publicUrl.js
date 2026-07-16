const trimTrailingSlash = (v) => (v || "").replace(/\/+$/, "");

// Canonical public site the blog lives on (the Next.js site), used to build
// mainEntityOfPage.@id in the generated schema.
const SITE_URL = trimTrailingSlash(process.env.SITE_URL) || "https://www.techzarinfo.com";
const BLOG_PATH_PREFIX = process.env.BLOG_PATH_PREFIX || "/blogs";

// This backend's own public origin, used to turn stored relative asset paths
// (e.g. "/uploads/blogs/xxx.jpg") into absolute URLs. Falls back to the
// request's own protocol/host when not explicitly configured.
const BACKEND_PUBLIC_URL = trimTrailingSlash(process.env.BACKEND_PUBLIC_URL);

export const blogCanonicalUrl = (slug) => `${SITE_URL}${BLOG_PATH_PREFIX}/${slug}`;

export const toAbsoluteAssetUrl = (assetPath, req) => {
  if (!assetPath) return "";
  if (/^https?:\/\//i.test(assetPath)) return assetPath;
  const origin = BACKEND_PUBLIC_URL || (req ? `${req.protocol}://${req.get("host")}` : "");
  return `${origin}${assetPath}`;
};
