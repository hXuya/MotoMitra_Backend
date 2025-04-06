import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../images'); // Use absolute path
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true }); // Ensure recursive creation
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const username = req.body.username?.replace(/\s+/g, '_') || 'unknown';
    const phone = req.body.phone || '0000000000';
    const fileName = `profileImage-${username}-${phone}${ext}`;
    cb(null, fileName);
  }
});

const upload = multer({ storage });

export default upload;
