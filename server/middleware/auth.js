import jwt from 'jsonwebtoken';

const JWT_SECRET = 'secret123';

// JWT Forgery (No Signature Check) - Vulnerability #1
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    // Vulnerable: No signature verification
    const decoded = jwt.decode(token); // Using decode instead of verify
    
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    // For admin operations, we need to verify admin status
    // In a real app, this would be properly verified with signature
    if (decoded.username === 'admin') {
      decoded.isAdmin = true;
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token verification failed' });
  }
};

export default auth;