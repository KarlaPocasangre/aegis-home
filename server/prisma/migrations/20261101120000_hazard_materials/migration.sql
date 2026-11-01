-- Short shopping list for each fix (docs/AI_INTEGRATION.md §4.2). Existing hazards get none.
ALTER TABLE "Hazard" ADD COLUMN "materialsEs" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
