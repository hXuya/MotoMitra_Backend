import mongoose from 'mongoose';

const { Schema } = mongoose;


const vehicleSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    type:{
        type: String,
        required: true
    },
    number:{
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

export default Vehicle;