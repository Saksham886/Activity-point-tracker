const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads/'); // Uploads will be stored here
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Ensure unique filenames
  }
});

// File filter to allow only PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

// Initialize multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2 MB limit
});

// Middleware to handle file uploads and errors
const uploadMiddleware = (req, res, next) => {
  upload.single('certificate')(req, res, (err) => {
    if (err) {
      req.flash('error', err.message || 'File upload error!');
      return res.redirect('/dashboard/new'); // Redirect on error
    }
    next(); // Proceed if no error
  });
};

module.exports = uploadMiddleware;
