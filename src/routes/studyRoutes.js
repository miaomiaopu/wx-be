import express from "express";
import {
  getIsAllStudy,
  getIsStudy,
  selectCard,
  selectCards,
  cancelSelectCards,
  cancelSelectCard,
  getStudyCards,
  getStudyCard,
  completeStudyCard,
  studyTime
} from "../controllers/studyController.js";

const studyRouter = express.Router();

studyRouter.get("/getIsStudy", getIsStudy);
studyRouter.get("/getIsAllStudy", getIsAllStudy);
studyRouter.post("/selectCard", selectCard);
studyRouter.post("/selectCards", selectCards);
studyRouter.post("/cancelSelectCards", cancelSelectCards);
studyRouter.post("/cancelSelectCard", cancelSelectCard);
studyRouter.get("/getStudyCards", getStudyCards);
studyRouter.get("/getStudyCard", getStudyCard);
studyRouter.post("/completeStudyCard", completeStudyCard);
studyRouter.post("/studyTime", studyTime)

export default studyRouter;
