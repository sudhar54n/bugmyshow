import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Film, User, LogOut, Shield, Search, Ticket, Menu, X } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/movies?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="header-blur sticky top-0 z-50 border-b border-accent-pink/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 text-gradient hover:scale-105 transition-transform duration-300"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-accent-pink to-accent-gold rounded-lg flex items-center justify-center">
              <Film className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-montserrat font-black glitch-hover" data-text="BugMyShow">
              BugMyShow
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movies..."
                  className="modern-input w-64 pl-10 pr-4 py-2"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
              </div>
            </form>

            {/* Navigation Links */}
            <nav className="flex items-center space-x-6">
              <Link 
                to="/movies" 
                className="text-text-primary hover:text-accent-pink transition-colors font-montserrat font-medium"
              >
                Movies
              </Link>
              
              {user ? (
                <>
                  <Link 
                    to="/my-bookings" 
                    className="flex items-center space-x-2 text-text-primary hover:text-accent-gold transition-colors font-montserrat font-medium"
                  >
                    <Ticket className="h-4 w-4" />
                    <span>My Bookings</span>
                  </Link>
                  
                  <Link 
                    to="/profile" 
                    className="flex items-center space-x-2 text-text-primary hover:text-accent-pink transition-colors font-montserrat font-medium"
                  >
                    <User className="h-4 w-4" />
                    <span>{user.username}</span>
                  </Link>
                  
                  {user.isAdmin && (
                    <Link 
                      to="/admin" 
                      className="flex items-center space-x-2 text-accent-pink hover:text-white transition-colors font-montserrat font-medium"
                    >
                      <Shield className="h-4 w-4" />
                      <span>Admin</span>
                    </Link>
                  )}
                  
                  <button
                    onClick={logout}
                    className="btn-outline flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-outline">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary">
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-text-primary hover:text-accent-pink transition-colors"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-accent-pink/20">
            <div className="pt-4 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search movies..."
                    className="modern-input w-full pl-10 pr-4 py-2"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
                </div>
              </form>

              {/* Mobile Navigation */}
              <nav className="flex flex-col space-y-3">
                <Link 
                  to="/movies" 
                  className="text-text-primary hover:text-accent-pink transition-colors font-montserrat font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Movies
                </Link>
                
                {user ? (
                  <>
                    <Link 
                      to="/my-bookings" 
                      className="flex items-center space-x-2 text-text-primary hover:text-accent-gold transition-colors font-montserrat font-medium py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Ticket className="h-4 w-4" />
                      <span>My Bookings</span>
                    </Link>
                    
                    <Link 
                      to="/profile" 
                      className="flex items-center space-x-2 text-text-primary hover:text-accent-pink transition-colors font-montserrat font-medium py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      <span>{user.username}</span>
                    </Link>
                    
                    {user.isAdmin && (
                      <Link 
                        to="/admin" 
                        className="flex items-center space-x-2 text-accent-pink hover:text-white transition-colors font-montserrat font-medium py-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Shield className="h-4 w-4" />
                        <span>Admin</span>
                      </Link>
                    )}
                    
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="btn-outline flex items-center space-x-2 justify-center mt-4"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col space-y-3 mt-4">
                    <Link 
                      to="/login" 
                      className="btn-outline text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link 
                      to="/register" 
                      className="btn-primary text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </div>
                )}
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}