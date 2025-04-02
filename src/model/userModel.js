
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    phone:{
        type: String,
        required: true,
        unique: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    role: {
        type: String,
        default: 'user'
    },
    status:{
        type: String,
        default: 'pending'
    },
    isEmailVerified:{
        type: Boolean,
        default: false
    },
    trash:{
        type: Boolean,
        default: false
    }
});

const User = mongoose.model('User', userSchema);

export default User;