import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import authorize from "../middleware/authorize.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  console.log({ username, email, password });

  const encrypted = bcrypt.hashSync(password);
  console.log(password, encrypted);

  try {
    await knex("users").insert({ username, email, password: encrypted });
    res.status(201).json({ success: true });
  } catch (e) {
    switch (e.code) {
      case "ER_DUP_ENTRY":
        res.status(400).send("username exists");
        break;
      case "ER_DATA_TOO_LONG":
        res.status(400).send("username too long (max 20 chars)");
        break;
      default:
        res.status(500).send("something went wrong");
    }
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await knex("users").where({ username }).first();

    if (!user) {
      return res.status(400).send("user incorrect");
    }

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(400).send("password incorrect");
    }

    const token = jwt.sign({ id: user.id, admin: true }, process.env.SECRET);
    res.json({ token });
  } catch (e) {
    res.status(401).send("login failed");
  }
});

// Use the imported authorize middleware
router.get("/profile", authorize, (req, res) => {
  res.json(req.user);
});

export default router;
