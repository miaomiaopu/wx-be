import logger from "../configs/logger.js";
import { Data } from "../models/index.js";

const setTodayToZero = async () => {
  await Data.update(
    { today_study: 0, today_review: 0, today_duration: 0 },
    { where: {} }
  ).then(() => {
    logger.info("Set today datas to zero");
  });
};

export default setTodayToZero;
