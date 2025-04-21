import { Router } from "express";
import NotificationController from "../controller/notificationController.js";
import verifyUser from "../middleware/verifyUser.js";

const notificationController = new NotificationController();

const router = Router();

router.get('/', verifyUser, notificationController.getNotification);

export default router;