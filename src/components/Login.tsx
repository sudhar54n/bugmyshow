import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Terminal, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const success = await login(username, password);
    
    if (success) {
      navigate('/');
    } else {
      setError('Invalid credentials. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8 terminal-window scan-lines">
        <div className="terminal-header">
          root@bugmyshow:/auth$ ./login --interactive
        </div>
        <div className="text-center">
          <Terminal className="mx-auto h-12 w-12 text-green-400 animate-pulse" />
          <h2 className="mt-6 text-3xl font-bold text-green-400 hacker-glitch font-mono" data-text="Access Terminal">
            Access Terminal
          </h2>
          <p className="mt-2 text-sm text-green-600 font-mono">
            [AUTHENTICATION REQUIRED] Enter credentials to proceed...
          </p>
        </div>
        
        <form className="mt-8 space-y-6 p-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-green-400 mb-2 font-mono">
                root@username:~$
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-black border border-green-400 rounded text-green-400 placeholder-green-600 focus:outline-none focus:border-green-300 focus:shadow-[0_0_10px_rgba(0,255,65,0.3)] font-mono"
                placeholder="admin"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-green-400 mb-2 font-mono">
                root@password:~$
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-green-400 rounded text-green-400 placeholder-green-600 focus:outline-none focus:border-green-300 focus:shadow-[0_0_10px_rgba(0,255,65,0.3)] font-mono pr-10"
                  placeholder="admin123"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-green-400 hover:text-green-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-900/20 border border-red-400 rounded p-2 font-mono">
              [ERROR] {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 bg-green-400 text-black hover:bg-green-300 rounded font-mono text-sm font-bold transition-all hover:shadow-[0_0_15px_rgba(0,255,65,0.7)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '[AUTHENTICATING...]' : './execute_login'}
            </button>
          </div>

          <div className="text-center">
            <span className="text-gray-400 font-mono">Don't have access? </span>
            <Link to="/register" className="text-green-400 hover:text-green-300 font-medium font-mono hover:shadow-[0_0_5px_rgba(0,255,65,0.5)]">
              ./create_account
            </Link>
          </div>

          <div className="text-center text-xs text-green-600 mt-4 font-mono bg-black border border-green-400 rounded p-3">
            <p>[DEBUG MODE] Demo credentials:</p>
            <p>root@admin:~$ admin / admin123</p>
            <p>user@test:~$ test / password123</p>
          </div>
        </form>
      </div>
    </div>
  );
}