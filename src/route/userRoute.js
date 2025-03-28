import { Router } from "express";
import UserController from "../controller/userController.js";
import verifyToken from "../middleware/verifyToken.js";
import verifyAdmin from "../middleware/verifyAdmin.js";
const router = Router();

const userController = new UserController();

// Define routesn //api/user/register
router.post("/register", userController.registerUser);

router.post("/login", userController.loginUser);

router.get("/loggedInUser", verifyToken ,userController.loggedInUser);

router.post("/verify", userController.verifyEmail);

router.get("/profile", verifyToken ,userController.getProfileDetail);

router.put("/change-password", verifyToken ,userController.changePassword);

router.put("/ban/:id", verifyAdmin ,userController.banUser);

router.put("/unban/:id", verifyAdmin ,userController.unBanUser);



export default router;