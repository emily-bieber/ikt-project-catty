const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

router.post("/", upload.single("file"), (req, res) => {
  if (req.file === undefined) {
    return res.send({
      message: "no file selected",
    });
  } else {
    console.log("req.file", req.file);
    const imgUrl = `http://localhost:3000/download/${req.file.filename}`;
    return res.status(201).send({
      url: imgUrl,
    });
  }
});

module.exports = router;
