const path = require("path");
const multer = require("multer");

const MAX_FILES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function fileFilter(req, file, callback) {
  const extension = path.extname(file.originalname).toLowerCase();
  if (![".txt", ".md", ".markdown"].includes(extension)) {
    const error = new Error("Only .txt, .md, and .markdown files are allowed");
    error.status = 415;
    callback(error);
    return;
  }

  callback(null, true);
}

const parseNovelFiles = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
    fields: 10,
    parts: MAX_FILES + 10,
  },
  fileFilter,
}).array("files", MAX_FILES);

function uploadNovels(req, res, next) {
  parseNovelFiles(req, res, (error) => {
    if (error) {
      if (error instanceof multer.MulterError) {
        error.status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
        error.message = error.code === "LIMIT_FILE_SIZE" ? "Each file must be 5 MB or smaller" : "Upload exceeds the allowed file or field count";
      }
      next(error);
      return;
    }

    const hasInvalidText = (req.files || []).some((file) => {
      const text = file.buffer.toString("utf8");
      return (
        text.includes("\0") || !Buffer.from(text, "utf8").equals(file.buffer)
      );
    });

    if (hasInvalidText) {
      const invalidTextError = new Error("Uploaded files must contain UTF-8 text");
      invalidTextError.status = 415;
      next(invalidTextError);
      return;
    }

    next();
  });
}

module.exports = { uploadNovels, fileFilter, MAX_FILES, MAX_FILE_SIZE };
