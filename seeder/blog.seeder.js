import "dotenv/config";
import { connectDB } from "../config/db.js";
import Blog from "../models/blog.model.js";
import User from "../models/user.model.js";
import { slugify } from "../utils/slugify.js";

const posts = [
  {
    title: "5 Ways a CRM Improves Customer Retention",
    content:
      "<p>Retaining existing customers is far cheaper than acquiring new ones. Here are five ways a well-configured CRM helps you keep the customers you already have.</p><h2>1. Centralized customer history</h2><p>Every interaction, ticket, and purchase lives in one place, so your team never has to ask a customer to repeat themselves.</p><h2>2. Proactive follow-ups</h2><p>Automated reminders make sure no renewal or check-in ever slips through the cracks.</p>",
    metaTitle: "5 Ways a CRM Improves Customer Retention | CRM-admin",
    metaDescription: "Learn five practical ways a CRM system helps you retain more customers and reduce churn.",
    metaKeywords: ["crm", "customer retention", "customer success"],
    schemaMarkup: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: "5 Ways a CRM Improves Customer Retention",
    },
    status: "published",
  },
  {
    title: "Getting Started with Sales Pipelines",
    content:
      "<p>A clear sales pipeline turns a chaotic list of leads into a predictable revenue engine. This guide walks through setting up your first pipeline stages.</p><h2>Define your stages</h2><p>Keep it simple: New, Qualified, Proposal, Negotiation, Won/Lost.</p><h2>Assign ownership</h2><p>Every deal needs a clear owner responsible for moving it forward.</p>",
    metaTitle: "Getting Started with Sales Pipelines | CRM-admin",
    metaDescription: "A beginner's guide to structuring an effective sales pipeline in your CRM.",
    metaKeywords: ["sales pipeline", "crm setup", "sales process"],
    schemaMarkup: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: "Getting Started with Sales Pipelines",
    },
    status: "published",
  },
  {
    title: "Automating Follow-Up Emails Without Sounding Robotic",
    content:
      "<p>Automation should save time, not make your outreach feel cold. Here's how to automate follow-ups that still sound like you.</p><p>Use merge fields sparingly, write in your natural voice, and always leave room for a personal note before sending.</p>",
    metaTitle: "Automating Follow-Up Emails Without Sounding Robotic | CRM-admin",
    metaDescription: "Tips for setting up automated email follow-ups that still feel personal.",
    metaKeywords: ["email automation", "follow-up", "sales emails"],
    schemaMarkup: null,
    status: "draft",
  },
  {
    title: "Understanding Lead Scoring",
    content:
      "<p>Lead scoring helps your team focus on the prospects most likely to convert. This post breaks down how to build a scoring model from scratch.</p><h2>Demographic fit</h2><p>Company size, industry, and role all factor into fit scoring.</p><h2>Behavioral signals</h2><p>Email opens, page visits, and demo requests indicate intent.</p>",
    metaTitle: "Understanding Lead Scoring | CRM-admin",
    metaDescription: "A practical introduction to building a lead scoring model for your sales team.",
    metaKeywords: ["lead scoring", "sales qualification", "crm"],
    schemaMarkup: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: "Understanding Lead Scoring",
    },
    status: "published",
  },
];

const seedBlogs = async () => {
  try {
    await connectDB();

    const admin = await User.findOne({ role: "admin" });
    if (!admin) {
      console.error("No admin user found. Run `npm run seed:admin` first.");
      process.exit(1);
    }

    for (const post of posts) {
      const slug = slugify(post.title);
      const exists = await Blog.findOne({ slug });
      if (exists) {
        console.log(`Skipped (already exists): ${post.title}`);
        continue;
      }

      await Blog.create({
        ...post,
        slug,
        publishedAt: post.status === "published" ? new Date() : null,
        author: admin._id,
      });
      console.log(`Created: ${post.title} [${post.status}]`);
    }

    process.exit(0);
  } catch (err) {
    console.error("Error seeding blogs:", err);
    process.exit(1);
  }
};

seedBlogs();
