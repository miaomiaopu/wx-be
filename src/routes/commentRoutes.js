import express from "express";
import {
  getComments,
  createComment,
  deleteComment
} from "../controllers/commentController.js";

const commentRouter = express.Router();

commentRouter.get("/getComments", getComments);
commentRouter.post("/createComment", createComment);
commentRouter.post("/deleteComment", deleteComment);

export default commentRouter;
