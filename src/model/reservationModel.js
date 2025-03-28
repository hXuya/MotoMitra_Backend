import mongoose from 'mongoose';

const { Schema } = mongoose;

const reservationSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required:true
    },
    vehicle: {
        type: Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true,
    },
    garage: {
        type: Schema.Types.ObjectId,
        ref: 'Garage',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        default: 'pending',
    },
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    workstatus: {
        type: String,
        default: "pending",
    },
    location:{
        type: String,
        required: true,
    },
    towingRequest:{
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true,
});

const Reservation = mongoose.model('Reservation', reservationSchema);

export default Reservation;