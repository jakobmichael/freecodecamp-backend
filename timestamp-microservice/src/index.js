var timestampService = require("./services/timestampService.js");

var express = require("express");
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require("cors");
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/src/views/index.html");
});

app.get("/api/usage", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/api/:date?", function (req, res) {
  return res.json(timestampService.convertToUnixAndUtc(req.params.date));
});

// listen for requests :)
var listener = app.listen(8080, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
