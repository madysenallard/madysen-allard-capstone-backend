import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import photos from "./routes/photos.js";

dotenv.config();
const app = express();

app.use(express.static("public"));

app.use(cors());
app.use(express.json());
//mounting all photos routes
app.use("/api/photos", photos);

const PORT = process.env.PORT || 5050;
const STORMGLASS_API_KEY = process.env.STORMGLASS_API_KEY;
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

//fetch coordinates for a city
app.get("/location", async (req, res) => {
  const { city } = req.query;
  try {
    const response = await axios.get(
      `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${OPENWEATHER_API_KEY}`
    );
    if (response.data.length === 0) {
      return res.status(404).json({ error: "City not found" });
    }
    const { lat, lon } = response.data[0];
    res.json({ lat, lon });
  } catch (error) {
    res.status(500).json({ error: "Error fetching location" });
  }
});

//fetch surf conditions
app.get("/surf-conditions", async (req, res) => {
  const { lat, lon } = req.query;
  try {
    const weatherResp = await axios.get(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&appid=${OPENWEATHER_API_KEY}&units=metric`
    );

    const stormglassResp = await axios.get(
      "https://api.stormglass.io/v2/weather/point",
      {
        params: {
          lat,
          lon,
          params:
            "waveHeight,wavePeriod,waveDirection,windDirection,windSpeed,waterTemperature",
          source: "noaa",
          start: Math.floor(Date.now() / 1000),
        },
        headers: {
          Authorization: STORMGLASS_API_KEY,
        },
      }
    );

    res.json({
      temp_air: weatherResp.data.current.temp,
      wind_speed: weatherResp.data.current.wind_speed,
      wind_direction: weatherResp.data.current.wind_deg,
      wave_height: stormglassResp.data.hours[0].waveHeight.noaa,
    });
  } catch (error) {
    console.error(
      "Stormglass API error:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Error fetching surf conditions" });
  }
});

// app.get("/", (req, res) => {
//   res.send(`<h1>Welcome to my Express App</h1>`);
// });

app.listen(PORT, () => {
  console.log(`app running on port ${PORT}`);
});
