import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Star, Clock, Users, Film, Zap, Shield, Award } from 'lucide-react';

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
    <div className="min-h-screen cinema-bg">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary via-transparent to-bg-primary opacity-80"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-7xl font-montserrat font-black mb-6 text-gradient glitch-hover" data-text="BugMyShow">
            BugMyShow
          </h1>
          <p className="text-xl text-text-muted mb-8 max-w-3xl mx-auto font-roboto leading-relaxed">
            Experience the future of cinema booking with our cutting-edge platform. 
            Immerse yourself in the ultimate movie experience with premium seating and state-of-the-art technology.
          </p>
          <Link
            to="/movies"
            className="btn-primary neon-glow inline-flex items-center space-x-3 text-lg"
          >
            <Play className="h-6 w-6" />
            <span>Explore Movies</span>
          </Link>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-accent-pink opacity-20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-accent-gold opacity-20 rounded-full blur-xl animate-pulse delay-1000"></div>
      </section>

      {/* Featured Movies */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-montserrat font-bold text-gradient mb-4">
              Featured Movies
            </h2>
            <p className="text-text-muted text-lg font-roboto">
              Discover the latest blockbusters and timeless classics
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredMovies.map((movie, index) => (
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
                    <h3 className="text-2xl font-montserrat font-bold text-white mb-3 glitch-hover" data-text={movie.title}>
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
                      <div className="text-3xl font-montserrat font-bold text-gradient">
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
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-r from-bg-secondary to-bg-primary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-montserrat font-bold text-gradient mb-4">
              Why Choose BugMyShow?
            </h2>
            <p className="text-text-muted text-lg font-roboto">
              Experience cinema like never before
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="modern-card text-center p-8 neon-glow">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-pink to-accent-gold rounded-full flex items-center justify-center mx-auto mb-6">
                <Film className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-montserrat font-bold text-white mb-3">Premium Experience</h3>
              <p className="text-text-muted font-roboto">State-of-the-art theaters with cutting-edge technology</p>
            </div>
            
            <div className="modern-card text-center p-8 neon-glow">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-gold to-accent-pink rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-montserrat font-bold text-white mb-3">Instant Booking</h3>
              <p className="text-text-muted font-roboto">Lightning-fast booking system with real-time seat selection</p>
            </div>
            
            <div className="modern-card text-center p-8 neon-glow">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-pink to-accent-gold rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-montserrat font-bold text-white mb-3">Secure Platform</h3>
              <p className="text-text-muted font-roboto">Advanced security features for safe transactions</p>
            </div>
            
            <div className="modern-card text-center p-8 neon-glow">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-gold to-accent-pink rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-montserrat font-bold text-white mb-3">Best Prices</h3>
              <p className="text-text-muted font-roboto">Competitive pricing with exclusive member discounts</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="stats-card">
              <div className="text-4xl font-montserrat font-black text-gradient mb-2">10K+</div>
              <div className="text-text-muted font-roboto font-medium">Movies Streamed</div>
            </div>
            <div className="stats-card">
              <div className="text-4xl font-montserrat font-black text-gradient mb-2">50K+</div>
              <div className="text-text-muted font-roboto font-medium">Happy Customers</div>
            </div>
            <div className="stats-card">
              <div className="text-4xl font-montserrat font-black text-gradient mb-2">24/7</div>
              <div className="text-text-muted font-roboto font-medium">Customer Support</div>
            </div>
            <div className="stats-card">
              <div className="text-4xl font-montserrat font-black text-gradient mb-2">100%</div>
              <div className="text-text-muted font-roboto font-medium">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}