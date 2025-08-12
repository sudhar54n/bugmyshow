import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Plus, Edit, Trash2, Eye } from 'lucide-react';

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
}

export default function Admin() {
  const { user } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [newMovie, setNewMovie] = useState({
    title: '',
    description: '',
    genre: '',
    duration: 0,
    rating: '',
    poster: '',
    price: 0,
    availableSeats: 0
  });

  useEffect(() => {
    if (user?.isAdmin) {
      fetchMovies();
    }
  }, [user?.isAdmin]);

  const fetchMovies = async () => {
    try {
      const response = await fetch('/api/admin/movies', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const moviesData = await response.json();
        setMovies(moviesData);
      } else if (response.status === 403) {
        alert('Admin access required');
      } else {
        console.error('Failed to fetch movies');
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/movies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newMovie)
      });

      if (response.ok) {
        alert('Movie added successfully');
        setShowAddMovie(false);
        setNewMovie({
          title: '',
          description: '',
          genre: '',
          duration: 0,
          rating: '',
          poster: '',
          price: 0,
          availableSeats: 0
        });
        fetchMovies();
      }
    } catch (error) {
      console.error('Error adding movie:', error);
    }
  };

  const handleEditMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMovie) return;

    try {
      const response = await fetch(`/api/admin/movies/${editingMovie.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editingMovie)
      });

      if (response.ok) {
        alert('Movie updated successfully');
        setEditingMovie(null);
        fetchMovies();
      }
    } catch (error) {
      console.error('Error updating movie:', error);
    }
  };

  const handleDeleteMovie = async (movieId: string) => {
    if (!confirm('Are you sure you want to delete this movie?')) return;

    try {
      const response = await fetch(`/api/admin/movies/${movieId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        alert('Movie deleted successfully');
        fetchMovies();
      }
    } catch (error) {
      console.error('Error deleting movie:', error);
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-red-400" />
            <h2 className="mt-6 text-3xl font-bold text-red-400 mb-4">
              Access Denied
            </h2>
            <p className="text-gray-400 mb-6">
              You need admin privileges to access this panel.
            </p>
            <div className="bg-gray-900 border border-red-400 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-300 mb-2">To access admin panel:</p>
              <p className="text-green-400 font-mono text-sm">
                Login with: <strong>admin / admin123</strong>
              </p>
            </div>
            <Link 
              to="/login" 
              className="inline-block bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded font-semibold transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-red-400 flex items-center space-x-2">
            <Shield className="h-8 w-8" />
            <span>Admin Panel</span>
          </h1>
          <button
            onClick={() => setShowAddMovie(true)}
            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Movie</span>
          </button>
        </div>

        {/* Movies Table */}
        <div className="bg-gray-900 border border-red-400 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-red-600 text-black">
              <tr>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Genre</th>
                <th className="px-4 py-3 text-left">Duration</th>
                <th className="px-4 py-3 text-left">Price</th>
                <th className="px-4 py-3 text-left">Seats</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {movies.map(movie => (
                <tr key={movie.id} className="border-b border-gray-700 hover:bg-gray-800">
                  <td className="px-4 py-3 text-green-400">{movie.title}</td>
                  <td className="px-4 py-3 text-gray-300">{movie.genre}</td>
                  <td className="px-4 py-3 text-gray-300">{movie.duration}m</td>
                  <td className="px-4 py-3 text-gray-300">₹{movie.price}</td>
                  <td className="px-4 py-3 text-gray-300">{movie.availableSeats}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingMovie(movie)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMovie(movie.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Movie Modal */}
        {showAddMovie && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-red-400 rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
              <h2 className="text-2xl font-bold text-red-400 mb-4">Add New Movie</h2>
              <form onSubmit={handleAddMovie} className="space-y-4">
                <input
                  type="text"
                  placeholder="Title"
                  value={newMovie.title}
                  onChange={(e) => setNewMovie({...newMovie, title: e.target.value})}
                  required
                  className="w-full px-3 py-2 bg-black border border-red-400 rounded text-red-400 placeholder-red-600 focus:outline-none focus:border-red-300"
                />
                <textarea
                  placeholder="Description"
                  value={newMovie.description}
                  onChange={(e) => setNewMovie({...newMovie, description: e.target.value})}
                  required
                  rows={3}
                  className="w-full px-3 py-2 bg-black border border-red-400 rounded text-red-400 placeholder-red-600 focus:outline-none focus:border-red-300"
                />
                <input
                  type="text"
                  placeholder="Genre"
                  value={newMovie.genre}
                  onChange={(e) => setNewMovie({...newMovie, genre: e.target.value})}
                  required
                  className="w-full px-3 py-2 bg-black border border-red-400 rounded text-red-400 placeholder-red-600 focus:outline-none focus:border-red-300"
                />
                <input
                  type="number"
                  placeholder="Duration (minutes)"
                  value={newMovie.duration}
                  onChange={(e) => setNewMovie({...newMovie, duration: Number(e.target.value)})}
                  required
                  className="w-full px-3 py-2 bg-black border border-red-400 rounded text-red-400 placeholder-red-600 focus:outline-none focus:border-red-300"
                />
                <input
                  type="text"
                  placeholder="Rating (e.g., PG-13)"
                  value={newMovie.rating}
                  onChange={(e) => setNewMovie({...newMovie, rating: e.target.value})}
                  required
                  className="w-full px-3 py-2 bg-black border border-red-400 rounded text-red-400 placeholder-red-600 focus:outline-none focus:border-red-300"
                />
                <input
                  type="url"
                  placeholder="Poster URL"
                  value={newMovie.poster}
                  onChange={(e) => setNewMovie({...newMovie, poster: e.target.value})}
                  required
                  className="w-full px-3 py-2 bg-black border border-red-400 rounded text-red-400 placeholder-red-600 focus:outline-none focus:border-red-300"
                />
                <input
                  type="number"
                  placeholder="Price"
                  step="0.01"
                  value={newMovie.price}
                  onChange={(e) => setNewMovie({...newMovie, price: Number(e.target.value)})}
                  required
                  className="w-full px-3 py-2 bg-black border border-red-400 rounded text-red-400 placeholder-red-600 focus:outline-none focus:border-red-300"
                />
                <input
                  type="number"
                  placeholder="Available Seats"
                  value={newMovie.availableSeats}
                  onChange={(e) => setNewMovie({...newMovie, availableSeats: Number(e.target.value)})}
                  required
                  className="w-full px-3 py-2 bg-black border border-red-400 rounded text-red-400 placeholder-red-600 focus:outline-none focus:border-red-300"
                />
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded transition-colors"
                  >
                    Add Movie
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddMovie(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Movie Modal */}
        {editingMovie && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-red-400 rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
              <h2 className="text-2xl font-bold text-red-400 mb-4">Edit Movie</h2>
              <form onSubmit={handleEditMovie} className="space-y-4">
                <input
                  type="text"
                  placeholder="Title"
                  value={editingMovie.title}
                  onChange={(e) => setEditingMovie({...editingMovie, title: e.target.value})}
                  required
                  className="w-full px-3 py-2 bg-black border border-red-400 rounded text-red-400 placeholder-red-600 focus:outline-none focus:border-red-300"
                />
                <textarea
                  placeholder="Description"
                  value={editingMovie.description}
                  onChange={(e) => setEditingMovie({...editingMovie, description: e.target.value})}
                  required
                  rows={3}
                  className="w-full px-3 py-2 bg-black border border-red-400 rounded text-red-400 placeholder-red-600 focus:outline-none focus:border-red-300"
                />
                <input
                  type="text"
                  placeholder="Genre"
                  value={editingMovie.genre}
                  onChange={(e) => setEditingMovie({...editingMovie, genre: e.target.value})}
                  required
                  className="w-full px-3 py-2 bg-black border border-red-400 rounded text-red-400 placeholder-red-600 focus:outline-none focus:border-red-300"
                />
                <input
                  type="number"
                  placeholder="Duration (minutes)"
                  value={editingMovie.duration}
                  onChange={(e) => setEditingMovie({...editingMovie, duration: Number(e.target.value)})}
                  required
                  className="w-full px-3 py-2 bg-black border border-red-400 rounded text-red-400 placeholder-red-600 focus:outline-none focus:border-red-300"
                />
                <input
                  type="text"
                  placeholder="Rating (e.g., PG-13)"
                  value={editingMovie.rating}
                  onChange={(e) => setEditingMovie({...editingMovie, rating: e.target.value})}
                  required
                  className="w-full px-3 py-2 bg-black border border-red-400 rounded text-red-400 placeholder-red-600 focus:outline-none focus:border-red-300"
                />
                <input
                  type="url"
                  placeholder="Poster URL"
                  value={editingMovie.poster}
                  onChange={(e) => setEditingMovie({...editingMovie, poster: e.target.value})}
                  required
                  className="w-full px-3 py-2 bg-black border border-red-400 rounded text-red-400 placeholder-red-600 focus:outline-none focus:border-red-300"
                />
                <input
                  type="number"
                  placeholder="Price"
                  step="0.01"
                  value={editingMovie.price}
                  onChange={(e) => setEditingMovie({...editingMovie, price: Number(e.target.value)})}
                  required
                  className="w-full px-3 py-2 bg-black border border-red-400 rounded text-red-400 placeholder-red-600 focus:outline-none focus:border-red-300"
                />
                <input
                  type="number"
                  placeholder="Available Seats"
                  value={editingMovie.availableSeats}
                  onChange={(e) => setEditingMovie({...editingMovie, availableSeats: Number(e.target.value)})}
                  required
                  className="w-full px-3 py-2 bg-black border border-red-400 rounded text-red-400 placeholder-red-600 focus:outline-none focus:border-red-300"
                />
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded transition-colors"
                  >
                    Update Movie
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingMovie(null)}
                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}