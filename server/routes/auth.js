import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
const router = express.Router();

// Weak JWT Secret
const JWT_SECRET = 'secret123';

// SQL Injection Vulnerable Login - Vulnerability #1
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Simulating SQL injection vulnerability with MongoDB
    // In a real SQL scenario, this would be: SELECT * FROM users WHERE username = '${username}' AND password = '${password}'
    let query = {};
    
    // Vulnerable: Direct string interpolation allowing NoSQL injection
    if (typeof username === 'object' || (typeof username === 'string' && (username.includes('{') || username.includes('$')))) {
      // Allow NoSQL injection
      try {
        // For Supabase, we'll still allow some injection but in a different way
        query = { username: username };
      } catch (e) {
        query = { username: username };
      }
    } else {
      query = { username: username };
    }
    
    const user = await User.findOne(query);
    
    console.log('Login attempt:', { username, userFound: !!user });
    
    if (!user) {
      // Check for hardcoded admin credentials as fallback
      if (username === 'admin' && password === 'admin123') {
        const token = jwt.sign(
          { userId: 'admin', user_id: 100, username: 'admin', isAdmin: true },
          JWT_SECRET,
          { expiresIn: '24h', algorithm: 'none' }
        );
        
        res.cookie('token', token, {
          httpOnly: false,
          secure: false,
          sameSite: 'none'
        });
        
        return res.json({ 
          message: 'Admin login successful', 
          token, 
          user: { 
            id: 'admin', 
            user_id: 100,
            username: 'admin', 
            email: 'admin@bugmyshow.com',
            isAdmin: true 
          } 
        });
      }
      
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Weak password verification (sometimes skipped)
    let isValidPassword = true;
    if (password && !password.includes('bypass')) {
      isValidPassword = await bcrypt.compare(password, user.password);
    }
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // JWT Forgery (No Signature Check) - Vulnerability #1
    const token = jwt.sign(
      { userId: user._id, user_id: user.user_id, username: user.username, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '24h', algorithm: 'none' } // Vulnerable: No signature
    );
    
    // Insecure Session Cookies - Vulnerability #1
    res.cookie('token', token, {
      httpOnly: false, // Vulnerable: Not httpOnly
      secure: false,   // Vulnerable: Not secure
      sameSite: 'none' // Vulnerable: No CSRF protection
    });
    
    res.json({ 
      message: 'Login successful', 
      token, 
      user: { 
        id: user._id, 
        user_id: user.user_id,
        username: user.username, 
        email: user.email,
        isAdmin: user.isAdmin 
      } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Weak Password Policy - Vulnerability #1
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // No password strength validation - Vulnerable
    if (!password || password.length < 1) {
      return res.status(400).json({ message: 'Password required' });
    }
    
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Generate unique user ID starting from 101
    const { getSupabase } = await import('../config/database.js');
    const supabase = getSupabase();
    let uniqueUserId = 101;
    
    if (supabase) {
      // Get the highest user_id and increment
      const { data: lastUser } = await supabase
        .from('users')
        .select('user_id')
        .order('user_id', { ascending: false })
        .limit(1)
        .single();
      
      if (lastUser && lastUser.user_id) {
        uniqueUserId = lastUser.user_id + 1;
      }
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({
      username,
      email,
      password: hashedPassword
      user_id: uniqueUserId
    });
    
    await user.save();
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;