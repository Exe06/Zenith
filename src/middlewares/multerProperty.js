import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', '..', 'public', 'img', 'properties'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
});

const fileFilter = (req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    const isPdf   = file.mimetype === 'application/pdf';
    cb(null, isImage || isPdf);
}

const upload = multer({
    storage,
    fileFilter,
});

export default upload;