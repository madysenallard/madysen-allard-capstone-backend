import jwt from "jsonwebtoken";
import knex from "knex";
import config from "../knexfile.js";

const db = knex(config);

async function authorize(req, res, next) {
  const { authorization } = req.headers;

  // Check if the Authorization header exists
  if (!authorization) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  // Take the token from the header
  const token = authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token missing" });
  }

  try {
    // Verify the token
    const payload = jwt.verify(token, process.env.SECRET);
    const { id } = payload;

    // Find the user in the database
    const user = await db("users")
      .select("id", "username")
      .where({ id })
      .first();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Attach the user to the request object
    req.user = user;

    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export default authorize;
