import { Router } from "express";
import ReservationController from "../controller/reservationController.js";
import verifyUser from "../middleware/verifyUser.js";
import verifyGarage from "../middleware/verifyGarage.js";

const router = Router();

const reservationController = new ReservationController();

router.post("/", verifyUser, reservationController.createReseravation); //reserve a spot in garage for servicing

router.get("/garage", verifyGarage, reservationController.getGarageReservations); // retrieve all reservations for logged in garage

router.get("/user", verifyUser, reservationController.getUserReservation); // retrieve all reservations for logged in user

router.put("/approve/:id", verifyGarage, reservationController.approveReservationRequest); // approve reservation request

router.put("/cancel/:id", verifyUser, reservationController.cancelReservationRequest);

router.put("/reject/:id", verifyGarage, reservationController.rejectReservationRequest); // reject reservation request

router.put("/status/:id", verifyGarage, reservationController.updateReservationStatus); // update reservation status

router.get("/accepted-user", verifyUser, reservationController.getAcceptedReservations); // retrieve all accepted reservations for logged in user

router.get("/accepted-garage", verifyGarage, reservationController.getAcceptedGarageReservations); // retrieve all accepted reservations for logged in garage

router.get("/archive-garage", verifyGarage, reservationController.getGarageArchivedReservations); // retrieve all pending reservations for logged in garage

router.get("/archive-user", verifyUser, reservationController.getUserArchivedReservations); // retrieve all pending reservations for logged in user

router.post("/rate", verifyUser, reservationController.review); // rate garage

export default router;