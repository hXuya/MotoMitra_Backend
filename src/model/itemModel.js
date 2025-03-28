import mongoose from 'mongoose';

const { Schema } = mongoose;

const itemSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    price:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    reservation:{
        type: Schema.Types.ObjectId,
        ref: 'Reservation',
        required: true,
    },
    status:{
        type:String,
        default:"pending",
        
    }
}, {
    timestamps: true,
});

const Item = mongoose.model('Item', itemSchema);

export default Item;