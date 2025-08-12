import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Upload, Calendar, Ticket, DollarSign, Download } from 'lucide-react';

interface Booking {
  id: string;
  movie_title: string;
  seats: number;
  total_price: number;
  booking_date: string;
  show_time: string;
  payment_status: string;
}

export default function Profile() {
  const { user, token } = useAuth();
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadMessage, setUploadMessage] = useState('');
  const [downloadingTicket, setDownloadingTicket] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserBookings();
    }
  }, [user]);

  const fetchUserBookings = async () => {
    try {
      if (!user?.user_id) {
        console.log('No user_id available');
        setLoading(false);
        return;
      }
      
      const response = await fetch(`/api/bookings/user/${user?.user_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const bookings = await response.json();
        setUserBookings(bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const response = await fetch('/api/user/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setUploadMessage('Profile picture uploaded successfully!');
        setTimeout(() => setUploadMessage(''), 3000);
      } else {
        setUploadMessage('Upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadMessage('Upload failed. Please try again.');
    }
  };

  const downloadTicket = async (bookingId: string) => {
    setDownloadingTicket(bookingId);
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
    return <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-400">Please login to view your profile</p>
    </div>;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 border border-green-400 rounded-lg p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-12 w-12 text-black" />
                </div>
                <h2 className="text-2xl font-bold text-green-400">{user.username}</h2>
                <p className="text-gray-400">{user.email}</p>
                {user.isAdmin && (
                  <span className="inline-block bg-red-600 text-white px-2 py-1 rounded text-sm font-semibold mt-2">
                    Admin
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-green-400 text-sm font-medium mb-2">
                    Upload Profile Picture
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      accept="*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="profilePictureInput"
                    />
                    <label
                      htmlFor="profilePictureInput"
                      className="flex-1 bg-black border border-green-400 rounded px-3 py-2 text-green-400 cursor-pointer hover:border-green-300 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Choose File</span>
                    </label>
                  </div>
                  {uploadMessage && (
                    <p className={`text-sm mt-2 ${uploadMessage.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
                      {uploadMessage}
                    </p>
                  )}
                </div>

                <div className="border-t border-green-400 pt-4">
                  <h3 className="text-lg font-semibold text-green-400 mb-2">Account Stats</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Bookings:</span>
                      <span className="text-green-400">{userBookings.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Spent:</span>
                      <span className="text-green-400">
                        ${userBookings.reduce((sum, booking) => sum + booking.total_price, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* My Bookings */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 border border-green-400 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-green-400 mb-6 flex items-center space-x-2">
                <Ticket className="h-6 w-6" />
                <span>My Bookings</span>
              </h2>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="loading-spinner"></div>
                </div>
              ) : userBookings.length > 0 ? (
                <div className="space-y-4">
                  {userBookings.map(booking => (
                    <div key={booking.id} className="bg-black border border-gray-700 rounded-lg p-4 hover:border-green-400 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-green-400">
                          {booking.movie_title}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          booking.payment_status === 'confirmed' 
                            ? 'bg-green-600 text-black' 
                            : 'bg-yellow-600 text-black'
                        }`}>
                          {booking.payment_status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-1 text-gray-400">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(booking.booking_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-400">
                          <Ticket className="h-4 w-4" />
                          <span>{booking.seats} seat{booking.seats > 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-400">
                          <DollarSign className="h-4 w-4" />
                          <span>${booking.total_price}</span>
                        </div>
                        <div className="text-gray-400">
                          Show: {booking.show_time}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-700">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            Booking ID: {booking.id}
                          </span>
                          <button 
                            onClick={() => downloadTicket(booking.id)}
                            disabled={downloadingTicket === booking.id}
                            className="flex items-center space-x-1 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-black px-3 py-1 rounded text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Download className="h-3 w-3" />
                            <span>
                              {downloadingTicket === booking.id ? 'Generating...' : 'Download Ticket'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Ticket className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No bookings yet</p>
                  <p className="text-gray-500 text-sm">Start by booking your first movie!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}