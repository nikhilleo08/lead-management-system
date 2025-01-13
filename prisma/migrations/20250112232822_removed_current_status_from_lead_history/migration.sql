-- CreateIndex
CREATE INDEX "Lead_updatedAt_lastActionAt_idx" ON "public"."Lead"("updatedAt", "lastActionAt");

-- CreateIndex
CREATE INDEX "LeadHistory_leadId_updatedById_performedAt_idx" ON "public"."LeadHistory"("leadId", "updatedById", "performedAt");
