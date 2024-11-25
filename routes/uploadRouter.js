const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const uploadPath = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });


router.post('/upload-multiple', upload.array('images', 10), (req, res) => {
    const fileUrls = req.files.map((file) => {
        return `${req.protocol}://${req.get('host')}/file/${file.filename}`;
    });

    return res.status(200).json({
        message: 'Upload successful',
        status: true,
        data: fileUrls
    });
});

module.exports = router;
