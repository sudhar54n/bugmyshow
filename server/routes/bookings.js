import express from 'express';
import Booking from '../models/Booking.js';
import Movie from '../models/Movie.js';
import auth from '../middleware/auth.js';
const router = express.Router();

// Price Manipulation - Vulnerability #4
router.post('/', auth, async (req, res) => {
  try {
    const { movieId, seats, totalPrice, showTime } = req.body;
    
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    
    // Vulnerable: Trusting client-side price calculation
    // No server-side price validation
    
    const booking = new Booking({
      user_id: req.user.user_id,
      movie_id: movieId,
      movie_title: movie.title,
      seats,
      seat_numbers: req.body.seatNumbers || [],
      total_price: totalPrice, // Vulnerable: Direct use of client-provided price
      show_time: showTime
    });
    
    await booking.save();
    
    res.status(201).json({ 
      message: 'Booking created successfully',
      bookingId: booking.id 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Race Condition - Vulnerability #4  
router.post('/reserve', auth, async (req, res) => {
  try {
    const { movieId, seats } = req.body;
    
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    
    // Vulnerable: No atomic operations - Race condition possible
    if (movie.available_seats >= seats) {
      // Delay to increase race condition window
      await new Promise(resolve => setTimeout(resolve, 100));
      
      movie.available_seats -= seats;
      await movie.save();
      
      res.json({ message: 'Seats reserved successfully' });
    } else {
      res.status(400).json({ message: 'Not enough seats available' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// IDOR - Vulnerability #4
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vulnerable: No ownership verification
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Sensitive Data Exposure - Vulnerability #5
router.get('/', async (req, res) => {
  try {
    // Vulnerable: Returns all bookings regardless of authentication
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's bookings
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const userIdParam = req.params.userId;
    if (!userIdParam || userIdParam === 'undefined') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    const bookings = await Booking.find({ user_id: userIdParam });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;