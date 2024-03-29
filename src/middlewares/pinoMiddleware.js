import pinoHttp from 'pino-http';
import config from '../configs/index.js';

const pinoMiddleware = pinoHttp({ logger: config.logger });

export default pinoMiddleware;