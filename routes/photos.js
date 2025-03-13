import express from "express";
const router = express.Router();
import fs from "fs";
import crypto from "crypto";

//reads JSON data in JS
function readPhotos() {
  const photosData = fs.readFileSync("./data/photos.json");
  const parsedData = JSON.parse(photosData);
  return parsedData;
}

//get request to return full array of photo objects
const getPhotos = () => {
  const photos = readPhotos();
  return photos.map((photo) => photo);
};

router.get("/", (_req, res) => {
  res.json(getPhotos());
});

//create new post

export default router;
