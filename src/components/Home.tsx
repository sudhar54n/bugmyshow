import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Star, Clock, Users } from 'lucide-react';

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

export default function Home() {
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedMovies();
  }, []);

  const fetchFeaturedMovies = async () => {
    try {
      const response = await fetch('/api/movies');
      if (response.ok) {
        const movies = await response.json();
        setFeaturedMovies(movies.slice(0, 6));
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-black via-gray-900 to-black py-20">
        <div className="absolute inset-0 bg-matrix-pattern opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-6xl font-bold mb-6 glitch-text">
            Welcome to BugMyShow
          </h1>
          <p className="text-xl text-green-300 mb-8 max-w-2xl mx-auto">
            The ultimate movie booking experience with cutting-edge security features.
            Book your tickets and dive into the digital cinema world.
          </p>
          <Link
            to="/movies"
            className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-500 text-black font-semibold px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            <Play className="h-5 w-5" />
            <span>Browse Movies</span>
          </Link>
        </div>
      </section>

      {/* Featured Movies */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-green-400">
            Featured Movies
          </h2>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredMovies.map(movie => (
                <div key={movie.id} className="bg-black border border-green-400 rounded-lg overflow-hidden hover:border-green-300 transition-all duration-300 transform hover:scale-105">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-green-400 mb-2">
                      {movie.title}
                    </h3>
                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                      {movie.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-green-300 mb-4">
                      <span className="flex items-center space-x-1">
                        <Star className="h-4 w-4" />
                        <span>{movie.rating}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{movie.duration} min</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{movie.availableSeats} seats</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-green-400">
                        ${movie.price}
                      </span>
                      <Link
                        to={`/movies/${movie.id}`}
                        className="bg-green-600 hover:bg-green-500 text-black px-4 py-2 rounded font-semibold transition-colors"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="bg-gray-900 border border-green-400 rounded-lg p-6">
              <div className="text-3xl font-bold text-green-400 mb-2">10K+</div>
              <div className="text-gray-300">Movies Streamed</div>
            </div>
            <div className="bg-gray-900 border border-green-400 rounded-lg p-6">
              <div className="text-3xl font-bold text-green-400 mb-2">50K+</div>
              <div className="text-gray-300">Happy Users</div>
            </div>
            <div className="bg-gray-900 border border-green-400 rounded-lg p-6">
              <div className="text-3xl font-bold text-green-400 mb-2">24/7</div>
              <div className="text-gray-300">Support</div>
            </div>
            <div className="bg-gray-900 border border-green-400 rounded-lg p-6">
              <div className="text-3xl font-bold text-green-400 mb-2">100%</div>
              <div className="text-gray-300">Secure</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}