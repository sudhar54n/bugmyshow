import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Film, User, LogOut, Shield, Search, Ticket, Menu, X } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/movies?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleSearchFocus = () => {
    setIsTyping(true);
  };

  const handleSearchBlur = () => {
    setIsTyping(false);
  };

  return (
    <header className="header-blur sticky top-0 z-50 border-b border-green-400/30 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-green-400/5 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-1/2 left-10 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
        <div className="absolute top-1/4 right-20 w-1 h-1 bg-red-400 rounded-full animate-ping delay-1000"></div>
      </div>
      
      {/* Terminal Status Bar */}
      <div className="bg-black/80 border-b border-green-400/20 px-4 py-1 text-xs font-mono text-green-400 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>SYSTEM ONLINE</span>
          </span>
          <span>|</span>
          <span>USERS: {user ? '1' : '0'} ACTIVE</span>
          <span>|</span>
          <span>SECURITY: VULNERABLE</span>
        </div>
        <div className="flex items-center space-x-2">
          <span>{new Date().toLocaleTimeString()}</span>
          <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 hover:scale-105 transition-all duration-300 group"
          >
            <div className="relative w-12 h-12 bg-gradient-to-br from-green-400/20 to-green-600/20 border border-green-400 rounded-lg flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(0,255,65,0.5)] transition-all duration-300">
              <Film className="h-7 w-7 text-green-400 group-hover:text-green-300 transition-colors" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-mono font-black hacker-glitch text-green-400 group-hover:text-green-300 transition-colors" data-text="BugMyShow">
                BugMyShow
              </span>
              <span className="text-xs text-green-600 font-mono">v2.0.1-vulnerable</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative group">
              <div className="relative overflow-hidden">
                {/* Search Input */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  placeholder={isTyping ? "Searching..." : "root@search:~$ find movies..."}
                  className="bg-black/80 border border-green-400 text-green-400 placeholder-green-600 w-80 pl-12 pr-4 py-3 rounded-lg font-mono text-sm focus:outline-none focus:border-green-300 focus:shadow-[0_0_15px_rgba(0,255,65,0.4)] focus:bg-black transition-all duration-300"
                />
                
                {/* Search Icon */}
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Search className={`h-4 w-4 text-green-400 transition-all duration-300 ${isTyping ? 'animate-pulse' : ''}`} />
                </div>
                
                {/* Animated Border */}
                <div className="absolute inset-0 rounded-lg border border-green-400/0 group-focus-within:border-green-300/50 transition-all duration-300"></div>
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-1">
                    <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                )}
              </div>
            </form>

            {/* Navigation Links */}
            <nav className="flex items-center space-x-8">
              <Link 
                to="/movies" 
                className="relative text-green-400 hover:text-green-300 transition-all duration-300 font-mono font-medium group"
              >
                <span className="relative z-10">./movies</span>
                <div className="absolute inset-0 bg-green-400/10 rounded px-2 py-1 scale-0 group-hover:scale-100 transition-transform duration-300"></div>
              </Link>
              
              {user ? (
                <>
                  <Link 
                    to="/my-bookings" 
                    className="relative flex items-center space-x-2 text-green-400 hover:text-green-300 transition-all duration-300 font-mono font-medium group"
                  >
                    <Ticket className="h-4 w-4 group-hover:animate-pulse" />
                    <span className="relative z-10">./bookings</span>
                    <div className="absolute inset-0 bg-green-400/10 rounded px-2 py-1 scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                  </Link>
                  
                  <Link 
                    to="/profile" 
                    className="relative flex items-center space-x-2 text-green-400 hover:text-green-300 transition-all duration-300 font-mono font-medium group"
                  >
                    <div className="relative">
                      <User className="h-4 w-4 group-hover:animate-pulse" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                    </div>
                    <span className="relative z-10">user@{user.username}</span>
                    <div className="absolute inset-0 bg-green-400/10 rounded px-2 py-1 scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                  </Link>
                  
                  {user.isAdmin && (
                    <Link 
                      to="/admin" 
                      className="relative flex items-center space-x-2 text-red-400 hover:text-red-300 transition-all duration-300 font-mono font-medium group"
                    >
                      <div className="relative">
                        <Shield className="h-4 w-4 group-hover:animate-pulse" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      </div>
                      <span className="relative z-10">sudo ./admin</span>
                      <div className="absolute inset-0 bg-red-400/10 rounded px-2 py-1 scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                    </Link>
                  )}
                  
                  <button
                    onClick={logout}
                    className="relative bg-transparent border border-green-400 text-green-400 hover:bg-green-400 hover:text-black px-4 py-2 rounded-lg font-mono text-sm transition-all hover:shadow-[0_0_15px_rgba(0,255,65,0.6)] flex items-center space-x-2 group overflow-hidden"
                  >
                    <LogOut className="h-4 w-4 group-hover:animate-bounce" />
                    <span>exit</span>
                    <div className="absolute inset-0 bg-green-400 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                    <div className="relative z-10 flex items-center space-x-2">
                      <LogOut className="h-4 w-4" />
                      <span>exit</span>
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="relative bg-transparent border border-green-400 text-green-400 hover:bg-green-400 hover:text-black px-4 py-2 rounded-lg font-mono text-sm transition-all hover:shadow-[0_0_15px_rgba(0,255,65,0.6)] group overflow-hidden">
                    <div className="absolute inset-0 bg-green-400 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                    <span className="relative z-10">./login</span>
                  </Link>
                  <Link to="/register" className="relative bg-green-400 text-black hover:bg-green-300 px-4 py-2 rounded-lg font-mono text-sm font-bold transition-all hover:shadow-[0_0_15px_rgba(0,255,65,0.8)] group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-300 to-green-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <span className="relative z-10">./register</span>
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-green-400 hover:text-green-300 transition-all duration-300 p-2 rounded-lg hover:bg-green-400/10 relative z-10"
          >
            {isMobileMenuOpen ? 
              <X className="h-6 w-6 animate-spin" /> : 
              <Menu className="h-6 w-6 hover:animate-pulse" />
            }
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-green-400/20 animate-fade-in relative z-20">
            <div className="pt-4 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative group">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="root@search:~$ find movies..."
                    className="bg-black/80 border border-green-400 text-green-400 placeholder-green-600 w-full pl-10 pr-4 py-3 rounded-lg font-mono text-sm focus:outline-none focus:border-green-300 focus:shadow-[0_0_15px_rgba(0,255,65,0.4)] transition-all duration-300"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-400" />
                </div>
              </form>

              {/* Mobile Navigation */}
              <nav className="flex flex-col space-y-3">
                <Link 
                  to="/movies" 
                  className="text-green-400 hover:text-green-300 transition-all duration-300 font-mono font-medium py-3 px-4 rounded-lg hover:bg-green-400/10 border border-transparent hover:border-green-400/30"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  ./movies
                </Link>
                
                {user ? (
                  <>
                    <Link 
                      to="/my-bookings" 
                      className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-all duration-300 font-mono font-medium py-3 px-4 rounded-lg hover:bg-green-400/10 border border-transparent hover:border-green-400/30 relative z-10"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Ticket className="h-4 w-4" />
                      <span>./bookings</span>
                    </Link>
                    
                    <Link 
                      to="/profile" 
                      className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-all duration-300 font-mono font-medium py-3 px-4 rounded-lg hover:bg-green-400/10 border border-transparent hover:border-green-400/30 relative z-10"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      <span>user@{user.username}</span>
                    </Link>
                    
                    {user.isAdmin && (
                      <Link 
                        to="/admin" 
                        className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-all duration-300 font-mono font-medium py-3 px-4 rounded-lg hover:bg-red-400/10 border border-transparent hover:border-red-400/30 relative z-10"
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
                      className="bg-transparent border border-green-400 text-green-400 hover:bg-green-400 hover:text-black px-4 py-3 rounded-lg font-mono text-sm transition-all hover:shadow-[0_0_15px_rgba(0,255,65,0.6)] flex items-center space-x-2 justify-center mt-4 relative z-10 w-full"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>exit</span>
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col space-y-3 mt-4">
                    <Link 
                      to="/login" 
                      className="bg-transparent border border-green-400 text-green-400 hover:bg-green-400 hover:text-black px-4 py-3 rounded-lg font-mono text-sm transition-all hover:shadow-[0_0_15px_rgba(0,255,65,0.6)] text-center relative z-10"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      ./login
                    </Link>
                    <Link 
                      to="/register" 
                      className="bg-green-400 text-black hover:bg-green-300 px-4 py-3 rounded-lg font-mono text-sm font-bold transition-all hover:shadow-[0_0_15px_rgba(0,255,65,0.8)] text-center relative z-10"
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