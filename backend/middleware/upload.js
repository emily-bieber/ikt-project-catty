const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
require("dotenv").config();

const storage = new GridFsStorage({
  //db: connection,
  url: process.env.DB_CONNECTION,
  options: {
    dbName: "catty_db",
  },
  file: (req, file) => {
    const match = ["image/png", "image/jpeg", "image/jpg"];

    if (match.indexOf(file.mimetype) === -1) {
      console.log("file.mimetype === -1");
      return `${Date.now()}-${file.originalname}`;
    }
    console.log("store");
    return {
      bucketName: "posts",
      filename: `${Date.now()}-${file.originalname}`,
    };
  },
});

module.exports = multer({ storage });
