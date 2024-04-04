import express from "express";
import {
  getDataListWithThirdSession,
  getCheckinWithThirdSession,
} from "../controllers/dataController.js";

const dataRouter = express.Router();

dataRouter.get("/getData", getDataListWithThirdSession);
dataRouter.get("/getCheckin", getCheckinWithThirdSession);

export default dataRouter;
