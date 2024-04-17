import express from "express";
import { getAuthorAndCards } from "../controllers/cardController.js";

const cardRouter = express.Router();

cardRouter.get("/getAuthorAndCards", getAuthorAndCards);

export default cardRouter;
