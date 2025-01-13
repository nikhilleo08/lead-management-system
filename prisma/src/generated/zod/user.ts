import * as z from "zod"
import { Role } from "../client"
import { CompleteLeadHistory, RelatedLeadHistorySchema } from "./index"

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.nativeEnum(Role),
  createdAt: z.date(),
})

export interface CompleteUser extends z.infer<typeof UserSchema> {
  updates: CompleteLeadHistory[]
}

/**
 * RelatedUserSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedUserSchema: z.ZodSchema<CompleteUser> = z.lazy(() => UserSchema.extend({
  updates: RelatedLeadHistorySchema.array(),
}))
