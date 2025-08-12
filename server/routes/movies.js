import express from 'express';
import Movie from '../models/Movie.js';
import auth from '../middleware/auth.js';
const router = express.Router();

// Get all movies
router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reflected XSS - Vulnerability #3
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.json([]);
    }
    
    const movies = await Movie.find({
      title: { $regex: q }
    });
    
    // Vulnerable: Reflecting user input without sanitization
    res.json({
      query: q, // VULNERABLE: Direct reflection - XSS possible with <script>alert('XSS')</script>
      results: movies
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single movie
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    
    // Ensure reviews is always an array
    if (typeof movie.reviews === 'string') {
      try {
        movie.reviews = JSON.parse(movie.reviews);
      } catch (e) {
        movie.reviews = [];
      }
    }
    if (!Array.isArray(movie.reviews)) {
      movie.reviews = [];
    }
    
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Stored XSS - Vulnerability #3
router.post('/:id/review', auth, async (req, res) => {
  try {
    const { comment, rating } = req.body;
    const movieId = req.params.id;
    
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    
    // Ensure reviews is always an array before pushing
    if (!Array.isArray(movie.reviews)) {
      movie.reviews = [];
    }
    
    // Vulnerable: No input sanitization - Stored XSS
    movie.reviews.push({
      user: req.user.username,
      comment: comment, // Direct storage without sanitization
      rating: rating,
      date: new Date()
    });
    
    await movie.save();
    
    res.json({ message: 'Review added successfully' });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;