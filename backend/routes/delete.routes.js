const express = require("express");
const router = express.Router();
const mongodb = require("mongodb");
const { database } = require("../configure/db");
const ObjectId = require("mongodb").ObjectId;

const bucket = new mongodb.GridFSBucket(database, {
  bucketName: "posts",
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await bucket.delete(new ObjectId(id));
    res.status(200).send({ message: "deleted" });
  } catch (error) {
    console.log("error", error);
    res.status(404).send({ message: "id " + id + " does not exist" });
  }
});

module.exports = router;
