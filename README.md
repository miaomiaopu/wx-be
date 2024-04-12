# wx-be

## 项目简介

基于 Node.js 的知识卡片分享平台的后端框架

使用 Express 后端框架开发

## 项目结构

```
wx-be
├─ .gitignore
├─ db
│  └─ create_table.sql
├─ LICENSE
├─ package-lock.json
├─ package.json
├─ README.md
└─ src
   ├─ app.js
   ├─ configs
   │  ├─ database.js
   │  ├─ logger.js
   │  ├─ redis.js
   │  └─ upload.js
   ├─ controllers
   │  ├─ dataController.js
   │  ├─ informationController.js
   │  ├─ themeController.js
   │  └─ userController.js
   ├─ middlewares
   │  ├─ errorHandler.js
   │  └─ pinoMiddleware.js
   ├─ models
   │  ├─ Checkin.js
   │  ├─ Data.js
   │  ├─ index.js
   │  ├─ Information.js
   │  ├─ Tag.js
   │  ├─ Theme.js
   │  ├─ ThemeTagConnection.js
   │  └─ User.js
   └─ utils
      ├─ generateThirdSession.js
      └─ getAccessToken.js

```