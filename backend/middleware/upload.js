const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // You can further split by section/type if you want
    const uploadPath = path.join(__dirname, '../uploads');
    ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}-${file.fieldname}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept most docs/images; adjust as needed
  const allowed = [
    'image/png', 'image/jpeg', 'image/jpg', 'application/pdf'
  ];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('Only images and pdfs are allowed'), false);
  }
  cb(null, true);
};

const limits = {
  fileSize: 5 * 1024 * 1024 // 5MB
};

const upload = multer({ storage, fileFilter, limits });

module.exports = upload;
