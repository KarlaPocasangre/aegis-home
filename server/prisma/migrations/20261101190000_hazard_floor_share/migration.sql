-- Share of the visible floor a hazard covers (docs/AI_INTEGRATION.md §6.1). Existing hazards get none.
ALTER TABLE "Hazard" ADD COLUMN "floorShare" DOUBLE PRECISION;
