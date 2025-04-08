import { Router } from "express";
import UserController from "../controller/userController.js";
import verifyToken from "../middleware/verifyToken.js";
import verifyAdmin from "../middleware/verifyAdmin.js";
import upload from "../utils/multerConfig.js";

const router = Router();

const userController = new UserController();

// Define routesn //api/user/register
router.post("/register", userController.registerUser);

router.post("/login", userController.loginUser);

router.get("/loggedInUser", verifyToken ,userController.loggedInUser);

router.post("/verify", userController.verifyEmail);

router.post("/resend-otp", userController.resendOtp);

router.get("/profile", verifyToken ,userController.getProfileDetail);

router.put('/updateProfile', verifyToken, upload.single('profileImage'), userController.updateProfile);

router.put("/change-password", verifyToken ,userController.changePassword);

router.put("/ban/:id", verifyAdmin ,userController.banUser);

router.put("/unban/:id", verifyAdmin ,userController.unBanUser);


export default router;