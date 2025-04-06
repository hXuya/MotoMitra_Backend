import User from '../model/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { sendOtpToEmail } from '../utils/email.js';
import otpModel from '../model/otpModel.js';
import upload from '../utils/multerConfig.js';
import path from 'path';
import fs from 'fs';  // Add import for fs

export default class UserController {
    async registerUser(req, res) {
        const { username, email, password, role, phone } = req.body;

        try {
            // Check if user already exists
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ msg: 'User already exists' });
            }

            // Create a new user instance
            if (role == "garage") {
                user = new User({
                    username,
                    email,
                    password,
                    phone,
                    role,
                    status: "active"
                });
            } else {
                user = new User({
                    username,
                    email,
                    phone,
                    password,
                    status: 'active'
                });
            }

            // Hash the password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            // Save the user to the database
            if (await user.save()) {
                sendOtpToEmail(email);
            }

            res.status(201).json({ msg: 'User registered successfully', data: user });
        } catch (err) {
            console.error(err.message);
            res.status(500).send({ msg: err.message });
        }
    };

    async loginUser(req, res) {
        const { identifier, password } = req.body;

        try {
            // Check if user exists by email or phone
            const user = await User.findOne({
                $or: [{ email: identifier }, { phone: identifier }]
            });

            if (!user) {
                return res.status(400).json({ msg: 'User not found' });
            }

            if (user.status === 'pending') {
                return res.status(400).json({ msg: 'User not verified' });
            }

            if (!user.isEmailVerified) {
                await sendOtpToEmail(user.email);
                return res.status(403).json({ msg: 'User email is not verified' });
            }

            const isVerified = await bcrypt.compare(password, user.password);
            if (!isVerified) {
                return res.status(400).json({ msg: 'Invalid credentials' });
            }

            const payload = {
                id: user._id,
                role: user.role
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: '1d'
            });

            res.status(200).json({
                msg: 'User logged in successfully',
                data: user,
                token,
                role: user.role
            });

        } catch (err) {
            console.error(err.message);
            res.status(500).send({ msg: 'Server error' });
        }
    }

    async loggedInUser(req, res) {
        try {
            let user = await User.findById(req.decoded.id).select('-password');
            res.status(200).json({ msg: 'User fetched successfully', data: user });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }

    async verifyEmail(req, res) {
        const { email, otp } = req.body;
        const user = await User.find({ email: email });
        if (user.length === 0) {
            return res.status(400).json({ msg: 'User not found' });
        }
        const otpData = await otpModel.findOne({ owner: user[0]._id, otp: otp });
        if (!otpData) {
            return res.status(400).json({ msg: 'Invalid OTP' });
        }
        if (otpData.expiry < new Date()) {
            return res.status(400).json({ msg: 'OTP expired' });
        }
        user[0].isEmailVerified = true;
        await user[0].save();
        res.status(200).json({ msg: 'Email verified successfully' });
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

    async getProfileDetail(req, res) {
        try {
            const user = await User.findById(req.decoded.id).select('-password');
            res.status(200).json({ msg: 'User fetched successfully', data: user });
        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: err.message });
        }
    }

    async updateProfile(req, res) {
        const { username, address, phone } = req.body;
      
        try {
          // Find the user by ID
          const user = await User.findById(req.decoded.id);
          if (!user) {
            return res.status(404).json({ msg: 'User not found' });
          }
      
          // Update user fields if provided
          if (username) user.username = username;
          if (address) user.address = address;
          if (phone) user.phone = phone;
      
          // Check if a new profile image is provided in the request
          if (req.file) {
            const ext = path.extname(req.file.originalname); // Extract file extension
            const email = (user.email || 'unknown').split('@')[0].toLowerCase(); // Extract part before '@' from email
            const newFileName = `userImage-${email}${ext}`; // Generate new filename
            const newPath = path.join(imagesDir, newFileName); // Set new path for the image
      
            // Rename the uploaded file to match the new filename
            fs.renameSync(req.file.path, newPath);
      
            // Update the user's profileImage field in the database with the new file path
            user.profileImage = `images/${newFileName}`; // Assuming the 'images' folder is public
          }
      
          // Save the updated user data to the database
          await user.save();
      
          // Respond with success message and updated user data
          res.status(200).json({ msg: 'Profile updated successfully', data: user });
        } catch (err) {
          console.error(err); // Log the error
          res.status(500).json({ msg: `Server error: ${err.message}` });
        }
      }
      

    async changePassword(req, res) {
        try {
            const { oldPassword, newPassword, confirmPassword } = req.body;
            const user = await User.findById(req.decoded.id);
            if (newPassword !== confirmPassword) {
                return res.status(400).json({ msg: 'Passwords do not match' });
            }
            if (!await bcrypt.compare(oldPassword, user.password)) {
                return res.status(400).json({ msg: 'Invalid old password' });
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
            await user.save();
            res.status(200).json({ msg: 'Password changed successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: err.message });
        }
    }

    async banUser(req, res) {
        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(400).json({ msg: 'User not found' });
            }
            user.trash = true;
            await user.save();
            res.status(200).json({ msg: 'User banned successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: err.message });
        }
    }

    async unBanUser(req, res) {
        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(400).json({ msg: 'User not found' });
            }
            user.trash = false;
            await user.save();
            res.status(200).json({ msg: 'User unbanned successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: err.message });
        }
    }
}
