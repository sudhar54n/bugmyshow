import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Ticket, Calendar, DollarSign, Download, Clock, Users } from 'lucide-react';

interface Booking {
  id: string;
  movie_title: string;
  seats: number;
  seat_numbers: string[];
  total_price: number;
  booking_date: string;
  show_time: string;
  payment_status: string;
}

export default function MyBookings() {
  const { user, token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingTicket, setDownloadingTicket] = useState<string | null>(null);
  const [showDownloadOptions, setShowDownloadOptions] = useState<string | null>(null);

  useEffect(() => {
    if (user?.user_id) {
      fetchBookings();
    }
  }, [user?.user_id]);

  const fetchBookings = async () => {
    try {
      const response = await fetch(`/api/bookings/user/${user?.user_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const bookingsData = await response.json();
        setBookings(bookingsData);
      } else {
        console.error('Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadTicket = async (bookingId: string, format: 'pdf' | 'jpg') => {
    setDownloadingTicket(bookingId);
    setShowDownloadOptions(null);
    try {
      const response = await fetch(`/api/tickets/generate/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Create a temporary div to render the ticket HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = data.ticketHtml;
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        document.body.appendChild(tempDiv);

        // Import jsPDF dynamically
        const { default: jsPDF } = await import('jspdf');
        const html2canvas = (await import('html2canvas')).default;

        // Convert HTML to canvas
        const canvas = await html2canvas(tempDiv.firstElementChild as HTMLElement, {
          backgroundColor: '#000000',
          scale: 2
        });

        if (format === 'pdf') {
          // Create PDF
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
          });

          const imgData = canvas.toDataURL('image/png');
          const imgWidth = 210; // A4 width in mm
          const pageHeight = 295; // A4 height in mm
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          let heightLeft = imgHeight;

          let position = 0;

          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;

          while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }

          // Download the PDF
          pdf.save(`ticket-${data.booking.movie_title.replace(/[^a-zA-Z0-9]/g, '-')}-${bookingId}.pdf`);
        } else {
          // Download as JPG
          const imgData = canvas.toDataURL('image/jpeg', 0.9);
          const link = document.createElement('a');
          link.download = `ticket-${data.booking.movie_title.replace(/[^a-zA-Z0-9]/g, '-')}-${bookingId}.jpg`;
          link.href = imgData;
          link.click();
        }


        // Clean up
        document.body.removeChild(tempDiv);
      } else {
        alert('Failed to generate ticket');
      }
    } catch (error) {
      console.error('Error downloading ticket:', error);
      alert('Failed to download ticket');
    } finally {
      setDownloadingTicket(null);
    }
  };

  const downloadTicket = async (bookingId: string, format: 'pdf' | 'jpg') => {
    setDownloadingTicket(bookingId);
    setShowDownloadOptions(null);
    try {
      const response = await fetch(`/api/tickets/generate/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Create a temporary div to render the ticket HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = data.ticketHtml;
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        document.body.appendChild(tempDiv);

        // Import jsPDF dynamically
        const { default: jsPDF } = await import('jspdf');
        const html2canvas = (await import('html2canvas')).default;

        // Convert HTML to canvas
        const canvas = await html2canvas(tempDiv.firstElementChild as HTMLElement, {
          backgroundColor: '#000000',
          scale: 2
        });

        if (format === 'pdf') {
          // Create PDF
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
          });

          const imgData = canvas.toDataURL('image/png');
          const imgWidth = 210; // A4 width in mm
          const pageHeight = 295; // A4 height in mm
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          let heightLeft = imgHeight;

          let position = 0;

          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;

          while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }

          // Download the PDF
          pdf.save(`ticket-${data.booking.movie_title.replace(/[^a-zA-Z0-9]/g, '-')}-${bookingId}.pdf`);
        } else {
          // Download as JPG
          const imgData = canvas.toDataURL('image/jpeg', 0.9);
          const link = document.createElement('a');
          link.download = `ticket-${data.booking.movie_title.replace(/[^a-zA-Z0-9]/g, '-')}-${bookingId}.jpg`;
          link.href = imgData;
          link.click();
        }


        // Clean up
        document.body.removeChild(tempDiv);
      } else {
        alert('Failed to generate ticket');
      }
    } catch (error) {
      console.error('Error downloading ticket:', error);
      alert('Failed to download ticket');
    } finally {
      setDownloadingTicket(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-400">Please login to view your bookings</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-400 flex items-center space-x-2">
            <Ticket className="h-8 w-8" />
            <span>My Bookings</span>
          </h1>
          <p className="text-gray-400 mt-2">View and download your movie tickets</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="loading-spinner"></div>
          </div>
        ) : bookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map(booking => (
              <div key={booking.id} className="bg-gray-900 border border-green-400 rounded-lg overflow-hidden hover:border-green-300 transition-all duration-300 transform hover:scale-105">
                {/* Ticket Header */}
                <div className="bg-green-600 text-black p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold truncate">
                      {booking.movie_title}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      booking.payment_status === 'confirmed' 
                        ? 'bg-black text-green-400' 
                        : 'bg-yellow-600 text-black'
                    }`}>
                      {booking.payment_status}
                    </span>
                  </div>
                </div>

                {/* Ticket Body */}
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Booking Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2 text-gray-300">
                        <Calendar className="h-4 w-4 text-green-400" />
                        <div>
                          <p className="text-green-400 font-semibold">Date</p>
                          <p>{new Date(booking.booking_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-300">
                        <Clock className="h-4 w-4 text-green-400" />
                        <div>
                          <p className="text-green-400 font-semibold">Show Time</p>
                          <p>{booking.show_time}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2 text-gray-300">
                        <Users className="h-4 w-4 text-green-400" />
                        <div>
                          <p className="text-green-400 font-semibold">Seats</p>
                          <p>{booking.seats} seat{booking.seats > 1 ? 's' : ''}</p>
                          {booking.seat_numbers && booking.seat_numbers.length > 0 && (
                            <p className="text-xs text-gray-400">
                              {booking.seat_numbers.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-300">
                        <DollarSign className="h-4 w-4 text-green-400" />
                        <div>
                          <p className="text-green-400 font-semibold">Total</p>
                          <p className="text-lg font-bold">${booking.total_price}</p>
                        </div>
                      </div>
                    </div>

                    {/* Booking ID */}
                    <div className="border-t border-gray-700 pt-4">
                      <p className="text-xs text-gray-500 mb-3">
                        Booking ID: {booking.id}
                      </p>
                      
                      {/* Download Options */}
                      <div className="relative">
                        {showDownloadOptions === booking.id ? (
                          <div className="space-y-2">
                            <button 
                              onClick={() => downloadTicket(booking.id, 'pdf')}
                              disabled={downloadingTicket === booking.id}
                              className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-500 disabled:bg-gray-600 text-white px-4 py-2 rounded font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Download className="h-4 w-4" />
                              <span>
                                {downloadingTicket === booking.id ? 'Generating PDF...' : 'Download as PDF'}
                              </span>
                            </button>
                            <button 
                              onClick={() => downloadTicket(booking.id, 'jpg')}
                              disabled={downloadingTicket === booking.id}
                              className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white px-4 py-2 rounded font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Download className="h-4 w-4" />
                              <span>
                                {downloadingTicket === booking.id ? 'Generating JPG...' : 'Download as JPG'}
                              </span>
                            </button>
                            <button 
                              onClick={() => setShowDownloadOptions(null)}
                              className="w-full bg-gray-600 hover:bg-gray-500 text-white px-4 py-1 rounded text-sm transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setShowDownloadOptions(booking.id)}
                            className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-500 text-black px-4 py-2 rounded font-semibold transition-colors"
                          >
                            <Download className="h-4 w-4" />
                            <span>Download Ticket</span>
                          </button>
                        )}
                      </div>
                              disabled={downloadingTicket === booking.id}
                              className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-500 disabled:bg-gray-600 text-white px-4 py-2 rounded font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Download className="h-4 w-4" />
                              <span>
                                {downloadingTicket === booking.id ? 'Generating PDF...' : 'Download as PDF'}
                              </span>
                            </button>
                            <button 
                              onClick={() => downloadTicket(booking.id, 'jpg')}
                              disabled={downloadingTicket === booking.id}
                              className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white px-4 py-2 rounded font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Download className="h-4 w-4" />
                              <span>
                                {downloadingTicket === booking.id ? 'Generating JPG...' : 'Download as JPG'}
                              </span>
                            </button>
                            <button 
                              onClick={() => setShowDownloadOptions(null)}
                              className="w-full bg-gray-600 hover:bg-gray-500 text-white px-4 py-1 rounded text-sm transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setShowDownloadOptions(booking.id)}
                            className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-500 text-black px-4 py-2 rounded font-semibold transition-colors"
                          >
                            <Download className="h-4 w-4" />
                            <span>Download Ticket</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ticket Footer - Decorative */}
                <div className="bg-black border-t border-green-400 border-dashed p-2">
                  <div className="text-center text-xs text-green-400 font-mono">
                    🎬 BUGMYSHOW DIGITAL TICKET 🎬
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Ticket className="h-24 w-24 text-gray-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-400 mb-4">No Bookings Yet</h2>
            <p className="text-gray-500 text-lg mb-8">Start by booking your first movie!</p>
            <a 
              href="/movies" 
              className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-500 text-black font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              <Ticket className="h-5 w-5" />
              <span>Browse Movies</span>
            </a>
          </div>
        )}

        {/* Stats Section */}
        {bookings.length > 0 && (
          <div className="mt-12 bg-gray-900 border border-green-400 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-green-400 mb-6">Booking Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {bookings.length}
                </div>
                <div className="text-gray-300">Total Bookings</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {bookings.reduce((sum, booking) => sum + booking.seats, 0)}
                </div>
                <div className="text-gray-300">Total Seats</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  ${bookings.reduce((sum, booking) => sum + booking.total_price, 0).toFixed(2)}
                </div>
                <div className="text-gray-300">Total Spent</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}