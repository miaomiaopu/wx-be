import { Redis } from "ioredis";

// 设置 RedisPool
const redisConfig = {
  host: "127.0.0.1",
  port: 16379,
  db: 0,
  minIdleTime: 30000,
  maxRetriesPerRequest: 2,
  enableReadyCheck: true,
  autoResubscribe: true,
  lazyConnect: true,
};

const redisPool = new Redis(redisConfig);

export default redisPool;
