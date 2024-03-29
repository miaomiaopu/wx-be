import pinoHttp from 'pino-http';
import logger from '../configs/logger.js';

const pinoMiddleware = pinoHttp({ logger: logger });

export default pinoMiddleware;