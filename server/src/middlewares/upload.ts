import type { RequestHandler } from "express";
import multer from "multer";
import { HttpError } from "../lib/httpError.js";
import { ALLOWED_IMAGE_MIME, MAX_UPLOAD_BYTES } from "../lib/imagePipeline.js";

// Memory storage only: photos never touch disk (docs/SECURITY.md §1).
const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1, fields: 4, fieldSize: 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_MIME.has(file.mimetype)) cb(null, true);
    else cb(new HttpError("UNSUPPORTED_MEDIA_TYPE"));
  },
}).single("image");

export const uploadImage: RequestHandler = (req, res, next) => {
  multerUpload(req, res, (err: unknown) => {
    if (!err) return next();
    if (err instanceof HttpError) return next(err);
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return next(new HttpError("PAYLOAD_TOO_LARGE"));
    }
    next(new HttpError("BAD_REQUEST"));
  });
};
