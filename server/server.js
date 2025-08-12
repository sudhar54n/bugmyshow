import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { supabase, testConnection } from './config/database.js';

dotenv.config();

const preferredPort = 5001; // fixed port for local dev

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));
app.use('/public', express.static('public'));

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import { movieRouter } from './routes/movies.js';
import bookingRoutes from './routes/bookings.js';
import adminRoutes from './routes/admin.js';
import ticketRoutes from './routes/tickets.js';
import paymentRoutes from './routes/payment.js';

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/movies', movieRouter);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/payment', paymentRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'BugMyShow API Server',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      movies: '/api/movies',
      bookings: '/api/bookings',
      admin: '/api/admin',
      debug: '/api/debug'
    }
  });
});

// Debug Endpoint Exposure - Vulnerability #7
app.get('/api/debug', (req, res) => {
  res.json({
    memory: process.memoryUsage(),
    platform: process.platform,
    version: process.version,
    uptime: process.uptime(),
    cwd: process.cwd(),
    users: 'admin:admin123, test:password123'
  });
});

// Verbose Error Messages - Vulnerability #8
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send(err.stack);
});

// Start server
const startServer = async () => {
  try {
    console.log('🚀 Starting BugMyShow API Server...');
    console.log('🔍 Testing database connection...');
    try {
      const dbConnected = await testConnection();
      if (dbConnected) {
        await createAdminUser();
        await createSampleMovies();
      } else {
        console.warn('⚠️ Database connection failed, but continuing to start server...');
      }
    } catch (dbError) {
      console.warn('⚠️ Database setup failed:', dbError.message);
      console.warn('⚠️ Continuing to start server without database setup...');
    }
    
    const server = app.listen(preferredPort, '0.0.0.0', () => {
      console.log(`🚀 BugMyShow API Server running on port ${preferredPort}`);
      console.log(`📡 API Base URL: http://localhost:${preferredPort}`);
      console.log(`🔍 Debug endpoint: http://localhost:${preferredPort}/api/debug`);
    });
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${preferredPort} is already in use.`);
        console.log('💡 Try killing any existing processes on this port or use a different port');
        process.exit(1);
      } else {
        console.error('❌ Failed to start server:', err.message);
        process.exit(1);
      }
    });
    
    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 Received SIGTERM, shutting down gracefully');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

// Create admin user if missing
const createAdminUser = async () => {
  try {
    if (!supabase) {
      console.log('⚠️ Skipping admin user creation: Supabase client not available');
      return;
    }

    const { data: existingAdmin } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'admin')
      .single();

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);

      const { error } = await supabase
        .from('users')
        .insert([
          {
            username: 'admin',
            password: hashedPassword,
            email: 'admin@bugmyshow.com',
            is_admin: true
          }
        ]);

      if (error) {
        console.error('❌ Failed to create admin user:', error.message);
      } else {
        console.log('✅ Admin user created successfully (admin/admin123)');
      }
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error setting up admin user:', error.message);
  }
};

// Create sample movies if missing
const createSampleMovies = async () => {
  try {
    if (!supabase) {
      console.log('⚠️ Skipping sample movie creation: Supabase client not available');
      return;
    }

    const { data: existingMovies } = await supabase
      .from('movies')
      .select('*')
      .limit(1);

    if (!existingMovies || existingMovies.length === 0) {
      const sampleMovies = [
        {
          title: 'Pulp Fiction',
          description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
          price: 120,
          available_seats: 150
        },
        {
          title: 'The Dark Knight',
          description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.',
          price: 120,
          available_seats: 200
        },
        {
          title: 'Fight Club',
          description: 'An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into an anarchist organization.',
          price: 120,
          available_seats: 180
        }
      ];

      const { error } = await supabase.from('movies').insert(sampleMovies);

      if (error) {
        console.error('❌ Failed to create sample movies:', error.message);
      } else {
        console.log('✅ Sample movies created successfully');
      }
    } else {
      console.log('✅ Movies already exist in database');
    }
  } catch (error) {
    console.error('❌ Error creating sample movies:', error.message);
  }
};

startServer();
