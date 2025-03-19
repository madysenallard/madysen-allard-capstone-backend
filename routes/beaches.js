import express from "express";
import axios from "axios";
const router = express.Router();

const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;

// Nearby beaches endpoint
router.get("/nearby-beaches", async (req, res, next) => {
  const { lat, lng, radius = 10000 } = req.query;

  // Validate query parameters
  if (!lat || !lng) {
    return res
      .status(400)
      .json({ error: "Latitude and longitude are required" });
  }

  try {
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

    const beaches = response.data.places.map((place) => ({
      name: place.displayName.text,
      lat: place.location.latitude,
      lng: place.location.longitude,
    }));

    res.json({ results: beaches });
  } catch (error) {
    next(error);
  }
});

export default router;
