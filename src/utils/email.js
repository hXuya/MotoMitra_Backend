import nodemailer from 'nodemailer';
import otpModel from '../model/otpModel.js';
import "dotenv/config";
import userModel from '../model/userModel.js';

const userEmail = process.env.EMAIL;
const appPassword = process.env.APP_PASSWORD;

function generateRandomSixDigitNumber(){
    return Math.floor(100000 + Math.random() * 900000);
}


export async function sendOtpToEmail( email) {
  
    const user = await userModel.find({email:email});
    if(user.length === 0){
        return false;
    }
    const otp = generateRandomSixDigitNumber();
    const expiry = new Date(new Date().getTime() + 5 * 60000);
    const response = await otpModel.create({owner:user[0]._id, expiry:expiry, otp:otp});
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Use your email provider's service (e.g., Outlook, Yahoo, etc.)
        auth: {
            user: userEmail, // Your email address
            pass: appPassword  // Your email password or app-specific password
        }
    });
    
    // Email options
    const mailOptions = {
        from: userEmail,
        to: email,
        subject: 'OTP Verification Code!',
        text: `Your OTP verification code is ${otp}`
    };
    
    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error occurred:', error);
            return true;
        } else {
            console.log('Email sent:', info.response);
            return true;
        }
    });

    
}