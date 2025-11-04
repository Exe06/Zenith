import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let uploadPath = '';

      if (file.fieldname === 'escritura') {
        uploadPath = path.join(__dirname, '..', '..', 'storage', 'escritura');
      } else if (file.fieldname === 'images') {
        uploadPath = path.join(__dirname, '..', '..', 'public', 'img', 'properties');
      } else {
        return cb(new Error('Campo de archivo no válido'), null);
      }
      
      cb(null, uploadPath);
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
  limits: { fileSize: 10 * 1024 * 1024 }
});

export const uploadPropertyFiles = upload.fields([
  { name: 'escritura', maxCount: 1 },
  { name: 'images', maxCount: 10 } // Asumo 10 imágenes máx.
]);