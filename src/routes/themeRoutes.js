import express from "express";
import upload from "../configs/upload.js";
import {
  createThemeWithPicture,
  createThemeWithoutPicture,
} from "../controllers/themeController.js";

const themeRouter = express.Router();

themeRouter.post("/createThemeWithoutPicture", createThemeWithoutPicture);
themeRouter.post(
  "/createThemeWithPicture",
  upload.single("theme_picture"),
  createThemeWithPicture
);

export default themeRouter;
