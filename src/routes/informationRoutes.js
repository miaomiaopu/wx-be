import express from "express";
import {
  getInfoDot,
  getInformations,
  handleAllInformations,
  handleInformation,
} from "../controllers/informationController.js";

const informationRouter = express.Router();

informationRouter.get("/getInformations", getInformations);
informationRouter.post("/handleInformation", handleInformation);
informationRouter.post("/handleAllInformations", handleAllInformations);
informationRouter.get("/getInfoDot", getInfoDot)

export default informationRouter;
