import multer from 'multer';
import path from 'path';

// Set up storage for images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './images/');  // Folder to save images 
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); // File name
    }
});

// Configure Multer
const upload = multer({ storage });

export default upload;
