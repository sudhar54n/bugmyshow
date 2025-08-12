import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Terminal, User, LogOut, Shield, Search, Ticket } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/movies?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="bg-black border-b border-green-400 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors">
            <Terminal className="h-8 w-8" />
            <span className="text-2xl font-bold glitch-text">BugMyShow</span>
          </Link>

          <div className="flex items-center space-x-6">
            <form onSubmit={handleSearch} className="flex items-center space-x-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movies..."
                  className="bg-gray-900 border border-green-400 rounded px-3 py-1 text-green-400 placeholder-green-600 focus:outline-none focus:border-green-300"
                />
                <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600" />
              </div>
            </form>

            <nav className="flex items-center space-x-4">
              <Link to="/movies" className="text-green-400 hover:text-green-300 transition-colors">
                Movies
              </Link>
              
              {user ? (
                <>
                  <Link to="/my-bookings" className="flex items-center space-x-1 text-green-400 hover:text-green-300 transition-colors">
                    <Ticket className="h-4 w-4" />
                    <span>My Bookings</span>
                  </Link>
                  
                  <Link to="/profile" className="flex items-center space-x-1 text-green-400 hover:text-green-300 transition-colors">
                    <User className="h-4 w-4" />
                    <span>{user.username}</span>
                  </Link>
                  
                  {user.isAdmin && (
                    <Link to="/admin" className="flex items-center space-x-1 text-red-400 hover:text-red-300 transition-colors">
                      <Shield className="h-4 w-4" />
                      <span>Admin</span>
                    </Link>
                  )}
                  
                  <button
                    onClick={logout}
                    className="flex items-center space-x-1 text-green-400 hover:text-green-300 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-green-400 hover:text-green-300 transition-colors">
                    Login
                  </Link>
                  <Link to="/register" className="text-green-400 hover:text-green-300 transition-colors">
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}