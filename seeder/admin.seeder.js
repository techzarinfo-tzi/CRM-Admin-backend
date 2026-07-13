import "dotenv/config";
import { connectDB } from "../config/db.js";
import User from "../models/user.model.js";

const seedAdmin = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
    process.exit(1);
  }

  try {
    await connectDB();

    const existing = await User.findOne({ email }).select("+password");

    if (existing) {
      existing.password = password;
      existing.role = "admin";
      await existing.save();
      console.log(`Admin user updated: ${email}`);
    } else {
      await User.create({
        name: "Admin",
        email,
        password,
        role: "admin",
      });
      console.log(`Admin user created: ${email}`);
    }

    process.exit(0);
  } catch (err) {
    console.error("Error seeding admin:", err);
    process.exit(1);
  }
};

seedAdmin();
