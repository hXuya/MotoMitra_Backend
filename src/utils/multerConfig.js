import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './images/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    // Get username and phone from the request body
    const username = req.body.username?.replace(/\s+/g, '_') || 'unknown';
    const phone = req.body.phone || '0000000000';

    // Format: profileImage-username-phone.ext
    const fileName = `profileImage-${username}-${phone}${ext}`;
    cb(null, fileName);
  }
});

const upload = multer({ storage });

export default upload;
