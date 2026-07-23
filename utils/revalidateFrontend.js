// Best-effort, fire-and-forget: notifies the landing page right after a blog
// mutation so its cached blog listing/detail/sitemap pages update immediately
// instead of waiting out their time-based revalidation window. A failure here
// must never fail the admin request — the pages still self-heal on their own
// revalidate interval.
export const revalidateBlogPages = (slugs = []) => {
  const frontendUrl = process.env.FRONTEND_URL;
  const secret = process.env.REVALIDATE_SECRET;

  if (!frontendUrl || !secret) {
    console.warn("FRONTEND_URL/REVALIDATE_SECRET not configured. Skipping frontend revalidation.");
    return;
  }

  fetch(`${frontendUrl}/api/revalidate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-revalidate-secret": secret,
    },
    body: JSON.stringify({ slugs: slugs.filter(Boolean) }),
  }).catch((err) => {
    console.error("Failed to revalidate frontend blog pages:", err.message);
  });
};
