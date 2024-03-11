// config/logger.js

// 设置日志
import pino from "pino";
import pretty from "pino-pretty";

const logger = pino({
  prettifier: pretty,
});

export default logger;
