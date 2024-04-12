import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/public/images/"); // 上传文件存储的目标路径
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // 文件命名规则
  },
});

const upload = multer({ storage: storage });

export default upload;
