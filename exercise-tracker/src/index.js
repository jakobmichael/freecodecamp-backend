const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/src/views/index.html");
});

const bodyParser = require("body-parser");
const dns = require("dns");
const url = require("url");
const mongoose = require("mongoose");
const { Schema } = mongoose;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const userSchema = new Schema({
  username: { type: String, required: true },
  log: [
    {
      description: { type: String, required: true },
      duration: { type: Number, required: true },
      date: { type: Date },
    },
  ],
});

const User = mongoose.model("User", userSchema);

app.post("/api/users", (req, res) => {
  const { username } = req.body;

  User.findOne({ username })
    .then((user) => {
      if (user) return res.send("Username already taken");

      const newUser = new User({ username });
      newUser
        .save()
        .then((user) => res.json({ username: user.username, _id: user._id }))
        .catch((err) => res.send("Error saving user to database"));
    })
    .catch((err) => console.log(err));
});

app.get("/api/users", (req, res) => {
  User.find({})
    .then((users) => res.json(users))
    .catch((err) => res.send("Error getting users from database"));
});

app.post("/api/users/:_id/exercises", (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  User.findById(_id)
    .then((user) => {
      if (!user) return res.send("Unknown userId");

      const newExercise = {
        description,
        duration: Number(duration),
        date: date ? new Date(date) : new Date(),
      };

      user.log.push(newExercise);
      user
        .save()
        .then((user) =>
          res.json({
            _id: user._id,
            username: user.username,
            date: newExercise.date.toDateString(),
            duration: newExercise.duration,
            description: newExercise.description,
          })
        )
        .catch((err) => res.send("Error saving exercise to database"));
    })
    .catch((err) => console.log(err));
});

app.get("/api/users/:_id/logs", (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  User.findById(_id)
    .then((user) => {
      if (!user) return res.send("Unknown userId");

      let log = user.log;

      if (from) {
        const fromDate = new Date(from);
        log = log.filter((exercise) => exercise.date >= fromDate);
      }

      if (to) {
        const toDate = new Date(to);
        log = log.filter((exercise) => exercise.date <= toDate);
      }

      if (limit) {
        log = log.slice(0, limit);
      }

      res.json({
        _id: user._id,
        username: user.username,
        count: log.length,
        log: log.map((exercise) => ({
          description: exercise.description,
          duration: exercise.duration,
          date: exercise.date.toDateString(),
        })),
      });
    })
    .catch((err) => console.log(err));
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
