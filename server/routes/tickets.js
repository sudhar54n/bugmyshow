import express from 'express';
import path from 'path';
import fs from 'fs';
import auth from '../middleware/auth.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
const router = express.Router();

// Generate PDF ticket - New functionality
router.get('/generate/:bookingId', auth, async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    // Get booking details
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Verify booking belongs to user (or user is admin)
    if (booking.user_id !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get user details
    const user = await User.findById(booking.user_id);
    
    // Generate ticket HTML
    const ticketHtml = generateTicketHtml({
      booking,
      user: user || { username: 'Unknown User' },
      bookingId
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
      }
    });
  } catch (error) {
    console.error('Error generating ticket:', error);
    res.status(500).json({ message: error.message });
  }
});

// Helper function to generate ticket HTML
function generateTicketHtml({ booking, user, bookingId }) {
  return `
    <div style="width: 400px; margin: 0 auto; font-family: 'Courier New', monospace; background: #000; color: #00ff41; border: 2px solid #00ff41; padding: 20px;">
      <div style="text-align: center; border-bottom: 1px dashed #00ff41; padding-bottom: 15px; margin-bottom: 15px;">
        <h1 style="margin: 0; font-size: 24px; color: #00ff41;">🎬 BUGMYSHOW</h1>
        <p style="margin: 5px 0; font-size: 12px; color: #00cc33;">DIGITAL CINEMA TICKET</p>
      </div>
      
      <div style="margin-bottom: 15px;">
        <h2 style="margin: 0 0 10px 0; font-size: 18px; color: #00ff41; text-transform: uppercase;">${booking.movie_title}</h2>
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
        <p style="margin: 5px 0 0 0; font-size: 10px; color: #00cc33;">ENJOY YOUR MOVIE!</p>
      </div>
      
      <div style="text-align: center; margin-top: 15px; font-size: 8px; color: #006600;">
        <p style="margin: 0;">⚠️ VULNERABLE SYSTEM - FOR EDUCATIONAL USE ONLY ⚠️</p>
      </div>
    </div>
  `;
}

// Directory Traversal - Vulnerability #7
router.get('/download', (req, res) => {
  try {
    const { file } = req.query;
    
    if (!file) {
      return res.status(400).json({ message: 'File parameter required' });
    }
    
    // Vulnerable: No path sanitization
    const filePath = path.join(__dirname, '../tickets/', file);
    
    // This allows accessing files outside the tickets directory
    // e.g., ?file=../../../etc/passwd
    
    if (fs.existsSync(filePath)) {
      res.download(filePath);
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;