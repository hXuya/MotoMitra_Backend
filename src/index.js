import express from "express";
import mongoose from "mongoose";
import userRoute from "./route/userRoute.js";
import garageRoute from "./route/garageRoute.js";
import vehicleRoute from "./route/vehicleRoute.js";
import reservationRoute from "./route/reservationRoute.js";
import itemRoute from "./route/itemRoute.js";
import cors from "cors";
import path from 'path';
import fs from 'fs';

// Fix: Ensure the directory is resolved correctly using URL-based method for ES modules
const __dirname = path.dirname(new URL(import.meta.url).pathname);

const app = express();
app.use(express.json());

// Correct the image directory path without the double "D:\" issue
const imagesDir = path.join(__dirname, '..', 'images'); // Resolves to 'D:/Assesment/1.FYP/MotoMita_Backend/images'

// Log the resolved path for debugging
console.log("Resolved Images Directory Path:", imagesDir);

// Check if the images directory exists; create it if it doesn't
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true }); // Create images directory if it doesn't exist
}

// Serve static files (images) from the 'images' folder
app.use('/images', express.static(imagesDir, {
  setHeaders: (res, path) => {
    res.set('Cache-Control', 'no-cache');
  }
}));

app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.get("/", (req, res) => {
  res.json("Backend Is Working");
});

app.use("/api/user", userRoute);
app.use("/api/garage", garageRoute);
app.use("/api/vehicle", vehicleRoute);
app.use("/api/reservation", reservationRoute);
app.use("/api/item", itemRoute);

const password = "garage"; // Database password

app.listen(8000, async () => {
    try {
        await mongoose.connect(`mongodb://localhost:27017/moto_mitra`);
        console.log("Connected to database");
        console.log("Server is running on port 8000");
    } catch (err) {
        console.log("Error in connecting to database", err);
    }
});
