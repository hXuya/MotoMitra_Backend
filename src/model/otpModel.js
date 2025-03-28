import mongoose from 'mongoose';

const { Schema } = mongoose;

const otpSchema = new Schema({
    otp:{
        type:String,
        required:true
    },
    expiry:{
        type:Date,
        required:true
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
});

const otp = mongoose.model('Otp', otpSchema);

export default otp;