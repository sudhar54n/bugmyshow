import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Movies from './components/Movies';
import MovieDetail from './components/MovieDetail';
import Profile from './components/Profile';
import MyBookings from './components/MyBookings';
import Admin from './components/Admin';
import { AuthProvider, useAuth } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-black text-green-400 font-mono relative">
          {/* Hacker Background Elements */}
          <div className="hacker-grid"></div>
          <div className="binary-rain"></div>
          
          {/* Floating Code Snippets */}
          <div className="code-float">
            function hackTheMovies() {<br/>
            &nbsp;&nbsp;return "Access Granted";<br/>
            }
          </div>
          <div className="code-float">
            SELECT * FROM movies<br/>
            WHERE security = 'vulnerable';<br/>
            -- Exploit found
          </div>
          <div className="code-float">
            &lt;script&gt;<br/>
            &nbsp;&nbsp;alert('XSS');<br/>
            &lt;/script&gt;
          </div>
          <div className="code-float">
            curl -X POST /api/tickets<br/>
            -H "Authorization: Bearer fake"<br/>
            --data "price=0.01"
          </div>
          
          <div className="matrix-bg">
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/movies/:id" element={<MovieDetail />} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
}

export default App;