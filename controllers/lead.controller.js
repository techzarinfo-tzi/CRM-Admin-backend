import Lead from "../models/lead.model.js";
import { sendLeadNotification } from "../utils/mailer.js";
import { emitNewLead } from "../utils/socket.js";

export const createLead = async (req, res, next) => {
  try {
    const { name, email, phone, country, requirements } = req.body;

    if (!name || !email || !phone || !requirements) {
      return res.status(400).json({ message: "name, email, phone and requirements are required" });
    }

    const lead = await Lead.create({ name, email, phone, country, requirements });

    emitNewLead(lead);
    await sendLeadNotification(lead);

    res.status(201).json({ lead });
  } catch (err) {
    next(err);
  }
};

export const listLeads = async (req, res, next) => {
  try {
    const { search = "", status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }
    if (status && ["new", "contacted"].includes(status)) filter.status = status;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Lead.countDocuments(filter),
    ]);

    res.status(200).json({
      leads,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
};

export const updateLeadStatus = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    lead.status = lead.status === "new" ? "contacted" : "new";
    await lead.save();

    res.status(200).json({ lead });
  } catch (err) {
    next(err);
  }
};

export const deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    res.status(200).json({ message: "Lead deleted" });
  } catch (err) {
    next(err);
  }
};
