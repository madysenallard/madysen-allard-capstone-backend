import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import photos from "./routes/photos.js";
import user from "./routes/user.js";
import beaches from "./routes/beaches.js";
import geocode from "./routes/geocode.js";
import initKnex from "knex";
import configuration from "./knexfile.js";
import errorHandler from "./middleware/errorHandler.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const knex = initKnex(configuration);

// Validate required environment variables
if (!process.env.GOOGLE_MAPS_API_KEY) {
  console.error("Error: GOOGLE_MAPS_API_KEY environment variable is required.");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5050;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/photos", photos);
app.use("/api/beaches", beaches);
app.use("/api/geocode", geocode);
app.use("/api", user);

// Centralized error handling
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
