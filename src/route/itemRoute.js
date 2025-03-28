import { Router } from "express";
import  ItemController  from "../controller/itemController.js";
import verifyUser from "../middleware/verifyUser.js";
import verifyGarage from "../middleware/verifyGarage.js";

const itemController = new ItemController();

const router = Router();

router.post('/recommend', verifyGarage,itemController.recommendItem);
router.get('/',verifyUser ,itemController.getRecommendationItemForUser);
router.get('/:id', itemController.getRecommendedItem); //reservation Id
router.put('/accept/:id', verifyUser,itemController.acceptRecommendatedItem);
router.put('/reject/:id', verifyUser,itemController.rejectRecommendatedItem);




export default router;