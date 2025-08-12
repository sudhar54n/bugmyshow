import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Star, Clock, Users, Calendar, MessageSquare, Monitor, Ticket } from 'lucide-react';

interface Movie {
  id: string;
  title: string;
  description: string;
  genre: string;
  duration: number;
  rating: string;
  poster: string;
  price: number;
  availableSeats: number;
  reviews: Array<{
    user: string;
    comment: string;
    rating: number;
    date: string;
  }>;
}

interface Seat {
  id: string;
  row: string;
  number: number;
  isOccupied: boolean;
  isSelected: boolean;
  type: 'regular' | 'premium' | 'vip';
}

interface Booking {
  id: string;
  movie_title: string;
  seats: number;
  total_price: number;
  booking_date: string;
  show_time: string;
  payment_status: string;
}

export default function MovieDetail() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [cinemaSeats, setCinemaSeats] = useState<Seat[]>([]);
  const [showTime, setShowTime] = useState('19:00');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (id) {
      fetchMovie();
      generateCinemaSeats();
    }
  }, [id]);

  useEffect(() => {
    if (movie && selectedSeats.length > 0) {
      const basePrice = selectedSeats.reduce((total, seat) => {
        let multiplier = 1;
        if (seat.type === 'vip') multiplier = 1.5; // First Class
        else if (seat.type === 'premium') multiplier = 1.2; // Premium
        else if (seat.row === 'K') multiplier = 0.7; // Second Class
        else multiplier = 1; // Regular
        return total + (movie.price * multiplier);
      }, 0);
      setTotalPrice(basePrice);
    } else {
      setTotalPrice(0);
    }
  }, [movie, selectedSeats]);

  const generateCinemaSeats = () => {
    const seats: Seat[] = [];
    
    // First Class section (2 rows, 13 seats each)
    const firstClassRows = ['A', 'B'];
    firstClassRows.forEach((row, rowIndex) => {
      for (let seatNum = 1; seatNum <= 13; seatNum++) {
        const isOccupied = Math.random() < 0.2; // Less occupied in first class
        seats.push({
          id: `${row}${seatNum}`,
          row,
          number: seatNum,
          isOccupied,
          isSelected: false,
          type: 'vip'
        });
      }
    });
    
    // Premium section (6 rows, 13 seats each with center aisle)
    const premiumRows = ['C', 'D', 'E', 'F', 'G', 'H'];
    premiumRows.forEach((row, rowIndex) => {
      for (let seatNum = 1; seatNum <= 13; seatNum++) {
        const isOccupied = Math.random() < 0.3;
        seats.push({
          id: `${row}${seatNum}`,
          row,
          number: seatNum,
          isOccupied,
          isSelected: false,
          type: 'premium'
        });
      }
    });
    
    // Regular section (2 rows, 13 seats each)
    const regularRows = ['I', 'J'];
    regularRows.forEach((row, rowIndex) => {
      for (let seatNum = 1; seatNum <= 13; seatNum++) {
        const isOccupied = Math.random() < 0.4; // More occupied in regular
        seats.push({
          id: `${row}${seatNum}`,
          row,
          number: seatNum,
          isOccupied,
          isSelected: false,
          type: 'regular'
        });
      }
    });
    
    // Second Class section (1 row, 9 seats - center seats only)
    const secondClassRow = 'K';
    for (let seatNum = 3; seatNum <= 11; seatNum++) {
      if (seatNum >= 5 && seatNum <= 9) { // Only center seats
        const isOccupied = Math.random() < 0.5;
        seats.push({
          id: `${secondClassRow}${seatNum}`,
          row: secondClassRow,
          number: seatNum,
          isOccupied,
          isSelected: false,
          type: 'regular'
        });
      }
    }
    
    setCinemaSeats(seats);
  };

  const toggleSeatSelection = (seatId: string) => {
    const seat = cinemaSeats.find(s => s.id === seatId);
    if (!seat || seat.isOccupied) return;
    
    setCinemaSeats(prev => prev.map(s => 
      s.id === seatId ? { ...s, isSelected: !s.isSelected } : s
    ));
    
    setSelectedSeats(prev => {
      const isCurrentlySelected = prev.some(s => s.id === seatId);
      if (isCurrentlySelected) {
        return prev.filter(s => s.id !== seatId);
      } else {
        return [...prev, { ...seat, isSelected: true }];
      }
    });
  };

  const getSeatColor = (seat: Seat) => {
    if (seat.isOccupied) return 'bg-red-600 cursor-not-allowed';
    if (seat.isSelected) return 'bg-green-500 border-2 border-green-300 shadow-lg shadow-green-500/50';
    
    switch (seat.type) {
      case 'vip': return 'bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 border border-yellow-400 shadow-md';
      case 'premium': return 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 border border-blue-400 shadow-md';
      default: return 'bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-400 hover:to-gray-500 border border-gray-400 shadow-md';
    }
  };

  const fetchMovie = async () => {
    try {
      const response = await fetch(`/api/movies/${id}`);
      if (response.ok) {
        const movieData = await response.json();
        setMovie({
          ...movieData,
          reviews: Array.isArray(movieData.reviews) ? movieData.reviews : []
        });
      }
    } catch (error) {
      console.error('Error fetching movie:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (selectedSeats.length === 0) {
      alert('Please select at least one seat');
      return;
    }

    try {
      // Reserve seats first
      const reserveResponse = await fetch('/api/bookings/reserve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          movieId: id,
          seats: selectedSeats.length
        })
      });

      if (!reserveResponse.ok) {
        alert('Failed to reserve seats');
        return;
      }

      // Create booking
      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          movieId: id,
          seats: selectedSeats.length,
          seatNumbers: selectedSeats.map(s => s.id),
          total_price: totalPrice, // Client-controlled price (vulnerable)
          show_time: showTime
        })
      });

      if (bookingResponse.ok) {
        const booking = await bookingResponse.json();
        alert('Booking successful!');
        navigate('/profile');
      } else {
        alert('Booking failed');
      }
    } catch (error) {
      console.error('Error booking movie:', error);
      alert('Booking failed');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to add a review');
      return;
    }

    try {
      const response = await fetch(`/api/movies/${id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          user: user.username,
          comment: reviewComment,
          rating: reviewRating
        })
      });

      let data;
      try {
        data = await response.json();
      } catch {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned non-JSON response');
      }

      if (response.ok) {
        alert('Review added successfully!');
        setReviewComment('');
        setReviewRating(5);
        fetchMovie(); // Refresh movie data
      } else {
        console.error('Review submission failed:', data);
        alert('Failed to add review. Please try again.');
      }
    } catch (error) {
      console.error('Error adding review:', error);
      alert('Failed to add review. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-400">Movie not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Movie Info */}
          <div className="xl:col-span-2">
            <div className="bg-gray-900 border border-green-400 rounded-lg overflow-hidden">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full h-96 object-cover"
              />
              <div className="p-6">
                <h1 className="text-3xl font-bold text-green-400 mb-4">
                  {movie.title}
                </h1>
                
                <div className="flex items-center space-x-6 text-green-300 mb-6">
                  <span className="flex items-center space-x-1">
                    <Star className="h-5 w-5" />
                    <span>{movie.rating}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="h-5 w-5" />
                    <span>{movie.duration} minutes</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Users className="h-5 w-5" />
                    <span>{movie.availableSeats} seats available</span>
                  </span>
                  <span className="bg-green-600 text-black px-2 py-1 rounded text-sm font-semibold">
                    {movie.genre}
                  </span>
                </div>
                
                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  {movie.description}
                </p>

                <div className="text-3xl font-bold text-green-400 mb-6">
                  ₹{movie.price} per ticket
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-8 bg-gray-900 border border-green-400 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-green-400 mb-6 flex items-center space-x-2">
                <MessageSquare className="h-6 w-6" />
                <span>Reviews</span>
              </h3>

              {/* Add Review Form */}
              {user && (
                <form onSubmit={handleReviewSubmit} className="mb-8 border-b border-green-400 pb-6">
                  <div className="mb-4">
                    <label className="block text-green-400 text-sm font-medium mb-2">
                      Your Review
                    </label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-black border border-green-400 rounded text-green-400 placeholder-green-600 focus:outline-none focus:border-green-300"
                      placeholder="Share your thoughts about this movie..."
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="text-green-400 text-sm font-medium">Rating:</label>
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="bg-black border border-green-400 rounded px-2 py-1 text-green-400"
                    >
                      {[1,2,3,4,5].map(num => (
                        <option key={num} value={num}>{num} Star{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-500 text-black px-4 py-1 rounded font-semibold transition-colors"
                    >
                      Submit Review
                    </button>
                  </div>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {Array.isArray(movie.reviews) && movie.reviews.length > 0 ? (
                  movie.reviews.map((review, index) => (
                    <div key={index} className="bg-black border border-gray-700 rounded p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-green-400 font-semibold">{review.user}</span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <span className="text-green-300">{review.rating}/5</span>
                        </div>
                      </div>
                      {/* VULNERABLE: Stored XSS - review.comment rendered without sanitization */}
                      <p className="text-gray-300" dangerouslySetInnerHTML={{ __html: review.comment }}></p>
                      <p className="text-gray-500 text-sm mt-2">
                        {new Date(review.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No reviews yet. Be the first to review!</p>
                )}
              </div>
            </div>
          </div>

          {/* Cinema Hall Seat Selection */}
          <div className="xl:col-span-1">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-green-400 rounded-xl p-6 sticky top-4 shadow-2xl">
              <h2 className="text-2xl font-bold text-green-400 mb-6 flex items-center space-x-2">
                <Monitor className="h-5 w-5" />
                <span>Select Seats</span>
              </h2>
              
              {/* Screen */}
              <div className="mb-8">
                <div className="relative">
                  <div className="bg-gradient-to-r from-transparent via-blue-400 to-transparent h-16 rounded-t-full mb-3 opacity-60 shadow-lg shadow-blue-400/30"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent h-1 top-6 rounded-full opacity-40"></div>
                </div>
                <p className="text-center text-blue-300 text-sm font-semibold mb-2">All eyes this way please</p>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent mb-4"></div>
              </div>

              {/* First Class Section */}
              <div className="mb-8">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-yellow-400 mb-1">₹{(movie.price * 1.5).toFixed(0)} FIRST CLASS</h3>
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-50"></div>
                </div>
                <div className="space-y-2">
                  {['A', 'B'].map(row => (
                    <div key={row} className="flex justify-center gap-1">
                      {cinemaSeats
                        .filter(seat => seat.row === row)
                        .map((seat) => (
                          <button
                            key={seat.id}
                            onClick={() => toggleSeatSelection(seat.id)}
                            disabled={seat.isOccupied}
                            className={`
                              w-8 h-8 rounded-lg text-xs font-bold transition-all duration-300 transform hover:scale-110
                              ${getSeatColor(seat)}
                              ${seat.isSelected ? 'scale-110 ring-2 ring-green-400' : ''}
                            `}
                            title={`${seat.id} - First Class ${seat.isOccupied ? '(Occupied)' : ''}`}
                          >
                            {seat.number}
                          </button>
                        ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Premium Section */}
              <div className="mb-8">
                <div className="space-y-2">
                  {['C', 'D', 'E', 'F', 'G', 'H'].map(row => (
                    <div key={row} className="flex justify-center gap-1">
                      {/* Left side seats */}
                      <div className="flex gap-1">
                        {cinemaSeats
                          .filter(seat => seat.row === row && seat.number <= 6)
                          .map((seat) => (
                            <button
                              key={seat.id}
                              onClick={() => toggleSeatSelection(seat.id)}
                              disabled={seat.isOccupied}
                              className={`
                                w-7 h-7 rounded-lg text-xs font-bold transition-all duration-300 transform hover:scale-110
                                ${getSeatColor(seat)}
                                ${seat.isSelected ? 'scale-110 ring-2 ring-green-400' : ''}
                              `}
                              title={`${seat.id} - Premium ${seat.isOccupied ? '(Occupied)' : ''}`}
                            >
                              {seat.number}
                            </button>
                          ))}
                      </div>
                      
                      {/* Center aisle */}
                      <div className="w-4"></div>
                      
                      {/* Right side seats */}
                      <div className="flex gap-1">
                        {cinemaSeats
                          .filter(seat => seat.row === row && seat.number > 6)
                          .map((seat) => (
                            <button
                              key={seat.id}
                              onClick={() => toggleSeatSelection(seat.id)}
                              disabled={seat.isOccupied}
                              className={`
                                w-7 h-7 rounded-lg text-xs font-bold transition-all duration-300 transform hover:scale-110
                                ${getSeatColor(seat)}
                                ${seat.isSelected ? 'scale-110 ring-2 ring-green-400' : ''}
                              `}
                              title={`${seat.id} - Premium ${seat.isOccupied ? '(Occupied)' : ''}`}
                            >
                              {seat.number}
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Regular Section */}
              <div className="mb-8">
                <div className="space-y-2">
                  {['I', 'J'].map(row => (
                    <div key={row} className="flex justify-center gap-1">
                      {/* Left side seats */}
                      <div className="flex gap-1">
                        {cinemaSeats
                          .filter(seat => seat.row === row && seat.number <= 6)
                          .map((seat) => (
                            <button
                              key={seat.id}
                              onClick={() => toggleSeatSelection(seat.id)}
                              disabled={seat.isOccupied}
                              className={`
                                w-7 h-7 rounded-lg text-xs font-bold transition-all duration-300 transform hover:scale-110
                                ${getSeatColor(seat)}
                                ${seat.isSelected ? 'scale-110 ring-2 ring-green-400' : ''}
                              `}
                              title={`${seat.id} - Regular ${seat.isOccupied ? '(Occupied)' : ''}`}
                            >
                              {seat.number}
                            </button>
                          ))}
                      </div>
                      
                      {/* Center aisle */}
                      <div className="w-4"></div>
                      
                      {/* Right side seats */}
                      <div className="flex gap-1">
                        {cinemaSeats
                          .filter(seat => seat.row === row && seat.number > 6)
                          .map((seat) => (
                            <button
                              key={seat.id}
                              onClick={() => toggleSeatSelection(seat.id)}
                              disabled={seat.isOccupied}
                              className={`
                                w-7 h-7 rounded-lg text-xs font-bold transition-all duration-300 transform hover:scale-110
                                ${getSeatColor(seat)}
                                ${seat.isSelected ? 'scale-110 ring-2 ring-green-400' : ''}
                              `}
                              title={`${seat.id} - Regular ${seat.isOccupied ? '(Occupied)' : ''}`}
                            >
                              {seat.number}
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Second Class Section */}
              <div className="mb-6">
                <div className="text-center mb-4">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent mb-2"></div>
                  <h3 className="text-lg font-bold text-gray-400 mb-1">₹{(movie.price * 0.7).toFixed(0)} SECOND CLASS</h3>
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent opacity-50"></div>
                </div>
                <div className="flex justify-center gap-1">
                  {cinemaSeats
                    .filter(seat => seat.row === 'K')
                    .map((seat) => (
                      <button
                        key={seat.id}
                        onClick={() => toggleSeatSelection(seat.id)}
                        disabled={seat.isOccupied}
                        className={`
                          w-7 h-7 rounded-lg text-xs font-bold transition-all duration-300 transform hover:scale-110
                          ${getSeatColor(seat)}
                          ${seat.isSelected ? 'scale-110 ring-2 ring-green-400' : ''}
                        `}
                        title={`${seat.id} - Second Class ${seat.isOccupied ? '(Occupied)' : ''}`}
                      >
                        {seat.number}
                      </button>
                    ))}
                </div>
              </div>

              {/* Legend */}
              <div className="mb-6 space-y-3 bg-black/30 rounded-lg p-4">
                <h4 className="text-sm font-bold text-green-400 mb-3">Seat Legend</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded border border-yellow-400"></div>
                    <span className="text-gray-300">First Class (+50%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded border border-blue-400"></div>
                    <span className="text-gray-300">Premium (+20%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gradient-to-br from-gray-500 to-gray-600 rounded border border-gray-400"></div>
                    <span className="text-gray-300">Regular</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-600 rounded"></div>
                    <span className="text-gray-300">Occupied</span>
                  </div>
                  <div className="flex items-center space-x-2 col-span-2">
                    <div className="w-4 h-4 bg-green-500 rounded border-2 border-green-300"></div>
                    <span className="text-gray-300">Selected</span>
                  </div>
                </div>
              </div>

              {/* Selected Seats Info */}
              {selectedSeats.length > 0 && (
                <div className="mb-6 p-4 bg-gradient-to-r from-green-900/30 to-green-800/30 border border-green-400 rounded-lg">
                  <h4 className="text-green-400 font-semibold mb-3 flex items-center space-x-2">
                    <Ticket className="h-4 w-4" />
                    <span>Selected Seats</span>
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedSeats.map(seat => (
                      <div key={seat.id} className="bg-green-600/20 border border-green-500 text-green-400 px-2 py-1 rounded text-xs font-semibold text-center">
                        {seat.id}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-green-400/30">
                    <div className="text-xs text-gray-400 space-y-1">
                      {selectedSeats.map(seat => {
                        const multiplier = seat.type === 'vip' ? 1.5 : seat.type === 'premium' ? 1.2 : seat.type === 'regular' && seat.row === 'K' ? 0.7 : 1;
                        const seatPrice = movie.price * multiplier;
                        return (
                          <div key={seat.id} className="flex justify-between">
                            <span>{seat.id} ({seat.type === 'vip' ? 'First Class' : seat.type === 'premium' ? 'Premium' : seat.row === 'K' ? 'Second Class' : 'Regular'})</span>
                            <span>₹{seatPrice.toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Booking Panel */}
          <div className="xl:col-span-1">
            <div className="bg-gray-900 border border-green-400 rounded-lg p-6 sticky top-4">
              <h2 className="text-2xl font-bold text-green-400 mb-6">Book Tickets</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-green-400 text-sm font-medium mb-2">
                    Show Time
                  </label>
                  <select
                    value={showTime}
                    onChange={(e) => setShowTime(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-green-400 rounded text-green-400 focus:outline-none focus:border-green-300"
                  >
                    <option value="14:00">2:00 PM</option>
                    <option value="17:00">5:00 PM</option>
                    <option value="19:00">7:00 PM</option>
                    <option value="22:00">10:00 PM</option>
                  </select>
                </div>

                <div className="border-t border-green-400 pt-4">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-green-300">Selected seats:</span>
                      <span className="text-green-400 font-semibold">{selectedSeats.length}</span>
                    </div>
                    {selectedSeats.length > 0 && (
                      <div className="text-xs text-gray-400">
                        {selectedSeats.map(seat => {
                          const multiplier = seat.type === 'vip' ? 1.5 : seat.type === 'premium' ? 1.2 : 1;
                          return (
                            <div key={seat.id} className="flex justify-between">
                              <span>{seat.id} ({seat.type})</span>
                              <span>₹{(movie.price * multiplier).toFixed(2)}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <div className="flex justify-between items-center border-t border-green-400 pt-2">
                      <span className="text-green-300 font-semibold">Total:</span>
                      <span className="text-green-400 font-bold text-xl">₹{totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleBooking}
                  disabled={selectedSeats.length === 0}
                  className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-bold py-3 px-4 rounded transition-colors flex items-center justify-center space-x-2"
                >
                  <Calendar className="h-5 w-5" />
                  <span>Book Now</span>
                </button>

                {!user && (
                  <p className="text-yellow-400 text-sm text-center">
                    Please login to book tickets
                  </p>
                )}
                
                {selectedSeats.length === 0 && user && (
                  <p className="text-yellow-400 text-sm text-center">
                    Please select seats to continue
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}