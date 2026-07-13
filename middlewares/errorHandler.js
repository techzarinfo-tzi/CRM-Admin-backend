export const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

const multerMessages = {
  LIMIT_FILE_SIZE: "Image must be 5MB or smaller",
  LIMIT_FIELD_VALUE: "Blog content is too large",
};

export const errorHandler = (err, req, res, next) => {
  console.error(err);
  const isMulterError = err.name === "MulterError";
  const statusCode = err.statusCode || (isMulterError ? 400 : 500);
  const message = (isMulterError && multerMessages[err.code]) || err.message || "Internal Server Error";
  res.status(statusCode).json({ message });
};
