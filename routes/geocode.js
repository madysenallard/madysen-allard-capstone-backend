import express from "express";
import axios from "axios";
const router = express.Router();

const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;

// Geocoding endpoint
router.get("/", async (req, res, next) => {
  const { city } = req.query;

  // Validate query parameters
  if (!city) {
    return res.status(400).json({ error: "City name is required" });
  }

  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        city
      )}&key=${googleApiKey}`
    );

    if (
      response.data.status === "REQUEST_DENIED" ||
      response.data.status === "INVALID_REQUEST"
    ) {
      console.error("Google Geocoding API Error:", response.data);
      return res.status(400).json({
        error:
          response.data.error_message ||
          "Invalid request to Google Geocoding API",
      });
    }

    res.json(response.data);
  } catch (error) {
    next(error);
  }
});

export default router;
