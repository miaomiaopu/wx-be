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
   │  └─ redis.js
   ├─ controllers
   │  └─ userControllers.js
   ├─ middlewares
   │  ├─ errorHandler.js
   │  └─ pinoMiddleware.js
   ├─ models
   │  └─ User.js
   └─ utils
```