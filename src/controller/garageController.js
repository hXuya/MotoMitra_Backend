import Garage from "../model/garageModel.js";
import User from "../model/userModel.js";

export default class GarageController{
    async createGarage(req, res){
        const { name, location, capacity, openHours, contactNumber, latitude, longitude, towing } = req.body;
        
        try{
            let garage = new Garage({
                name,
                location,
                capacity,
                openHours,
                contactNumber,
                owner : req.decoded.id,
                latitude,
                longitude,
                towing
            });
            await garage.save();
            res.status(201).json({msg: 'Garage created successfully', data: garage});
        }catch(err){
            console.error(err);
            res.status(500).json({msg:err.message});
        }
    }

    async getGarages(req, res){
        try{
            let garages = await Garage.find().populate('owner', 'username email');
            res.status(200).json({msg: 'Garages fetched successfully', data: garages});
        }catch(err){
            console.error(err);
            res.status(500).send('Server error');
        }
    }

    async getGarage(req, res){
        const { id } = req.params;
        try{
            let garage = await Garage.findById(id);
            if(!garage){
                return res.status(404).json({msg: 'Garage not found'});
            }
            res.status(200).json({msg: 'Garage fetched successfully', data: garage});
        }catch(err){
            console.error(err);
            res.status(500).send('Server error');
        }
    }

    async getMyGarage(req, res){
        try{   
            let garage = await Garage.find({owner: req.decoded.id});
            res.status(200).json({msg: 'Garage fetched successfully', data: garage});

        }catch(err){
            console.error(err);
            res.status(500).json({msg:err.message});
        }
    }

    async updateGarage(req, res){
        const { id } = req.params;
        const { name, location, capacity, openHours, contactNumber, latitude, longitude, towing } = req.body;
        try{
            let garage = await Garage.findById(id);
            if(!garage){
                return res.status(404).json({msg: 'Garage not found'});
            }
            if(garage.owner != req.decoded.id){
                return res.status(401).json({msg: 'You are not authorized to update this garage'});
            }
            garage.name =  name || garage.name;
            garage.location = location || garage.location;
            garage.capacity = capacity || garage.capacity;
            garage.openHours = openHours || garage.openHours;
            garage.contactNumber = contactNumber || garage.contactNumber;
            garage.latitude = latitude || garage.latitude;
            garage.longitude = longitude || garage.longitude;
            garage.towing = towing || garage.towing;
            await garage.save();
            res.status(200).json({msg: 'Garage updated successfully', data: garage});
        }catch(err){
            console.error(err);
            res.status(500).send('Server error');
        }
    }

    async getUnapprovedGarages(req, res){
        try{
            let user = await Garage.find({status:'pending'}).populate('owner', '-password');
            res.status(200).json({msg: 'Unapproved garages fetched successfully', data: user});
        }catch(err){
            console.error(err);
            res.status(500).send('Server error');
        }
    }

    async approveGarage(req, res){
        const {id} = req.params;
        try{
            let garage= await Garage.findById(id);
            if(!garage){
                return res.status(404).json({msg: 'garage not found'});
            }
            garage.status = 'approved';
            await garage.save();
            res.status(200).json({msg: 'Garage approved successfully', garage: garage});
        }catch(err){
            console.error(err);
            res.status(500).send('Server error');
        }
    }

    async rejectGarage(req, res){
        const {id} = req.params;
        try{
            let garage= await Garage.findById(id);
            if(!garage){
                return res.status(404).json({msg: 'garage not found'});
            }
            garage.status = 'rejected';
            await garage.save();
            res.status(200).json({msg: 'Garage rejected successfully', garage: garage});
        }catch(err){
            console.error(err);
            res.status(500).send('Server error');
        }
    }

    async getNearbyGarage(req, res) {
        const { latitude, longitude } = req.query;
        const radiusInKm = 5;

        try {
            // Parse latitude and longitude as numbers
            const lat = parseFloat(latitude);
            const lon = parseFloat(longitude);

            if (isNaN(lat) || isNaN(lon)) {
                return res.status(400).json({ msg: 'Invalid latitude or longitude' });
            }

            // Fetch all approved garages
            let garages = await Garage.find({ status: 'approved' }).populate('owner', 'username email');

            // Filter garages within 5 km radius
            const nearbyGarages = garages.filter((garage) => {
                const distance = calculateDistance(lat, lon, garage.latitude, garage.longitude);
                return distance <= radiusInKm;
            });

            res.status(200).json({ msg: 'Nearby garages fetched successfully', data: nearbyGarages });
        } catch (err) {
            console.error(err);
            res.status(500).send('Server error');
        }
    }
    
    

}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const toRadians = (degree) => (degree * Math.PI) / 180;

    const R = 6371; // Radius of Earth in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
}