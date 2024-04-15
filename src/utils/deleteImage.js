import { fileURLToPath } from "url";
import { dirname, join, basename } from "path";
import fs from "fs";
import logger from "../configs/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const directory = join(__dirname, "..", "public", "images");

const deleteImage = (imageUrl) => {
  const fileName = basename(imageUrl);
  if (fileName !== "default-image.jpg") {
    // 删除文件
    const filePath = join(directory, fileName);
    fs.unlink(filePath, (err) => {
      if (err) {
        logger.error(`Error deleting file ${fileName}: ${err}`);
      } else {
        logger.info(`${fileName} deleted`);
      }
    });
  }
};

export default deleteImage;
