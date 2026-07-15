import nodemailer from "nodemailer";

let transporter = null;

const getTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
};

export const sendLeadNotification = async (lead) => {
  const notifyTo = process.env.LEAD_NOTIFY_EMAIL;
  const mailer = getTransporter();

  if (!mailer || !notifyTo) {
    console.warn("EMAIL_USER/EMAIL_PASS/LEAD_NOTIFY_EMAIL not fully configured. Skipping lead notification email.");
    return;
  }

  try {
    await mailer.sendMail({
      from: process.env.EMAIL_USER,
      to: notifyTo,
      replyTo: lead.email,
      subject: `New Lead from ${lead.name} via CRM Landing Page`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${lead.name}</p>
        <p><strong>Email:</strong> ${lead.email}</p>
        <p><strong>Phone:</strong> ${lead.phone}</p>
        <p><strong>Country:</strong> ${lead.country || "-"}</p>
        <p><strong>Requirements:</strong><br/>${lead.requirements}</p>
      `,
    });
  } catch (err) {
    console.error("Failed to send lead notification email:", err.message);
  }
};

// Unlike the lead notification (best-effort, fire-and-forget), a failed
// password-reset email must surface to the admin instead of failing silently
// — otherwise they're left with no way to know the reset link never arrived.
export const sendPasswordResetEmail = async (user, resetUrl) => {
  const mailer = getTransporter();
  if (!mailer) {
    throw new Error("Email is not configured (EMAIL_USER/EMAIL_PASS missing)");
  }

  await mailer.sendMail({
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Reset your CRM Admin password",
    html: `
      <h2>Reset your password</h2>
      <p>We received a request to reset the password for your CRM Admin account.</p>
      <p><a href="${resetUrl}">Click here to set a new password</a>. This link expires in 30 minutes.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  });
};
