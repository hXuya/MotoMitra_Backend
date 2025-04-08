import multer from 'multer';
import path from 'path';
import fs from 'fs';
import User from '../model/userModel.js';

const UPLOAD_DIR = './src/uploads/';

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: async (req, file, cb) => {
    try {
      if (!req.decoded || !req.decoded.id) {
        return cb(new Error('User not authenticated'));
      }
      
      const user = await User.findById(req.decoded.id);
      if (!user || !user.email) {
        return cb(new Error('User not found'));
      }
      
      const emailUsername = user.email.split('@')[0];
      const fileExt = path.extname(file.originalname);
      const filename = `profileImage-${emailUsername}${fileExt}`;
      
      const files = fs.readdirSync(UPLOAD_DIR);
      files.forEach(file => {
        if (file.startsWith(`profileImage-${emailUsername}`)) {
          fs.unlinkSync(path.join(UPLOAD_DIR, file));
        }
      });
      
      cb(null, filename);
    } catch (error) {
      cb(error);
    }
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /\.(jpeg|jpg|png|gif)$/i;
  
  if (allowedExtensions.test(file.originalname)) {
    return cb(null, true);
  }
  
  cb(new Error(`File type not allowed. Only JPEG, JPG, PNG, and GIF files are accepted.`));
};

const upload = multer({ 
  storage,
  fileFilter
});

export default upload;