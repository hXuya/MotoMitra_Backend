import express from "express";
import mongoose from "mongoose";
import userRoute from "./route/userRoute.js";
import garageRoute from "./route/garageRoute.js";
import vehicleRoute from "./route/vehicleRoute.js";
import reservationRoute from "./route/reservationRoute.js";
import itemRoute from "./route/itemRoute.js";
import notificationRoute from "./route/notificationRoute.js";


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
app.use("/api/notification", notificationRoute);

// const password = "garage123";
const password = "garage"
app.listen(8000, async () => {
    try{
        
        // await mongoose.connect(`mongodb+srv://garage:${password}@cluster0.qh3tg.mongodb.net/garagedb?retryWrites=true&w=majority&appName=Cluster0`)
        await mongoose.connect(`mongodb+srv://garage:${password}@cluster0.zgwqk.mongodb.net/garagedb?retryWrites=true&w=majority&appName=Cluster0`)

        console.log("Connected to database")
        console.log("Server is running on port 8000");
    }catch(err){
        console.log("Error in connecting to database", err);
    }
})