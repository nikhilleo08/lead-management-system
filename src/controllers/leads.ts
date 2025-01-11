// // import { Request, Response } from "express";
// // import { LeadService } from "../service/leadService";

// // export class LeadController {
// //   private leadService: LeadService;

// //   constructor() {
// //     this.leadService = new LeadService();
// //   }

// //   public createLead = async (req: Request, res: Response): Promise<void> => {
// //     try {
// //       const { name } = req.body;
// //       if (!name) {
// //         res.status(400).json({ message: "Name is required" });
// //         return;
// //       }
// //       // @ts-ignore
// //       const userId = req.user.id;
// //       const lead = await this.leadService.createLead(name, userId);
// //       res.status(201).json(lead);
// //     } catch (error) {
// //       res.status(400).json({ message: "Error creating lead", error: error.message });
// //     }
// //   };

// //   public getLeads = async (_req: Request, res: Response): Promise<void> => {
// //     try {
// //       const leads = await this.leadService.getLeads();
// //       res.status(200).json(leads);
// //     } catch (error) {
// //       res.status(400).json({ message: "Error fetching leads", error: error.message });
// //     }
// //   };

// //   public getLeadById = async (req: Request, res: Response): Promise<void> => {
// //     try {
// //       const { id } = req.params;
// //       if (!id) {
// //         res.status(400).json({ message: "Lead ID is required" });
// //         return;
// //       }
// //       const lead = await this.leadService.getLeadById(id);
// //       if (!lead) {
// //         res.status(404).json({ message: "Lead not found" });
// //         return;
// //       }
// //       res.status(200).json(lead);
// //     } catch (error) {
// //       res.status(400).json({ message: "Error fetching lead", error: error.message });
// //     }
// //   };

// //   public updateLead = async (req: Request, res: Response): Promise<void> => {
// //     try {
// //       const { id } = req.params;
// //       const data = req.body;
// //       if (!id) {
// //         res.status(400).json({ message: "Lead ID is required" });
// //         return;
// //       }
// //       if (!data || Object.keys(data).length === 0) {
// //         res.status(400).json({ message: "Update data is required" });
// //         return;
// //       }
// //       const updatedLead = await this.leadService.updateLead(id, data);
// //       res.status(200).json(updatedLead);
// //     } catch (error) {
// //       res.status(400).json({ message: "Error updating lead", error: error.message });
// //     }
// //   };
// // }

// import { NextFunction, Request, Response } from "express";
// import { z } from "zod";
// import { LeadService } from "../service/leadService";
// import { fromError } from "zod-validation-error";

// // Define Zod schemas for validation
// const CreateLeadSchema = z.object({
//   name: z.string().min(1, { message: "Name is required" }),
// });

// const UpdateLeadSchema = z.object({
//   name: z.string().optional(),
//   status: z
//     .enum(["NEW", "REQUIRES_FOLLOWUP", "IN_PROGRESS", "STALE", "CLOSED"])
//     .optional(),
//   lastAction: z.string().optional(),
//   reason: z.string().optional(),
//   nextFollowUp: z.date().optional(),
// });

// const LeadIdSchema = z.object({
//   id: z.string().uuid({ message: "Invalid lead ID format" }),
// });

// export class LeadController {
//   private leadService: LeadService;

//   constructor() {
//     this.leadService = new LeadService();
//   }

//   public createLead = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ): Promise<void> => {
//     try {
//       const parsedBody = CreateLeadSchema.parse(req.body);
//       // @ts-ignore
//       const userId = req.user.id;
//       const lead = await this.leadService.createLead(parsedBody.name, userId);
//       res.status(201).json(lead);
//     } catch (error) {
//       if (error instanceof z.ZodError) {
//         const validationError = fromError(error);
//         // the error is now readable by the user
//         // you may print it to console
//         console.log(validationError.toString());
//         // or return it as an actual error
//         next({
//           status: 400,
//           message: validationError.toString(),
//           ...validationError,
//         });
//       } else {
//         next({ status: 400, message: `Error creating lead: ${error.message}` });
//       }
//     }
//   };

//   public getLeads = async (
//     _req: Request,
//     res: Response,
//     next: NextFunction
//   ): Promise<void> => {
//     try {
//       const leads = await this.leadService.getLeads();
//       res.status(200).json(leads);
//     } catch (error) {
//       next({ status: 400, message: `Error fetching leads: ${error.message}` });
//     }
//   };

//   public getLeadById = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ): Promise<void> => {
//     try {
//       const parsedParams = LeadIdSchema.parse(req.params);
//       const lead = await this.leadService.getLeadById(parsedParams.id);
//       if (!lead) {
//         console.log('INSIDE LEAD NOT FOUND');
//         // res.status(404).json({ message: "Lead not found" });
//         throw new Error("Lead not found");
//       }
//       res.status(200).json(lead);
//     } catch (error) {
//       if (error instanceof z.ZodError) {
//         const validationError = fromError(error);
//         // the error is now readable by the user
//         // you may print it to console
//         console.log(validationError.toString());
//         // or return it as an actual error
//         next({
//           status: 400,
//           message: validationError.toString(),
//           ...validationError,
//         });
//       } else {
//         next({
//           status: 400,
//           error: error.message
//         });
//       }
//     }
//   };

//   public updateLead = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ): Promise<void> => {
//     try {
//       const parsedParams = LeadIdSchema.parse(req.params);
//       const parsedBody = UpdateLeadSchema.parse(req.body);

//       if (!Object.keys(parsedBody).length) {
//         throw new Error("Update data is required");
//       }

//       const updatedLead = await this.leadService.updateLead(
//         parsedParams.id,
//         parsedBody
//       );
//       res.status(200).json(updatedLead);
//     } catch (error) {
//       if (error instanceof z.ZodError) {
//         const validationError = fromError(error);
//         // the error is now readable by the user
//         // you may print it to console
//         console.log(validationError.toString());
//         // or return it as an actual error
//         next({
//           status: 400,
//           message: validationError.toString(),
//           ...validationError,
//         });
//       } else {
//         next({ status: 400, error: error.message });
//         // res
//         //   .status(400)
//         //   .json({ message: "Error updating lead", error: error.message });
//       }
//     }
//   };
// }
import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { LeadService } from "../service/leadService";
import { fromError } from "zod-validation-error";

// Define Zod schemas for validation
const CreateLeadSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
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
          status: 500,
          message: "Error creating lead",
          error: error.message,
        });
      }
    }
  };

  public getLeads = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const leads = await this.leadService.getLeads();
      res.status(200).json({ success: true, data: leads });
    } catch (error) {
      next({
        status: 500,
        message: "Error fetching leads",
        error: error.message,
      });
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
          status: 500,
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
          status: 500,
          message: "Error updating lead",
          error: error.message,
        });
      }
    }
  };
}
