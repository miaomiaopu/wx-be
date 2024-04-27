import express from "express";
import {
  getIsAllStudy,
  getIsStudy,
  selectCard,
  selectCards,
  cancelSelectCards,
  cancelSelectCard,
  getStudyCards,
  completeStudyCard,
} from "../controllers/studyController.js";

const studyRouter = express.Router();

studyRouter.get("/getIsStudy", getIsStudy);
studyRouter.get("/getIsAllStudy", getIsAllStudy)
studyRouter.post("/selectCard", selectCard);
studyRouter.post("/selectCards", selectCards);
studyRouter.post("/cancelSelectCards", cancelSelectCards);
studyRouter.post("/cancelSelectCard", cancelSelectCard);
studyRouter.get("/getStudyCards", getStudyCards);
studyRouter.post("/completeStudyCard", completeStudyCard);

export default studyRouter;
