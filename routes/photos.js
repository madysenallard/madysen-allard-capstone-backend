import express from "express";
import fs from "fs";
import multer from "multer";
import authorize from "../middleware/authorize.js";

const router = express.Router();
const PHOTOS_FILE_PATH = "./data/photos.json";

//reads JSON data in JS
function readPhotos() {
  const photosData = fs.readFileSync(PHOTOS_FILE_PATH);
  return JSON.parse(photosData);
}

//writes photos to JSON data
function writePhotos(photos) {
  fs.writeFileSync(PHOTOS_FILE_PATH, JSON.stringify(photos, null, 2));
}

//get all photos
router.get("/", (_req, res) => {
  const photos = readPhotos();
  res.json(photos);
});

// Get single photo by ID
router.get("/:id", (req, res) => {
  const photos = readPhotos();
  const photo = photos.find((p) => p.id === req.params.id);

  if (!photo) {
    return res.status(404).json({ error: "Photo not found" });
  }

  res.json(photo);
});

//file uploads using multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueFileName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueFileName + "-" + file.originalname); // Unique filename
  },
});

const upload = multer({ storage });

//create new post
router.post("/", authorize, upload.single("photo"), async (req, res) => {
  const { caption } = req.body;
  const { id, username } = req.user;
  const photo = req.file;

  if (!photo) {
    return res.status(400).json({ error: "Photo file is required" });
  }

  try {
    const photos = readPhotos();

    const newPhoto = {
      id: String(photos.length + 1), //generate id
      user_id: id,
      username: username,
      photo_url: `http://localhost:8080/uploads/${photo.filename}`,
      caption,
      timestamp: new Date(),
    };

    photos.unshift(newPhoto);

    writePhotos(photos);

    res
      .status(201)
      .json({ id: newPhoto.id, message: "Photo uploaded successfully" });
  } catch (error) {
    console.error("Error uploading photo:", error);
    res.status(500).json({ error: "Failed to upload photo" });
  }
});

export default router;
