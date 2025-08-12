import express from 'express';
const router = express.Router();

// Open Redirect - Vulnerability #8
router.get('/callback', (req, res) => {
  try {
    const { redirect } = req.query;
    
    // Vulnerable: No redirect URL validation
    if (redirect) {
      res.redirect(redirect); // Can redirect to any URL
    } else {
      res.redirect('/profile');
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;