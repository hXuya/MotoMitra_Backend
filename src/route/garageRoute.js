import { Router } from "express";

import GarageController from "../controller/garageController.js";
import verifyGarage from "../middleware/verifyGarage.js";

const router = Router();
const garageController = new GarageController();

// Define routes
router.post("/", verifyGarage,garageController.createGarage);


router.get("/", garageController.getGarages);

router.get("/get-nearby-garages",garageController.getNearbyGarage);

router.get("/my-garage",verifyGarage,garageController.getMyGarage);

router.get("/:id", garageController.getGarage);

router.put("/:id", verifyGarage,garageController.updateGarage);

router.get("/admin/get-unapprovded-garages",garageController.getUnapprovedGarages);

router.put("/admin/approve-garage/:id",garageController.approveGarage);

router.put("/admin/reject-garage/:id",garageController.rejectGarage);






// router.delete("/:id", garageController.deleteGarage);

export default router;