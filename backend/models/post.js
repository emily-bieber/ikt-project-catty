const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  title: String,
  text: String,
  date: String,
  image_id: String,
});

module.exports = mongoose.model("Post", schema);
