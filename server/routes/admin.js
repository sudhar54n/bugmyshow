import express from 'express';
import Movie from '../models/Movie.js';
import auth from '../middleware/auth.js';
const router = express.Router();

// Hardcoded Credentials - Vulnerability #6
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Vulnerable: Hardcoded admin credentials
    if (username === 'admin' && password === 'admin123') {
      res.json({ 
        message: 'Admin login successful',
        isAdmin: true 
      });
    } else {
      res.status(401).json({ message: 'Invalid admin credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all movies for admin management
router.get('/movies', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const movies = await Movie.find();
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new movie
router.post('/movies', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { title, description, genre, duration, rating, poster, price, availableSeats } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    const movie = new Movie({
      title,
      description,
      genre,
      duration,
      rating,
      poster,
      price,
      available_seats: availableSeats
    });
    
    await movie.save();
    res.status(201).json({ message: 'Movie added successfully', movie });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update movie
router.put('/movies/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { id } = req.params;
    const { title, description, genre, duration, rating, poster, price, availableSeats } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    const updates = {
      title,
      description,
      genre,
      duration,
      rating,
      poster,
      price,
      available_seats: availableSeats
    };
    
    const movie = await Movie.findByIdAndUpdate(id, updates, { new: true });
    
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    
    res.json({ message: 'Movie updated successfully', movie });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete movie
router.delete('/movies/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const movie = await Movie.findByIdAndDelete(req.params.id);
    
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    
    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;