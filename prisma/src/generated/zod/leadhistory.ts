import * as z from "zod"
import { Status } from "../client"
import { CompleteLead, RelatedLeadSchema, CompleteUser, RelatedUserSchema } from "./index"

export const LeadHistorySchema = z.object({
  id: z.string(),
  leadId: z.string(),
  previousStatus: z.nativeEnum(Status),
  actionDescription: z.string(),
  performedAt: z.date(),
  reason: z.string().nullish(),
  updatedById: z.string().nullish(),
})

export interface CompleteLeadHistory extends z.infer<typeof LeadHistorySchema> {
  lead: CompleteLead
  updatedBy?: CompleteUser | null
}

/**
 * RelatedLeadHistorySchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedLeadHistorySchema: z.ZodSchema<CompleteLeadHistory> = z.lazy(() => LeadHistorySchema.extend({
  lead: RelatedLeadSchema,
  updatedBy: RelatedUserSchema.nullish(),
}))
