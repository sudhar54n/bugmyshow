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
    <header className="header-blur sticky top-0 z-50 border-b border-green-400/30 terminal-window">
      <div className="terminal-header">
        root@bugmyshow:~$ ./start_cinema_server --vulnerable-mode
      </div>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 hover:scale-105 transition-transform duration-300"
          >
            <div className="w-10 h-10 bg-black border border-green-400 rounded flex items-center justify-center terminal-window">
              <Film className="h-6 w-6 text-green-400" />
            </div>
            <span className="text-2xl font-mono font-black hacker-glitch text-green-400" data-text="BugMyShow">
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
                  placeholder="root@search:~$ find movies..."
                  className="bg-black border border-green-400 text-green-400 placeholder-green-600 w-full pl-10 pr-4 py-2 rounded font-mono text-sm focus:outline-none focus:border-green-300 focus:shadow-[0_0_10px_rgba(0,255,65,0.3)]"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-400" />
              </div>
            </form>

            {/* Navigation Links */}
            <nav className="flex items-center space-x-6">
              <Link 
                to="/movies" 
                className="text-green-400 hover:text-green-300 transition-colors font-mono font-medium hover:shadow-[0_0_5px_rgba(0,255,65,0.5)]"
              >
                ./movies
              </Link>
              
              {user ? (
                <>
                  <Link 
                    to="/my-bookings" 
                    className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors font-mono font-medium hover:shadow-[0_0_5px_rgba(0,255,65,0.5)]"
                  >
                    <Ticket className="h-4 w-4" />
                    <span>./bookings</span>
                  </Link>
                  
                  <Link 
                    to="/profile" 
                    className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors font-mono font-medium hover:shadow-[0_0_5px_rgba(0,255,65,0.5)]"
                  >
                    <User className="h-4 w-4" />
                    <span>user@{user.username}</span>
                  </Link>
                  
                  {user.isAdmin && (
                    <Link 
                      to="/admin" 
                      className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors font-mono font-medium hover:shadow-[0_0_5px_rgba(255,0,0,0.5)]"
                    >
                      <Shield className="h-4 w-4" />
                      <span>sudo ./admin</span>
                    </Link>
                  )}
                  
                  <button
                    onClick={logout}
                    className="bg-transparent border border-green-400 text-green-400 hover:bg-green-400 hover:text-black px-3 py-1 rounded font-mono text-sm transition-all hover:shadow-[0_0_10px_rgba(0,255,65,0.5)] flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>exit</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="bg-transparent border border-green-400 text-green-400 hover:bg-green-400 hover:text-black px-3 py-1 rounded font-mono text-sm transition-all hover:shadow-[0_0_10px_rgba(0,255,65,0.5)]">
                    ./login
                  </Link>
                  <Link to="/register" className="bg-green-400 text-black hover:bg-green-300 px-3 py-1 rounded font-mono text-sm font-bold transition-all hover:shadow-[0_0_10px_rgba(0,255,65,0.7)]">
                    ./register
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
                  className="text-green-400 hover:text-green-300 transition-colors font-mono font-medium py-2 hover:shadow-[0_0_5px_rgba(0,255,65,0.5)]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  ./movies
                </Link>
                
                {user ? (
                  <>
                    <Link 
                      to="/my-bookings" 
                      className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors font-mono font-medium py-2 hover:shadow-[0_0_5px_rgba(0,255,65,0.5)]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Ticket className="h-4 w-4" />
                      <span>./bookings</span>
                    </Link>
                    
                    <Link 
                      to="/profile" 
                      className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors font-mono font-medium py-2 hover:shadow-[0_0_5px_rgba(0,255,65,0.5)]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      <span>user@{user.username}</span>
                    </Link>
                    
                    {user.isAdmin && (
                      <Link 
                        to="/admin" 
                        className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors font-mono font-medium py-2 hover:shadow-[0_0_5px_rgba(255,0,0,0.5)]"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Shield className="h-4 w-4" />
                        <span>sudo ./admin</span>
                      </Link>
                    )}
                    
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="bg-transparent border border-green-400 text-green-400 hover:bg-green-400 hover:text-black px-3 py-2 rounded font-mono text-sm transition-all hover:shadow-[0_0_10px_rgba(0,255,65,0.5)] flex items-center space-x-2 justify-center mt-4"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>exit</span>
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col space-y-3 mt-4">
                    <Link 
                      to="/login" 
                      className="bg-transparent border border-green-400 text-green-400 hover:bg-green-400 hover:text-black px-3 py-2 rounded font-mono text-sm transition-all hover:shadow-[0_0_10px_rgba(0,255,65,0.5)] text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      ./login
                    </Link>
                    <Link 
                      to="/register" 
                      className="bg-green-400 text-black hover:bg-green-300 px-3 py-2 rounded font-mono text-sm font-bold transition-all hover:shadow-[0_0_10px_rgba(0,255,65,0.7)] text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      ./register
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