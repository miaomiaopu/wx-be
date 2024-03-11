// config/index.js

import databaseConfig from "./database.js";
import redisConfig from "./redis.js";
import logger from "./logger.js";

const config = {
  database: databaseConfig,
  redis: redisConfig,
  logger,
};

export default config;
