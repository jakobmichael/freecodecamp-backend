var express = require("express");
var cors = require("cors");
require("dotenv").config();

var app = express();

app.use(cors());
app.use("/public", express.static(process.cwd() + "/public"));

const bodyParser = require("body-parser");
const dns = require("dns");
const url = require("url");
const mongoose = require("mongoose");
const { Schema } = mongoose;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const fileSchema = new Schema({
  name: String,
  type: String,
  size: Number,
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/src/views/index.html");
});

const File = mongoose.model("File", fileSchema);

app.post(
  "/api/fileanalyse",
  bodyParser.raw({ type: "multipart/form-data" }),
  function (req, res) {
    const file = req.files.upfile;
    const fileObj = {
      name: file.name,
      type: file.mimetype,
      size: file.size,
    };
    const newFile = new File(fileObj);
    newFile
      .save()
      .then((file) => {
        res.json({
          name: file.name,
          type: file.type,
          size: file.size,
          id: file._id,
        });
      })
      .catch((err) => console.log(err));
  }
);

app.get("/api/fileanalyse", function (req, res) {
  res.json({ error: "No file uploaded" });
});

app.get("/api/fileanalyse/:id", function (req, res) {
  const id = req.params.id;
  File.findById(id)
    .then((file) => {
      res.json({
        name: file.name,
        type: file.type,
        size: file.size,
        id: file._id,
      });
    })
    .catch((err) => console.log(err));
});

app.get("/api/fileanalyse/:id/delete", function (req, res) {
  const id = req.params.id;
  File.findByIdAndDelete(id)
    .then((file) => {
      res.json({
        message: "File deleted",
        id: file._id,
      });
    })
    .catch((err) => console.log(err));
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Your app is listening on port " + port);
});
