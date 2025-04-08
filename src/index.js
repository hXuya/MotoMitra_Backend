import express from "express";
import mongoose from "mongoose";
import userRoute from "./route/userRoute.js";
import garageRoute from "./route/garageRoute.js";
import vehicleRoute from "./route/vehicleRoute.js";
import reservationRoute from "./route/reservationRoute.js";
import itemRoute from "./route/itemRoute.js";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(express.json());

// Serve static files from the uploads folder
app.use('/images', express.static(path.join(__dirname, 'uploads')));

app.use(cors({
  origin: '*', 
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

app.listen(8000, async () => {
  try {
    await mongoose.connect(`mongodb://localhost:27017/moto_mitra`);
    console.log("Connected to database");
    console.log("Server is running on port 8000");
  } catch (err) {
    console.log("Error connecting to database:", err);
  }
});