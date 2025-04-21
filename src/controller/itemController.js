import Garage from '../model/garageModel.js';
import ItemModel from '../model/itemModel.js';
import Reservation from '../model/reservationModel.js';
import Notification from '../model/notificationModel.js';

export default class ItemController{
    async recommendItem(req, res){
        try{
            const {name, price, description, reservation} = req.body;
            if(!name || !price || !description || !reservation){
                return res.status(400).json({
                    msg: 'Please fill in all fields'
                })
            }
            const reservationData = await Reservation.findOne({_id: reservation});
            const garage = await Garage.findOne({_id: reservationData.garage});
            if(req.decoded.id != garage.owner){
                return res.status(400).json({
                    msg: 'You are not authorized to perform this action'
                })
            }
            const item = new ItemModel({
                name,
                price,
                description,
                reservation
            })
            const notification = new Notification({
                title: 'New Item Recommended',
                description: `A new item has been recommended for your reservation ${reservationData.title}`,
                user: reservationData.customer
            });
            await item.save();
            res.status(200).json({msg: 'Item created successfully', data: item});
        }catch(err){
            console.error(err);
            res.status(500).json({msg:err.message});
        }
    }

    async getRecommendationItemForUser(req, res){
        try{
            
            const items = await ItemModel.find()
            .populate({
                path: 'reservation',
                match: { customer: req.decoded.id },  // Filter reservations by customerId
                select: '_id' // Only selecting _id to reduce query load
            })
            .then(results => results.filter(item => item.reservation)); // Filter out unmatched reservations

        // Filter out items where the reservation does not match the customer
        const filteredItems = items.filter(item => item.reservation !== null);

        res.status(200).json({ msg: 'Items fetched successfully', data: filteredItems });
        }catch(err){
            console.error(err);
            res.status(500).json({msg:err.message});
        }
    }

    async getRecommendedItem(req, res){
        try{
            let item = await ItemModel.find({reservation: req.params.id}).populate('reservation');
            res.status(200).json({msg: 'Item fetched successfully', data: item});
        }catch(err){
            console.error(err);
            res.status(500).json({msg:err});
        }
    }

    async acceptRecommendatedItem(req, res){
        try{
            let item = await ItemModel.findOne({ _id: req.params.id })
            .populate({
                path: 'reservation',
                populate: {
                    path: 'customer', // Populate the customer field in the reservation
                    select: '_id username email' // Select specific fields to include
                }
            });
            if(!item){
                return res.status(400).json({msg: 'Item not found'});
            }
            if(item.reservation.customer._id != req.decoded.id){
                return res.status(401).json({msg: 'You are not authorized to perform this action'});
            }
            item.status = "accept";
            await item.save();

            const reservation = await Reservation.findOne({_id: item.reservation});
            const garage = await Garage.findOne({_id: reservation.garage});
            const notification = new Notification({
                title: 'Item Accepted',
                description: `Your recommended item has been accepted for reservation ${item.reservation.title}`,
                user: garage.owner
            });
            res.status(200).json({msg: 'Item accepted successfully', data: item});
        }catch(err){
            console.error(err);
            res.status(500).json({msg:err});
        }
    }

    async rejectRecommendatedItem(req, res){
        try{
            const {id}  = req.params;
            let item = await ItemModel.findOne({ _id: req.params.id })
            .populate({
                path: 'reservation',
                populate: {
                    path: 'customer', // Populate the customer field in the reservation
                    select: '_id username email' // Select specific fields to include
                }
            });
            if(!item){
                return res.status(404).json({msg: 'Item not found'});
            }
            if(item.reservation.customer._id != req.decoded.id){
                return res.status(401).json({msg: 'You are not authorized to perform this action'});
            }
            item.status = "reject";
            await item.save();
            res.status(200).json({msg: 'Item rejected successfully', data: item});
        }catch(err){
            console.error(err);
            res.status(500).json({msg:err});
        }
    }

    async totalAmount(req, res){
        try{
            let item = await ItemModel.find({reservation: req.params.id});
            let total = 0;
            item.forEach(element => {
                total += element.price;
            });
            res.status(200).json({msg: 'Total amount fetched successfully', data: total});
        }catch(err){
            console.log(err);
            res.status(500).json({msg:err});
        }
    }

    async acceptedPrice(req, res){
        try{
            let item = await ItemModel.find({reservation: req.params.id, status: 'accept'});
            let total = 0;
            item.forEach(element => {
                total += element.price;
            });
            res.status(200).json({msg: 'Total amount fetched successfully',  data: total});
        }catch(err){
            console.error(err);
            res.status(500).json({msg:err});
        }
    }


}