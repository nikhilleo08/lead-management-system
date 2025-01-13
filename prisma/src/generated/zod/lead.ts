import * as z from "zod"
import { Status } from "../client"
import { CompleteLeadHistory, RelatedLeadHistorySchema } from "./index"

export const LeadSchema = z.object({
  id: z.string(),
  name: z.string().nullish(),
  status: z.nativeEnum(Status),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastAction: z.string().nullish(),
  lastActionAt: z.date().nullish(),
  reason: z.string().nullish(),
  nextFollowUp: z.date().nullish(),
})

export interface CompleteLead extends z.infer<typeof LeadSchema> {
  histories: CompleteLeadHistory[]
}

/**
 * RelatedLeadSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedLeadSchema: z.ZodSchema<CompleteLead> = z.lazy(() => LeadSchema.extend({
  histories: RelatedLeadHistorySchema.array(),
}))
