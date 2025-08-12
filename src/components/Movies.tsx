import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Star, Clock, Users, Filter, Grid, List, Film } from 'lucide-react';

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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
    <div className="min-h-screen cinema-bg py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-6">
          <h1 className="text-5xl font-montserrat font-black text-gradient">
            {/* VULNERABLE: Reflected XSS - searchQuery displayed without sanitization */}
            {searchQuery ? (
              <span>
                Search Results for "
                <span dangerouslySetInnerHTML={{ __html: decodeURIComponent(searchQuery) }} />
                "
              </span>
            ) : 'All Movies'}
          </h1>
          
          <div className="flex items-center space-x-6">
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2 bg-bg-card rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-accent-pink text-white' 
                    : 'text-text-muted hover:text-accent-pink'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-accent-pink text-white' 
                    : 'text-text-muted hover:text-accent-pink'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            
            {/* Genre Filter */}
            <div className="flex items-center space-x-3">
              <Filter className="h-5 w-5 text-accent-pink" />
            <select
              value={selectedGenre}
              onChange={(e) => filterByGenre(e.target.value)}
              className="modern-input"
            >
              <option value="">All Genres</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              : "space-y-6"
          }>
            {filteredMovies.map((movie, index) => (
              viewMode === 'grid' ? (
                <div 
                  key={movie.id} 
                  className="modern-card movie-card fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative overflow-hidden">
                <img
                  src={movie.poster}
                  alt={movie.title}
                      className="w-full h-72 object-cover transition-transform duration-500 hover:scale-110"
                />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-accent-gold text-black px-3 py-1 rounded-full text-sm font-montserrat font-semibold">
                        {movie.genre}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-montserrat font-bold text-white mb-3 glitch-hover" data-text={movie.title}>
                    {movie.title}
                  </h3>
                    <p className="text-text-muted text-sm mb-4 line-clamp-2 font-roboto">
                    {movie.description}
                  </p>
                  
                    <div className="flex items-center justify-between text-sm text-text-muted mb-6">
                      <span className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-accent-gold" />
                        <span className="font-medium">{movie.rating}</span>
                    </span>
                      <span className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-accent-pink" />
                        <span>{movie.duration} min</span>
                    </span>
                      <span className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-accent-gold" />
                        <span>{movie.availableSeats} seats</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                      <div className="text-2xl font-montserrat font-bold text-gradient">
                      ₹{movie.price}
                      </div>
                    <Link
                      to={`/movies/${movie.id}`}
                        className="btn-secondary neon-glow-gold"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
                </div>
              ) : (
                <div 
                  key={movie.id} 
                  className="modern-card fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex flex-col md:flex-row gap-6 p-6">
                    <div className="md:w-48 flex-shrink-0">
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-full h-64 md:h-72 object-cover rounded-lg"
                      />
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-2xl font-montserrat font-bold text-white mb-2 glitch-hover" data-text={movie.title}>
                            {movie.title}
                          </h3>
                          <span className="bg-accent-gold text-black px-3 py-1 rounded-full text-sm font-montserrat font-semibold">
                            {movie.genre}
                          </span>
                        </div>
                        <div className="text-3xl font-montserrat font-bold text-gradient">
                          ₹{movie.price}
                        </div>
                      </div>
                      
                      <p className="text-text-muted font-roboto leading-relaxed">
                        {movie.description}
                      </p>
                      
                      <div className="flex items-center space-x-6 text-text-muted">
                        <span className="flex items-center space-x-2">
                          <Star className="h-4 w-4 text-accent-gold" />
                          <span className="font-medium">{movie.rating}</span>
                        </span>
                        <span className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-accent-pink" />
                          <span>{movie.duration} min</span>
                        </span>
                        <span className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-accent-gold" />
                          <span>{movie.availableSeats} seats available</span>
                        </span>
                      </div>
                      
                      <div className="pt-4">
                        <Link
                          to={`/movies/${movie.id}`}
                          className="btn-primary neon-glow"
                        >
                          Book Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        )}

        {!loading && filteredMovies.length === 0 && (
          <div className="text-center py-20 modern-card">
            <div className="w-24 h-24 bg-gradient-to-br from-accent-pink to-accent-gold rounded-full flex items-center justify-center mx-auto mb-6 opacity-50">
              <Film className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-montserrat font-bold text-white mb-4">No Movies Found</h3>
            <p className="text-text-muted text-lg font-roboto mb-8">
              {searchQuery ? `No results for "${searchQuery}"` : 'No movies match your current filters'}
            </p>
            <Link to="/movies" className="btn-primary neon-glow">
              View All Movies
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}