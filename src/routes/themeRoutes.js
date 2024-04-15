import express from "express";
import upload from "../configs/upload.js";
import {
  createThemeWithPicture,
  createThemeWithoutPicture,
  getMyThemeAndSubTheme,
  cancelSubTheme,
  deleteMyTheme,
  updateTheme
} from "../controllers/themeController.js";

const themeRouter = express.Router();

themeRouter.post("/createThemeWithoutPicture", createThemeWithoutPicture);
themeRouter.post(
  "/createThemeWithPicture",
  upload.single("theme_picture"),
  createThemeWithPicture
);
themeRouter.get("/getMyThemeAndSubTheme", getMyThemeAndSubTheme);
themeRouter.post("/cancelSubTheme", cancelSubTheme)
themeRouter.post("/deleteMyTheme", deleteMyTheme)
themeRouter.post(
  "/updateTheme",
  upload.single("theme_picture"),
  updateTheme
);
themeRouter.post("/updateThemeWithoutPicture", updateTheme)

export default themeRouter;
