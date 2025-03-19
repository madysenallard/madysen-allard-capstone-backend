import express from "express";
import initKnex from "knex";
import configuration from "../knexfile.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import authorize from "../middleware/authorize.js";

export const knex = initKnex(configuration);
const router = express.Router();

router.post("/register", async (req, res) => {
  // grab the username/password
  const { username, email, password } = req.body;
  console.log({ username, email, password });

  // encrypt password
  const encrypted = bcrypt.hashSync(password);
  console.log(password, encrypted);

  try {
    await knex("users").insert({ username, email, password: encrypted });
    res.status(201).json({ success: true });
  } catch (e) {
    // switch statement checking for error codes
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
  // grab the username+password
  const { username, password } = req.body;

  try {
    // find user in db
    const user = await knex("users").where({ username }).first();

    // respond if no user
    if (!user) {
      return res.status(400).send("user incorrect");
    }

    // validate password
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(400).send("password incorrect");
    }

    // generate token
    const token = jwt.sign({ id: user.id, admin: true }, process.env.SECRET);

    // respond with token
    res.json({ token });
  } catch (e) {
    res.status(401).send("login failed");
  }
});

// authorize middleware function
// it will add the 'user' property to the 'req' object
router.get("/profile", authorize, (req, res) => {
  res.json(req.user);
});

async function authorize(req, res, next) {
  const { authorization } = req.headers;

  try {
    const token = authorization.split(" ")[1];
    // decode the payload, get the 'id' back
    const payload = jwt.verify(token, process.env.SECRET);
    const { id } = payload;

    // find the user with the 'id' from the jwt payload
    const user = await knex("users")
      .select("id", "username", "email")
      .where({ id })
      .first();

    // add the user to the req object (create a new property called 'user')
    req.user = user;

    next();
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: e });
  }
}

export default router;
