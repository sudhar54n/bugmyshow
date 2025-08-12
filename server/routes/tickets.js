import express from 'express';
import Booking from '../models/Booking.js';
import Movie from '../models/Movie.js';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import { supabase } from '../config/database.js';
const router = express.Router();

// Generate sequential ticket number for new bookings
const generateTicketNumber = async (bookingId) => {
  try {
    if (!supabase) return null;
    
    // Get the highest ticket number and increment
    const { data: lastTicket } = await supabase
      .from('ticket_numbers')
      .select('ticket_number')
      .order('ticket_number', { ascending: false })
      .limit(1)
      .single();
    
    const nextTicketNumber = lastTicket ? lastTicket.ticket_number + 1 : 1001;
    
    // Insert new ticket number
    const { data, error } = await supabase
      .from('ticket_numbers')
      .insert({
        booking_id: bookingId,
        ticket_number: nextTicketNumber
      })
      .select()
      .single();
    
    if (error) throw error;
    return data.ticket_number;
  } catch (error) {
    console.error('Error generating ticket number:', error);
    return null;
  }
};

// Get ticket number for booking
const getTicketNumber = async (bookingId) => {
  try {
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('ticket_numbers')
      .select('ticket_number')
      .eq('booking_id', bookingId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No ticket number exists, generate one
        return await generateTicketNumber(bookingId);
      }
      throw error;
    }
    
    return data.ticket_number;
  } catch (error) {
    console.error('Error getting ticket number:', error);
    return null;
  }
};

// Generate PDF ticket - New functionality
router.get('/generate/:bookingId', auth, async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    // Get booking details
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Get user details
    const user = await User.findById(booking.user_id);
    
    // Get or generate ticket number
    const ticketNumber = await getTicketNumber(bookingId);
    
    // Generate ticket HTML
    const ticketHtml = generateTicketHtml({
      booking,
      user: user || { username: 'Unknown User' },
      bookingId,
      ticketNumber
    });
    
    res.json({
      success: true,
      ticketHtml,
      booking: {
        id: booking.id,
        movie_title: booking.movie_title,
        seats: booking.seats,
        seat_numbers: booking.seat_numbers,
        show_time: booking.show_time,
        booking_date: booking.booking_date,
        total_price: booking.total_price
      },
      user: {
        username: user?.username || 'Unknown User'
      },
      ticketNumber
    });
  } catch (error) {
    console.error('Error generating ticket:', error);
    res.status(500).json({ message: error.message });
  }
});

// Helper function to generate ticket HTML
function generateTicketHtml({ booking, user, bookingId, ticketNumber }) {
  return `
    <div style="width: 400px; margin: 0 auto; font-family: 'Courier New', monospace; background: #000; color: #00ff41; border: 2px solid #00ff41; padding: 20px;">
      <div style="text-align: center; border-bottom: 1px dashed #00ff41; padding-bottom: 15px; margin-bottom: 15px;">
        <h1 style="margin: 0; font-size: 24px; color: #00ff41;">🎬 BUGMYSHOW</h1>
        <p style="margin: 5px 0; font-size: 12px; color: #00cc33;">DIGITAL CINEMA TICKET</p>
        ${ticketNumber ? `<p style="margin: 5px 0; font-size: 14px; color: #ff0000; font-weight: bold;">TICKET #${ticketNumber}</p>` : ''}
      </div>
      
      <div style="margin-bottom: 15px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #00cc33;">MOVIE:</span>
          <span style="color: #00ff41; font-weight: bold;">${booking.movie_title}</span>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #00cc33;">SHOW TIME:</span>
          <span style="color: #00ff41; font-weight: bold;">${new Date(booking.show_time).toLocaleString()}</span>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #00cc33;">CUSTOMER:</span>
          <span style="color: #00ff41; font-weight: bold;">${user.username}</span>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #00cc33;">PRICE:</span>
          <span style="color: #00ff41; font-weight: bold;">₹${booking.total_price}</span>
        </div>
      </div>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
        <span style="color: #00cc33;">SEATS:</span>
        <span style="color: #00ff41; font-weight: bold;">${booking.seat_numbers ? booking.seat_numbers.join(', ') : booking.seats + ' SEAT(S)'}</span>
      </div>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
        <span style="color: #00cc33;">USER ID:</span>
        <span style="color: #00ff41; font-weight: bold;">${user.user_id || 'N/A'}</span>
      </div>
      
      <div style="border-top: 1px dashed #00ff41; padding-top: 15px; text-align: center;">
        <p style="margin: 0; font-size: 10px; color: #00cc33;">BOOKING ID: ${bookingId}</p>
        ${ticketNumber ? `<p style="margin: 5px 0 0 0; font-size: 10px; color: #ff0000;">TICKET NUMBER: ${ticketNumber}</p>` : ''}
        <p style="margin: 5px 0 0 0; font-size: 10px; color: #00cc33;">ENJOY YOUR MOVIE!</p>
      </div>
      
      <div style="text-align: center; margin-top: 15px; padding-top: 10px; border-top: 1px dashed #00ff41;">
        <div style="font-size: 20px; letter-spacing: 2px; color: #00ff41;">||||| ||||| |||||</div>
        <p style="margin: 5px 0 0 0; font-size: 8px; color: #00cc33;">SCAN AT ENTRANCE</p>
      </div>
    </div>
  `;
}

// IDOR Vulnerability - Access any ticket by ticket number
router.get('/by-number/:ticketNumber', auth, async (req, res) => {
  try {
    const { ticketNumber } = req.params;
    
    if (!supabase) {
      return res.status(500).json({ message: 'Database not available' });
    }
    
    // VULNERABLE: No ownership verification - any authenticated user can access any ticket
    const { data: ticketData, error } = await supabase
      .from('ticket_numbers')
      .select('booking_id')
      .eq('ticket_number', ticketNumber)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Ticket not found' });
      }
      throw error;
    }
    
    // Get booking details (no ownership check - VULNERABLE)
    const booking = await Booking.findById(ticketData.booking_id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Get user details
    const user = await User.findById(booking.user_id);
    
    // Generate ticket HTML
    const ticketHtml = generateTicketHtml({
      booking,
      user: user || { username: 'Unknown User' },
      bookingId: booking.id,
      ticketNumber: parseInt(ticketNumber)
    });
    
    res.json({
      success: true,
      ticketHtml,
      booking: {
        id: booking.id,
        movie_title: booking.movie_title,
        seats: booking.seats,
        seat_numbers: booking.seat_numbers,
        show_time: booking.show_time,
        booking_date: booking.booking_date,
        total_price: booking.total_price
      },
      user: {
        username: user?.username || 'Unknown User',
        user_id: user?.user_id
      },
      ticketNumber: parseInt(ticketNumber)
    });
  } catch (error) {
    console.error('Error accessing ticket by number:', error);
    res.status(500).json({ message: error.message });
  }
});

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