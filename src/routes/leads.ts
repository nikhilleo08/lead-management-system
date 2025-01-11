import express from "express";
import { LeadController } from "../controllers/leads";
import { authenticateToken } from "../helpers/authMiddleware";

const lead = express.Router();
const leadController = new LeadController();

lead.post("/", leadController.createLead);
lead.get("/", leadController.getLeads);
lead.get("/:id", leadController.getLeadById);
lead.put("/:id", leadController.updateLead);

export default lead;
