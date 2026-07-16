import { blogCanonicalUrl, toAbsoluteAssetUrl } from "./publicUrl.js";

const ORG_NAME = process.env.ORG_NAME || "Techzarinfo";
const ORG_URL = process.env.ORG_URL || "https://www.techzarinfo.com/";
const ORG_LOGO_URL =
  process.env.ORG_LOGO_URL ||
  "https://www.techzarinfo.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FTZI%20Logo-04.966a53cd.png&w=1080&q=75";

const stripHtml = (html) =>
  (html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const buildDescription = (blog) => {
  if (blog.metaDescription) return blog.metaDescription;
  const text = stripHtml(blog.content);
  return text.length > 160 ? `${text.slice(0, 157)}...` : text;
};

// Builds the site's BlogPosting JSON-LD directly from the blog document, so
// it's always structurally valid JSON and always in sync with the post's
// current title/image/dates — there is nothing left for an admin to hand-type
// (and therefore nothing left to get wrong).
export const buildBlogSchemaMarkup = (blog, req) => {
  const publishedAt = blog.publishedAt || blog.createdAt;
  const modifiedAt = blog.updatedAt || publishedAt;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": blogCanonicalUrl(blog.slug),
    },
    Headline: blog.title,
    description: buildDescription(blog),
    image: toAbsoluteAssetUrl(blog.featuredImage, req),
    author: {
      "@type": "Organization",
      name: ORG_NAME,
      url: ORG_URL,
    },
    publisher: {
      "@type": "Organization",
      name: ORG_NAME,
      logo: {
        "@type": "ImageObject",
        url: ORG_LOGO_URL,
      },
    },
    datePublished: new Date(publishedAt).toISOString(),
    dateModified: new Date(modifiedAt).toISOString(),
  };
};
