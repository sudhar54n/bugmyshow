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
    if (!req.user.isAdmin && req.user.username !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { title, description, genre, duration, rating, poster, price, availableSeats } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    if (!price || price <= 0) {
      return res.status(400).json({ message: 'Valid price is required' });
    }
    
    if (!availableSeats || availableSeats <= 0) {
      return res.status(400).json({ message: 'Valid seat count is required' });
    }
    
    const movie = new Movie({
      title,
      description,
      genre: genre || 'Unknown',
      duration: duration || 120,
      rating: rating || 'PG',
      poster: poster || 'https://via.placeholder.com/300x450?text=No+Poster',
      price: parseFloat(price),
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
    if (!req.user.isAdmin && req.user.username !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { id } = req.params;
    const { title, description, genre, duration, rating, poster, price, availableSeats } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    if (price && price <= 0) {
      return res.status(400).json({ message: 'Valid price is required' });
    }
    
    if (availableSeats && availableSeats <= 0) {
      return res.status(400).json({ message: 'Valid seat count is required' });
    }
    
    const updates = {
      title,
      description: description || '',
      genre: genre || 'Unknown',
      duration: duration || 120,
      rating: rating || 'PG',
      poster: poster || 'https://via.placeholder.com/300x450?text=No+Poster',
      price: price ? parseFloat(price) : undefined,
      available_seats: availableSeats || undefined
    };
    
    // Remove undefined values
    Object.keys(updates).forEach(key => {
      if (updates[key] === undefined) {
        delete updates[key];
      }
    });
    
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
    if (!req.user.isAdmin && req.user.username !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const movie = await Movie.findByIdAndDelete(req.params.id);
    
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    
    res.json({ message: 'Movie deleted successfully', deletedMovie: movie });
  } catch (error) {
    console.error('Error deleting movie:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;