const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Connected");
});

app.use(bodyParser.json());

app.listen(port, () => {
  console.log(`server is running on http://localhost:${port}`);
});

mongoose.connect("mongodb://127.0.0.1:27017/myforum");

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

const user = mongoose.model("User", {
  email: String,
  name: String,
  password: String,
});

const question = mongoose.model("Question", {
  question_text: String,
  date: Date,
  user_id: Number,
});

const answer = mongoose.model("Answer", {
  answer_text: String,
  date: Date,
  gained_likes_number: Number,
  question_id: Number,
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ error: "missing field" });

  const hashedPassword = await bcrypt.hash(password, 16);

  const User = new user({
    name,
    email,
    password: hashedPassword,
  });

  const token = jwt.sign({ userId: User._id }, "secret_key", {
    expiresIn: "2h",
  });
  const refreshToken = jwt.sign({ userId: User._id }, "secret_refresh_key", {
    expiresIn: "1d",
  });

  try {
    const response = await User.save();
    res.status(200).json({ response: "success", token, refreshToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "server error" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(404).json({ error: "wrong email or password" });

  try {
    const User = await user.findOne({ email });

    if (!User) {
      return res.status(404).json({ error: "wrong email" });
    }

    const passwordMatch = await bcrypt.compare(password, User.password);

    if (!passwordMatch) {
      return res.status(404).json({ error: "wrong password" });
    }

    const token = jwt.sign({ userId: User._id }, "secret_key", {
      expiresIn: "2h",
    });
    const refreshToken = jwt.sign({ userId: User._id }, "secret_refresh_key", {
      expiresIn: "1d",
    });

    res.status(200).json({ message: "sucsess", token, refreshToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "server error" });
  }
});

app.get("/questions", async (req, res) => {
  try {
    const questions = await question.find();

    res.status(200).json({ questions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "server error" });
  }
});

app.post("/question", async (req, res) => {
  const { question_text, user_id } = req.body;

  try {
    const newQuestion = await question.create({
      question_text,
      user_id,
    });

    res.status(200).json({ question: newQuestion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "server error" });
  }
});

app.delete("/question/:id", async (req, res) => {
  const questionId = req.params.id;

  try {
    const deletedQuestion = await question.findByIdAndDelete(questionId);

    if (!deletedQuestion) {
      return res.status(404).json({ error: "question not found" });
    }

    res
      .status(200)
      .json({ message: "question deleted", question: deletedQuestion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "server error" });
  }
});

app.get("/question/:id/answers", async (req, res) => {
  const questionId = req.params.id;

  try {
    const answers = await answer.find({ question_id: questionId });

    res.status(200).json({ answers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "server error" });
  }
});

app.post("/question/:id/answer", async (req, res) => {
  const { answer_text, user_id } = req.body;
  const questionId = req.params.id;

  try {
    const newAnswer = await answer.create({
      answer_text,
      user_id,
      question_id: questionId,
    });

    res.status(200).json({ answer: newAnswer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "server error" });
  }
});

app.delete("/answer/:id", async (req, res) => {
  const answerId = req.params.id;

  try {
    const deletedAnswer = await answer.findByIdAndDelete(answerId);

    if (!deletedAnswer) {
      return res.status(404).json({ error: "answer not found" });
    }

    res.status(200).json({ message: "answer deleted", answer: deletedAnswer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "server error" });
  }
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, "secret_key", (err, user) => {
    if (err) return res.sendStatus(403);

    req.user = user;

    next();
  });
}
