import Reservation from "../model/reservationModel.js";
import User from "../model/userModel.js";
import Garage from "../model/garageModel.js";
import Rating from "../model/ratingModel.js";

export default class ReservationController{
    async createReseravation(req, res){
        try{
            const {vehicle, garage, date, title, description, towingRequest, location} = req.body;
            const customer = req.decoded.id;
            let reservation = new Reservation({
                vehicle,
                garage,
                date,
                customer,
                title,
                description,
                towingRequest,
                location
            });
            await reservation.save();
            res.status(200).json({msg: 'Reservation created successfully', data: reservation});
        }catch(err){
            console.error(err);
            res.status(500).json({msg:err});
        }
    }

    async getGarageReservations(req, res){
        try{
            let garage = await Garage.findOne({owner:req.decoded.id});
            if(!garage){
                return res.status(404).json({msg: 'Garage not found'});
            }
            let reservations = await Reservation.find({garage:garage._id}).populate('vehicle').populate('customer', 'username email');
            res.status(200).json({msg: 'Reservations fetched successfully', data: reservations});
        }catch(err){
            console.error(err);
            res.status(500).json({msg:err});
        }
    }

    async getUserReservation(req, res){
        try{
            let reservation = await Reservation.find({customer:req.decoded.id}).populate('vehicle', 'name').populate('garage', 'name location');
            res.status(200).json({msg: 'Reservations fetched successfully', data: reservation});
        }catch(err){
            console.error(err);
            res.status(500).json({msg:err});
        }
    }

    async getAcceptedReservations(req, res){
        try{
            let reservation = await Reservation.find({customer:req.decoded.id, status:{ $in: ["pending", "started", "recommend", "accept"] }}).populate('vehicle', 'name').populate('garage', 'name location');
            res.status(200).json({msg: 'Reservations fetched successfully', data: reservation});
        }catch(err){
            console.error(err);
            res.status(500).json({msg:err});
        } 
    }

    async getAcceptedGarageReservations(req, res){
        try{
            let garage = await Garage.findOne({owner:req.decoded.id});
            if(!garage){
                return res.status(404).json({msg: 'Garage not found'});
            }
            let reservations = await Reservation.find({garage:garage._id,  status:{ $in: ["pending", "started", "recommend", "accept"] }}).populate('vehicle').populate('customer', 'username email');
            res.status(200).json({msg: 'Reservations fetched successfully', data: reservations});
        }catch(err){
            console.error(err);
            res.status(500).json({msg:err});
        }
    }

    async getUserArchivedReservations(req, res){
        try{
            let reservation = await Reservation.find({customer:req.decoded.id,status: { $ne:  ["pending", "started", "recommend", "accept"] } }).populate('vehicle', 'name').populate('garage', 'name location');
            res.status(200).json({msg: 'Reservations fetched successfully', data: reservation});
        }catch(err){
            console.error(err);
            res.status(500).json({msg:err});
        }
    }

    async getGarageArchivedReservations(req, res){
        try{
            let garage = await Garage.findOne({owner:req.decoded.id});
            if(!garage){
                return res.status(404).json({msg: 'Garage not found'});
            }
            let reservations = await Reservation.find({garage:garage._id, status: { $ne:  ["pending", "started", "recommend", "accept"] }}).populate('vehicle').populate('customer', 'username email');
            res.status(200).json({msg: 'Reservations fetched successfully', data: reservations});
        }catch(err){
            console.error(err);
            res.status(500).json({msg:err});
        }
    }

    async approveReservationRequest(req, res){
        try{
            const {id} = req.params;
            let garage = await Garage.findOne({owner:req.decoded.id});
            if(!garage){
                return res.status(400).json({msg: 'User Do not have garage'});
            }
            let reservation = await Reservation.find({_id:id, garage:garage._id});
            if(reservation.length <1){
                return res.status(400).json({msg: 'Reservation not found'});
            }
            
            reservation[0].status = 'accept';
            await reservation[0].save();
            res.status(200).json({msg: 'Reservation approved successfully', data: reservation});
        }catch(err){
            console.error(err);
            res.status(500).json({msg:err});
        }
    }

    async cancelReservationRequest(req, res){
        try{
            const {id} = req.params;
            let reservation = await Reservation.findById(id);
            if(!reservation){
                return res.status(400).json({msg: 'Reservation not found'});
            }
            reservation.status = 'cancel';
            await reservation.save();
            res.status(200).json({msg: 'Reservation cancelled successfully', data: reservation});
        }catch(err){
            console.error(err);
            res.status(500).json({msg:err});
        }
    }

    async rejectReservationRequest(req, res){
        try{
            const {id} = req.params;
            let garage = await Garage.findOne({owner:req.decoded.id});
            if(!garage){
                return res.status(400).json({msg: 'User Do not have garage'});
            }
            let reservation = await Reservation.find({_id:id, garage:garage._id});
            if(reservation.length < 1){
                return res.status(400).json({msg: 'Reservation not found'});
            }
            
            reservation[0].status = 'reject';
            await reservation[0].save();
            res.status(200).json({msg: 'Reservation approved successfully', data: reservation});
        }catch(err){
            console.error(err);
            res.status(500).json({msg:err});
        }
    }

    async updateReservationStatus(req,res){
        try{
            const {id} = req.params;
            let garage = await Garage.findOne({owner:req.decoded.id});
            if(!garage){
                return res.status(400).json({msg: 'User Do not have garage'});
            }
            let reservation = await Reservation.find({_id:id, garage:garage._id});
            if(reservation.length < 1){
                return res.status(400).json({msg: 'Reservation not found'});
            }
            if(reservation[0].workstatus == "accept"){
                reservation[0].workstatus = "recommend";
            }else if(reservation[0].workstatus == "recommend"){
                reservation[0].workstatus = "started";
            }else if(reservation[0].workstatus == "started"){
                reservation[0].workstatus = "completed";
                reservation[0].amount = req.query.amount;
            }
            await reservation[0].save();
            res.status(200).json({msg: 'Reservation updated successfully', data: reservation});
        }catch(err){
            console.error(err);
            res.status(500).json({msg:err});
        }
    }

    async review(req, res) {
        try {
            const { id, rating, review } = req.body;
    
            // Validate the rating input
            const rateNumber = parseFloat(rating);
            if (isNaN(rateNumber) || rateNumber < 0 || rateNumber > 5) {
                return res.status(400).json({ msg: 'Invalid rating value. It must be a number between 0 and 5.' });
            }
    
            // Find the reservation
            let reservation = await Reservation.findById(id);
            if (!reservation) {
                return res.status(400).json({ msg: 'Reservation not found' });
            }
    
            if (reservation.workstatus !== "completed") {
                return res.status(400).json({ msg: 'Work is not completed yet' });
            }
    
            // Create a new rating
            let ratingData = new Rating({
                garage: reservation.garage,
                customer: reservation.customer,
                rating: rateNumber,
                review,
            });
            await ratingData.save();
    
            // Calculate the average rating for the garage
            let allRatings = await Rating.find({ garage: reservation.garage });
            let totalRating = 0;
            let count = allRatings.length;
    
            allRatings.forEach((rating) => {
                totalRating += rating.rating;
            });
    
            let avgRating = count > 0 ? totalRating / count : 0; // Prevent division by zero
    
            // Update the garage's rating
            let garage = await Garage.findById(reservation.garage);
            garage.rating = avgRating;
            await garage.save();
    
            res.status(200).json({ msg: 'Review added successfully', data: ratingData, garage });
        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: err.message });
        }
    }
}