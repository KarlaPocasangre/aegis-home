-- Language the hazard text was written in (es | pt | en). Existing rooms are Spanish.
ALTER TABLE "Room" ADD COLUMN "language" TEXT NOT NULL DEFAULT 'es';
