import express from "express";
import { getDataListWithThirdSession } from "../controllers/dataController.js";

const dataRouter = express.Router();

dataRouter.get("/getData", getDataListWithThirdSession);

export default dataRouter;
