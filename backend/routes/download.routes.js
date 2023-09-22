const express = require("express");
const router = express.Router();
const mongodb = require("mongodb");
const { database } = require("../configure/db");

const bucket = new mongodb.GridFSBucket(database, {
  bucketName: "posts",
});

router.get("/:filename", async (req, res) => {
  try {
    const filename = req.params.filename;
    let downloadStream = bucket.openDownloadStreamByName(filename);
    downloadStream.on("data", (data) => res.status(200).write(data));
    downloadStream.on("error", (err) =>
      res.status(404).send({ message: filename + " does not exist" })
    );
    downloadStream.on("end", () => res.end());
  } catch (error) {
    console.log("error", error);
    res.send("not found");
  }
});

module.exports = router;
