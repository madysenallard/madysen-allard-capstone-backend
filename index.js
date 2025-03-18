import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import photos from "./routes/photos.js";
import cors from "cors";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
// Mounting all photos routes
app.use("/api/photos", photos);

const PORT = process.env.PORT || 5050;
const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;

// Nearby beaches endpoint (updated for new Google Places API)
app.get("/api/nearby-beaches", async (req, res) => {
  const { lat, lng, radius = 10000 } = req.query;

  // Validate query parameters
  if (!lat || !lng) {
    return res
      .status(400)
      .json({ error: "Latitude and longitude are required" });
  }

  try {
    // Make a POST request to the new Google Places API
    const response = await axios.post(
      `https://places.googleapis.com/v1/places:searchNearby`,
      {
        includedTypes: ["beach"],
        maxResultCount: 10,
        locationRestriction: {
          circle: {
            center: { latitude: parseFloat(lat), longitude: parseFloat(lng) },
            radius: parseFloat(radius),
          },
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": googleApiKey,
          "X-Goog-FieldMask":
            "places.displayName,places.formattedAddress,places.location",
        },
      }
    );

    // Process the response
    const beaches = response.data.places.map((place) => ({
      name: place.displayName.text,
      lat: place.location.latitude,
      lng: place.location.longitude,
    }));

    // Send the response back to the frontend
    res.json({ results: beaches });
  } catch (error) {
    console.error("Error fetching nearby beaches:", error);
    res.status(500).json({ error: "Failed to fetch nearby beaches" });
  }
});

// Geocoding endpoint (unchanged)
app.get("/api/geocode", async (req, res) => {
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

    // Check if the Geocoding API returned an error
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

    // Send the response back to the frontend
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching geocoding data:", error);
    res.status(500).json({ error: "Failed to fetch geocoding data" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
