import mongoose from 'mongoose';

const { Schema } = mongoose;

const ratingSchema = new Schema({
    
    garage:{
        type: Schema.Types.ObjectId,
        ref: 'Garage',
        required: true,
    },
    customer:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    rating:{
        type: Number,
        required: true
    },
    review:{
        type: String,
        required: true
    }
}, {
    timestamps: true,
});

const Rating = mongoose.model('Rating', ratingSchema);

export default Rating;