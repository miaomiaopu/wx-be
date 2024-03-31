import logger from "../configs/logger.js";

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  logger.error(statusCode + message);

  res.status(statusCode).json({
    error: {
      message: message,
    },
  });
};

export default errorHandler;
