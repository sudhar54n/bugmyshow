import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Star, Clock, Users, Filter } from 'lucide-react';

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

export default function Movies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      searchMovies(searchQuery);
    }
  }, [searchQuery]);

  const fetchMovies = async () => {
    try {
      const response = await fetch('/api/movies');
      if (response.ok) {
        const moviesData = await response.json();
        setMovies(moviesData);
        setFilteredMovies(moviesData);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchMovies = async (query: string) => {
    try {
      const response = await fetch(`/api/movies/search?q=${query}`);
      if (response.ok) {
        const data = await response.json();
        setFilteredMovies(data.results || []);
      }
    } catch (error) {
      console.error('Error searching movies:', error);
    }
  };

  const filterByGenre = (genre: string) => {
    setSelectedGenre(genre);
    if (genre === '') {
      setFilteredMovies(movies);
    } else {
      const filtered = movies.filter(movie => movie.genre.toLowerCase() === genre.toLowerCase());
      setFilteredMovies(filtered);
    }
  };

  const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Thriller'];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-green-400">
            {/* VULNERABLE: Reflected XSS - searchQuery displayed without sanitization */}
            {searchQuery ? (
              <span dangerouslySetInnerHTML={{ 
                __html: `Search Results for "${searchQuery}"` 
              }}></span>
            ) : 'All Movies'}
          </h1>
          
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-green-400" />
            <select
              value={selectedGenre}
              onChange={(e) => filterByGenre(e.target.value)}
              className="bg-gray-900 border border-green-400 rounded px-3 py-2 text-green-400 focus:outline-none focus:border-green-300"
            >
              <option value="">All Genres</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMovies.map(movie => (
              <div key={movie.id} className="bg-gray-900 border border-green-400 rounded-lg overflow-hidden hover:border-green-300 transition-all duration-300 transform hover:scale-105">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-64 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-green-400 mb-2 truncate">
                    {movie.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {movie.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-green-300 mb-3">
                    <span className="flex items-center space-x-1">
                      <Star className="h-3 w-3" />
                      <span>{movie.rating}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{movie.duration}m</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{movie.availableSeats}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-green-400">
                      ${movie.price}
                    </span>
                    <Link
                      to={`/movies/${movie.id}`}
                      className="bg-green-600 hover:bg-green-500 text-black px-3 py-1 rounded text-sm font-semibold transition-colors"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredMovies.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No movies found.</p>
          </div>
        )}
      </div>
    </div>
  );
}