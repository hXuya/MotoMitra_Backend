import User from '../model/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import {sendOtpToEmail} from '../utils/email.js';
import otpModel from '../model/otpModel.js';
import path from 'path';
import fs from 'fs';


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

    async loginUser(req, res) {
      const { identifier, password, role } = req.body;
    
      try {
        const user = await User.findOne({
          $or: [{ email: identifier }, { phone: identifier }]
        });
    
        if (!user) return res.status(400).json({ msg: 'User not found' });
        if (user.status === 'pending') return res.status(400).json({ msg: 'User not verified' });
        if (!user.isEmailVerified) {
          await sendOtpToEmail(user.email);
          return res.status(403).json({ msg: 'User email is not verified' });
        }
    
        if (!role && user.role !== 'user')
          return res.status(403).json({ msg: 'Only users can login from mobile app' });
    
        if (role && user.role !== role)
          return res.status(403).json({ msg: `Only ${role}s can login from web` });
    
        const isVerified = await bcrypt.compare(password, user.password);
        if (!isVerified) return res.status(400).json({ msg: 'Invalid credentials' });
    
        const payload = { id: user._id, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
    
        res.status(200).json({
          msg: 'User logged in successfully',
          data: user,
          token,
          role: user.role
        });
    
      } catch (err) {
        res.status(500).json({ msg: 'Server error' });
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
        const jwtToken = jwt.sign({id:user[0]._id}, process.env.JWT_SECRET, {expiresIn: '1d'});
        user[0].isEmailVerified = true;
        await user[0].save();
        res.status(200).json({msg: 'Email verified successfully', token:jwtToken});
    }

    async resendOtp(req, res) {
        const { email } = req.body;
    
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ msg: 'User not found' });
            }
    
            const existingOtp = await otpModel.findOne({ owner: user._id });
            if (existingOtp && existingOtp.expiry > new Date()) {
                await sendOtpToEmail(user.email);
                return res.status(200).json({ msg: 'OTP resent successfully' });
            }
    
            await sendOtpToEmail(user.email);
            res.status(200).json({ msg: 'OTP sent successfully' });
        } catch (err) {
            console.error(err.message);
            res.status(500).send({ msg: 'Server error' });
        }
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

    async updateProfile(req, res) {
      const { username, address, phone } = req.body;
      try {
        const user = await User.findById(req.decoded.id);
        if (!user) {
          if (req.file) {
            fs.unlinkSync(req.file.path);
          }
          return res.status(404).json({ msg: 'User not found' });
        }
    
        if (username) user.username = username;
        if (address) user.address = address;
        if (phone) user.phone = phone;
    
        if (req.file) {
          // Store path that matches the static serving URL
          user.profileImage = `/images/${req.file.filename}`;
        }
    
        await user.save();
        res.status(200).json({ 
          msg: 'Profile updated successfully', 
          data: { ...user.toObject(), password: undefined } 
        });
      } catch (err) {
        console.error('Update profile error:', err.message);
        if (req.file) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (unlinkErr) {
            console.error("Error deleting uploaded file after error:", unlinkErr);
          }
        }
        res.status(500).json({ msg: err.message });
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

    async forgetPassword(req, res){
      try{
        const {email} = req.body;
        const user = await User.find({email:email});
        if(user.length === 0){
            return res.status(400).json({msg: 'User not found'});
        }
        sendOtpToEmail(email);
        res.status(200).json({msg: 'OTP sent successfully'});
      }catch(err){
          console.error(err);
          res.status(500).json({msg:err.message});
      }
    }

    async changePasswordWithOtp(req, res){
      try{
        const {token, password, confirmPassword} = req.body;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if(!user){
            return res.status(400).json({msg: 'User not found'});
        }
        if(password != confirmPassword){
            return res.status(400).json({msg: 'Passwords do not match'});
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        res.status(200).json({msg: 'Password changed successfully'});
      }catch(err){
          console.error(err);
          res.status(500).json({msg:err.message});
      }
    }

    
    
}