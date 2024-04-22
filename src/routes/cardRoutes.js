import express from "express";
import upload from "../configs/upload.js";
import {
  getAuthorAndCards,
  createCardWithPicture,
  createCardWithoutPicture,
  getCard,
  deleteCard
} from "../controllers/cardController.js";

const cardRouter = express.Router();

cardRouter.get("/getAuthorAndCards", getAuthorAndCards);
cardRouter.post(
  "/createCardWithPicture",
  upload.single("image"),
  createCardWithPicture
);
cardRouter.post("/createCardWithoutPicture", createCardWithoutPicture);
cardRouter.get("/getCard", getCard);
cardRouter.post("/deleteCard", deleteCard)

export default cardRouter;
