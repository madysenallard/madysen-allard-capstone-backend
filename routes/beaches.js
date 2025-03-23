import express from "express";
import axios from "axios";
const router = express.Router();

const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;

// Nearby beaches endpoint (POST request)
router.post("/nearby-beaches", async (req, res, next) => {
  const { lat, lng, radius = 10000 } = req.body; // Use req.body for POST requests

  // Validate request body parameters
  if (!lat || !lng) {
    return res
      .status(400)
      .json({ error: "Latitude and longitude are required" });
  }

  try {
    // Call Google Places API
    const response = await axios.post(
      `https://places.googleapis.com/v1/places:searchNearby`,
      {
        includedTypes: ["beach"],
        maxResultCount: 15,
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

    // Format the response
    const beaches = response.data.places.map((place) => ({
      name: place.displayName.text,
      address: place.formattedAddress,
      lat: place.location.latitude,
      lng: place.location.longitude,
    }));

    // Send the response
    res.json({ results: beaches });
  } catch (error) {
    console.error("Error fetching nearby beaches:", error);

    // Handle specific errors
    if (error.response) {
      // The request was made and the server responded with a status code
      return res.status(error.response.status).json({
        error: "Failed to fetch nearby beaches",
        details: error.response.data,
      });
    } else if (error.request) {
      // The request was made but no response was received
      return res.status(500).json({
        error: "No response received from Google Places API",
      });
    } else {
      // Something happened in setting up the request
      return res.status(500).json({
        error: "Error setting up the request to Google Places API",
      });
    }
  }
});

export default router;
