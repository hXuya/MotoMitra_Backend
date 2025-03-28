import { Router } from "express";
import VehicleController from "../controller/vehicleController.js";
import verifyUser from "../middleware/verifyUser.js";

const router = Router();
const vehicleController = new VehicleController();

// Define routes
router.post("/", verifyUser, vehicleController.createVehicle);

router.get("/", vehicleController.getAllVehicles);

router.get("/my-vehicles", verifyUser, vehicleController.getMyVehicles);

router.put("/:id", verifyUser, vehicleController.updateVehicle);

export default router;