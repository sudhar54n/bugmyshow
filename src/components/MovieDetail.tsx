import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Star, Clock, Users, Calendar, MessageSquare, Monitor } from 'lucide-react';

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
        const multiplier = seat.type === 'vip' ? 1.5 : seat.type === 'premium' ? 1.2 : 1;
        return total + (movie.price * multiplier);
      }, 0);
      setTotalPrice(basePrice);
    } else {
      setTotalPrice(0);
    }
  }, [movie, selectedSeats]);

  const generateCinemaSeats = () => {
    const seats: Seat[] = [];
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const seatsPerRow = 12;
    
    rows.forEach((row, rowIndex) => {
      for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
        let seatType: 'regular' | 'premium' | 'vip' = 'regular';
        
        // VIP seats (front rows)
        if (rowIndex <= 2) {
          seatType = 'vip';
        }
        // Premium seats (middle rows)
        else if (rowIndex <= 5) {
          seatType = 'premium';
        }
        
        // Randomly occupy some seats for demo
        const isOccupied = Math.random() < 0.3;
        
        seats.push({
          id: `${row}${seatNum}`,
          row,
          number: seatNum,
          isOccupied,
          isSelected: false,
          type: seatType
        });
      }
    });
    
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
    if (seat.isSelected) return 'bg-green-500 border-green-300';
    
    switch (seat.type) {
      case 'vip': return 'bg-yellow-600 hover:bg-yellow-500 border-yellow-400';
      case 'premium': return 'bg-blue-600 hover:bg-blue-500 border-blue-400';
      default: return 'bg-gray-600 hover:bg-gray-500 border-gray-400';
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
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          comment: reviewComment,
          rating: reviewRating
        })
      });

      if (response.ok) {
        alert('Review added successfully!');
        setReviewComment('');
        setReviewRating(5);
        fetchMovie(); // Refresh movie data
      }
    } catch (error) {
      console.error('Error adding review:', error);
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
            <div className="bg-gray-900 border border-green-400 rounded-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold text-green-400 mb-4 flex items-center space-x-2">
                <Monitor className="h-5 w-5" />
                <span>Select Seats</span>
              </h2>
              
              {/* Screen */}
              <div className="mb-6">
                <div className="bg-gradient-to-r from-green-600 to-green-400 h-2 rounded-full mb-2"></div>
                <p className="text-center text-green-400 text-sm font-semibold">SCREEN</p>
              </div>

              {/* Seat Map */}
              <div className="mb-6">
                <div className="grid grid-cols-12 gap-1 text-xs">
                  {cinemaSeats.map((seat) => (
                    <button
                      key={seat.id}
                      onClick={() => toggleSeatSelection(seat.id)}
                      disabled={seat.isOccupied}
                      className={`
                        w-6 h-6 rounded-t-lg border text-xs font-bold transition-all duration-200
                        ${getSeatColor(seat)}
                        ${seat.isSelected ? 'transform scale-110' : ''}
                      `}
                      title={`${seat.id} - ${seat.type} ${seat.isOccupied ? '(Occupied)' : ''}`}
                    >
                      {seat.number}
                    </button>
                  ))}
                </div>
                
                {/* Row Labels */}
                <div className="grid grid-cols-12 gap-1 mt-1">
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map((row, index) => (
                    <div key={row} className="text-center text-green-400 text-xs font-bold">
                      {index === 0 && row}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="mb-6 space-y-2">
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-4 h-4 bg-gray-600 rounded-t border border-gray-400"></div>
                  <span className="text-gray-300">Regular (${movie.price})</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-4 h-4 bg-blue-600 rounded-t border border-blue-400"></div>
                  <span className="text-gray-300">Premium (+20%)</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-4 h-4 bg-yellow-600 rounded-t border border-yellow-400"></div>
                  <span className="text-gray-300">VIP (+50%)</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-4 h-4 bg-red-600 rounded-t"></div>
                  <span className="text-gray-300">Occupied</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-4 h-4 bg-green-500 rounded-t border border-green-300"></div>
                  <span className="text-gray-300">Selected</span>
                </div>
              </div>

              {/* Selected Seats Info */}
              {selectedSeats.length > 0 && (
                <div className="mb-4 p-3 bg-black border border-green-400 rounded">
                  <h4 className="text-green-400 font-semibold mb-2">Selected Seats:</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedSeats.map(seat => (
                      <span key={seat.id} className="bg-green-600 text-black px-2 py-1 rounded text-xs font-semibold">
                        {seat.id}
                      </span>
                    ))}
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