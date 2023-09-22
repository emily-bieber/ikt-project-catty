const express = require("express");
const cors = require("cors");
const postsRoutes = require("./routes/posts.routes");
const uploadRoutes = require("./routes/upload.routes");
const downloadRoutes = require("./routes/download.routes");
const deleteRoutes = require("./routes/delete.routes");
const subscriptionRoute = require("./routes/subscription.routes");

require("dotenv").config();
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use("/posts", postsRoutes);
app.use("/upload", uploadRoutes);
app.use("/download", downloadRoutes);
app.use("/delete", deleteRoutes);
app.use("/subscription", subscriptionRoute);

app.listen(PORT, (error) => {
  if (error) {
    console.log(error);
  } else {
    console.log(`server running on http://localhost:${PORT}`);
  }
});

mongoose
  .connect(process.env.DB_CONNECTION, {
    dbName: process.env.DB_NAME,
  })
  .then(() => console.log("connected to DB"))
  .catch((err) => console.error(err, "conncetion error"));

const db = mongoose.connection;
