import mongoose from 'mongoose';

const { Schema } = mongoose;

const garageSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    openHours: {
        type: String,
        required: true,
    },
    contactNumber: {
        type: String,
        required: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    latitude:{
        type: Number,
        required: true
    },
    longitude:{
        type: Number,
        required: true
    },
    status:{
        type: String,
        default: 'pending'
    },
    towing:{
        type: Boolean,
        default: false
    },
    rating:{
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
});

const Garage = mongoose.model('Garage', garageSchema);

export default Garage;