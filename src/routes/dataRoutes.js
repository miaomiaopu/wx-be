import express from "express";
import {
  getDataListWithThirdSession,
  getCheckinWithThirdSession,
  checkinWithThirdSession,
} from "../controllers/dataController.js";

const dataRouter = express.Router();

dataRouter.get("/getData", getDataListWithThirdSession);
dataRouter.get("/getCheckin", getCheckinWithThirdSession);
dataRouter.post("/checkin", checkinWithThirdSession)

export default dataRouter;
