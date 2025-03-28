import User from '../model/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import {sendOtpToEmail} from '../utils/email.js';
import otpModel from '../model/otpModel.js';

export default class UserController {
       async registerUser(req, res)  {
        const { username, email, password, role,phone } = req.body;
    
        try {
            // Check if user already exists
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ msg: 'User already exists' });
            }
    
            // Create a new user instance
            if(role == "garage"){
                user = new User({
                    username,
                    email,
                    password,
                    phone,
                    role,
                    status:"active"
                    
                });    
            }else{
                user = new User({
                    username,
                    email,
                    phone,
                    password,
                    status: 'active'
                    
               })
            }
            
    
            // Hash the password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
    
            // Save the user to the database
            if(await user.save()){
                sendOtpToEmail(email);
            }
    
            res.status(201).json({ msg: 'User registered successfully', data:user });
        } catch (err) {
            console.error(err.message);
            res.status(500).send({msg:err.message});
        }
    };

    async loginUser(req, res){
        const { email, password } = req.body;
    
        try {
            // Check if user exists
            let user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ msg: 'User Not Found' });
            }
            if(user.status == "pending"){
                return res.status(400).json({ msg: 'User not verified' });
            }
            if(user.isEmailVerified == false){
                sendOtpToEmail(email);
                return res.status(403).json({ msg: 'User Email is not verified' });
            }
            let isVerified = await bcrypt.compare(password, user.password);
            if(!isVerified){
                return res.status(400).json({ msg: 'Invalid Credentials' });
            }
            const payload = {
                id: user._id,
                role: user.role

            };
            let token = jwt.sign(payload
                , process.env.JWT_SECRET, { expiresIn: 360000 });
            
            res.status(200).json({ msg: 'User logged in successfully', data:user, token, role:user.role });

        }catch(err){
            console.error(err.message);
            res.status(500).send('Server error')
        }
    }

    async loggedInUser(req, res){
        try{
            let user = await User.findById(req.decoded.id).select('-password');
            res.status(200).json({msg: 'User fetched successfully', data: user});

        }catch(err){
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }

    async verifyEmail(req, res){
        const { email, otp } = req.body;
        const user = await User.find({email:email});
        if(user.length === 0){
            return res.status(400).json({msg: 'User not found'});
        }
        const otpData = await otpModel.findOne({owner:user[0]._id, otp:otp});
        if(!otpData){
            return res.status(400).json({msg: 'Invalid OTP'});
        }
        if(otpData.expiry < new Date()){
            return res.status(400).json({msg: 'OTP expired'});
        }
        user[0].isEmailVerified = true;
        await user[0].save();
        res.status(200).json({msg: 'Email verified successfully'});
    }

    async getProfileDetail(req, res){
        try{
            const user = await User.findById(req.decoded.id).select('-password');
            res.status(200).json({msg: 'User fetched successfully', data: user});
        }catch(err){
            console.error(err);
            res.status(500).json({msg:err.message});
        }
    }

    async changePassword(req, res){
        try{
            const {oldPassword, newPassword, confirmPassword} = req.body;
            const user = await User.findById(req.decoded.id);
            if(newPassword != confirmPassword){
                return res.status(400).json({msg: 'Passwords do not match'});
            }
            if(!await bcrypt.compare(oldPassword, user.password)){
                return res.status(400).json({msg: 'Invalid old password'});
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
            await user.save();
            res.status(200).json({msg: 'Password changed successfully'});
        }catch(err){
            console.error(err);
            res.status(500).json({msg:err.message});
        }
    }

    async banUser(req, res){
        try{
            const user = await User.findById(req.params.id);
            if(!user){
                return res.status(400).json({msg: 'User not found'});
            }
            user.trash = true;
            await user.save();
            res.status(200).json({msg: 'User banned successfully'});
        }catch(err){
            console.error(err);
            res.status(500).json({msg:err.message});
        }
    }

    async unBanUser(req, res){
        try{
            const user = await User.findById(req.params.id);
            if(!user){
                return res.status(400).json({msg: 'User not found'});
            }
            user.trash = false;
            await user.save();
            res.status(200).json({msg: 'User unbanned successfully'});
        }catch(err){
            console.error(err);
            res.status(500).json({msg:err.message});
        }
    }

    
    
}

