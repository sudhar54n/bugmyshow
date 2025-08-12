import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
const router = express.Router();

// Unrestricted File Upload - Vulnerability #2
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Path Traversal in File Names - Vulnerability #2
    cb(null, file.originalname); // Vulnerable: No sanitization
  }
});

const upload = multer({ 
  storage: storage,
  // No file type or size restrictions - Vulnerable
});

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

router.post('/upload', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const user = await User.findById(req.user.userId);
    user.profile_picture = req.file.filename;
    await user.save();
    
    res.json({ 
      message: 'Profile picture uploaded successfully',
      filename: req.file.filename 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Broken Access Control - Vulnerability #5
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // No authorization check - anyone can view any profile
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;