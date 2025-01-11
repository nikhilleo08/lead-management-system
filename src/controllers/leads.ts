import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { LeadService } from "../service/leadService";
import { fromError } from "zod-validation-error";

// Define Zod schemas for validation
const CreateLeadSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
});

// Define a Zod schema for the query parameters
const paginationSchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, "Page must be a positive integer")
    .transform((value) => parseInt(value, 10))
    .default("1"),
  limit: z
    .string()
    .regex(/^\d+$/, "Limit must be a positive integer")
    .transform((value) => parseInt(value, 10))
    .default("10"),
});

const UpdateLeadSchema = z.object({
  name: z.string().optional(),
  status: z
    .enum(["NEW", "REQUIRES_FOLLOWUP", "IN_PROGRESS", "STALE", "CLOSED"])
    .optional(),
  lastAction: z.string().optional(),
  reason: z.string().optional(),
  nextFollowUp: z.date().optional(),
});

const LeadIdSchema = z.object({
  id: z.string().uuid({ message: "Invalid lead ID format" }),
});

export class LeadController {
  private leadService: LeadService;

  constructor() {
    this.leadService = new LeadService();
  }

  public createLead = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const parsedBody = CreateLeadSchema.parse(req.body);
      // @ts-ignore
      const userId = req.user?.id || "defaultUserId";
      const lead = await this.leadService.createLead(parsedBody.name, userId);
      res.status(201).json({ success: true, data: lead });
    } catch (error) {
      if (error instanceof z.ZodError) {
        next({
          status: 400,
          message: fromError(error).toString(),
        });
      } else {
        next({
          status: 400,
          message: "Error creating lead",
          error: error.message,
        });
      }
    }
  };

  public getLeads = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Validate the query parameters
      const { page, limit } = paginationSchema.parse(req.query);

      const leadService = new LeadService();
      const leads = await leadService.getLeads(page, limit);
      res.status(200).json({ success: true, data: leads });
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Send validation errors to the client
        next({
          status: 400,
          message: "Error fetching leads",
          error: error.message,
        });
      } else {
        // Handle other errors
        next({
          status: 400,
          message: "Error fetching leads",
          error: error.message,
        });
      }
    }
  };

  public getLeadById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const parsedParams = LeadIdSchema.parse(req.params);
      const lead = await this.leadService.getLeadById(parsedParams.id);
      if (!lead) {
        next({ status: 404, message: "Lead not found" });
        return;
      }
      res.status(200).json({ success: true, data: lead });
    } catch (error) {
      if (error instanceof z.ZodError) {
        next({
          status: 400,
          message: fromError(error).toString(),
        });
      } else {
        next({
          status: 400,
          message: "Error fetching lead",
          error: error.message,
        });
      }
    }
  };

  public updateLead = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const parsedParams = LeadIdSchema.parse(req.params);
      const parsedBody = UpdateLeadSchema.parse(req.body);

      if (!Object.keys(parsedBody).length) {
        next({ status: 400, message: "Update data is required" });
        return;
      }

      const updatedLead = await this.leadService.updateLead(
        parsedParams.id,
        parsedBody
      );
      res.status(200).json({ success: true, data: updatedLead });
    } catch (error) {
      if (error instanceof z.ZodError) {
        next({
          status: 400,
          message: fromError(error).toString(),
        });
      } else {
        next({
          status: 400,
          message: "Error updating lead",
          error: error.message,
        });
      }
    }
  };
}
