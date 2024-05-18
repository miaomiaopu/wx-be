import express from "express";
import {
  getThemeRanking,
  getUserRanking,
} from "../controllers/rankingController.js";

const rankingRouter = express.Router();

rankingRouter.get("/getUserRanking", getUserRanking);
rankingRouter.get("/getThemeRanking", getThemeRanking);

export default rankingRouter;
