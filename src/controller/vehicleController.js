import Vehicle from "../model/vehicleModel.js";

export default class VehicleController{
    async createVehicle(req, res) {
        const { name, model, type, number } = req.body;
    
        if (!name || !model || !type || !number) {
            return res.status(400).json({ message: "All fields are required" });
        }
    
        try {
            const existingVehicle = await Vehicle.findOne({ number });
            if (existingVehicle) {
                return res.status(409).json({ message: "Vehicle number already exists" });
            }
    
            const vehicle = new Vehicle({
                name,
                model,
                type,
                number,
                owner: req.decoded.id
            });
    
            await vehicle.save();
            return res.status(200).json({ data: vehicle });
    
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: err.message });
        }
    }
    
    
    async getAllVehicles(req, res){
        try{
            const vehicles = await Vehicle.find().populate('owner', 'username email');
        return res.status(200).json({data: vehicles});
        }catch(err){
            console.error(err);
            res.status(500).json({msg:err.message});
        }
        
    }

    async getMyVehicles(req, res){
        try{
            const vehicles = await Vehicle.find({owner: req.decoded.id}).populate('owner', 'username email');
        return res.status(200).json({data: vehicles});
        }catch(err){
            console.error(err);
            res.status(500).json({msg:err.message});
        }
    }

    async updateVehicle(req, res){
        try{
            const {name, model, type, number} = req.body;
            const vehicle = await Vehicle.findById(req.params.id);
            
            if(!vehicle){
                return res.status(404).json({message: "Vehicle not found"});
            }
            if(vehicle.owner != req.decoded.id){
                return res.status(401).json({message: "You are not authorized to update this vehicle"});
            }
            vehicle.name = name || vehicle.name;
            vehicle.model = model || vehicle.model;
            vehicle.type = type || vehicle.type;
            vehicle.number = number || vehicle.number;
            await vehicle.save();
            return res.status(200).json({data: vehicle});
        }catch(err){
            console.error(err);
            res.status(500).json({msg:err.message});
        }
    }

    async deleteVehicle(req, res) {
        try {
            const vehicle = await Vehicle.findById(req.params.id);
    
            if (!vehicle) {
                return res.status(404).json({ message: "Vehicle not found" });
            }
    
            if (vehicle.owner.toString() !== req.decoded.id) {
                return res.status(401).json({ message: "You are not authorized to delete this vehicle" });
            }
    
            await Vehicle.findByIdAndDelete(req.params.id);
    
            return res.status(200).json({ message: "Vehicle deleted successfully" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    }
    

}