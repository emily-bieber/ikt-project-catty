const express = require("express");
const webpush = require("web-push");
const router = express.Router();

const publicVapidKey =
  "BPZb3FBBEzfckB0qMpLE8KWjvMBTOpfKFdgL-ShFCNJ_jZxVgwfsf5fJgUUhrUPjz2mdt4yvENj7vboBIWClmJI";
const privateVapidKey = "Grkzt9cEP-VkAPieuZMojodVT2iMchtocgFQ-0fX8I0";

router.post("/", async (req, res) => {
  const subscription = req.body;
  console.log("subscription", subscription);
  res.status(201).json({ message: "subscription received" });

  webpush.setVapidDetails(
    "mailto:emily.bieber@student.htw-berlin.de",
    publicVapidKey,
    privateVapidKey
  );
});

module.exports = router;
