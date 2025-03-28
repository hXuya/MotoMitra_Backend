import express from "express";
import mongoose from "mongoose";
import userRoute from "./route/userRoute.js";
import garageRoute from "./route/garageRoute.js";
import vehicleRoute from "./route/vehicleRoute.js";
import reservationRoute from "./route/reservationRoute.js";
import itemRoute from "./route/itemRoute.js";


const app = express();
app.use(express.json());


app.get("/", (req, res) => {
  res.json("Backend Is Working");
});

app.use("/api/user", userRoute);
app.use("/api/garage", garageRoute);
app.use("/api/vehicle", vehicleRoute);
app.use("/api/reservation", reservationRoute);
app.use("/api/item", itemRoute);

// const password = "garage123";
const password = "garage"
app.listen(8000, '192.168.1.77', async () => {
    try{
        

        await mongoose.connect(`mongodb://localhost:27017/moto_mitra`)

        console.log("Connected to database")
        console.log("Server is running on port 8000");
    }catch(err){
        console.log("Error in connecting to database", err);
    }
})