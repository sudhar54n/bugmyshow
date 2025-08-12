-- Exposed Backup Files - Vulnerability #8
-- BugMyShow Database Backup
-- Exposed sensitive information

CREATE TABLE users (
    id INT PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(255), -- admin:$2a$10$admin123hash, test:$2a$10$password123hash
    email VARCHAR(100),
    is_admin BOOLEAN DEFAULT FALSE
);

CREATE TABLE movies (
    id INT PRIMARY KEY,
    title VARCHAR(200),
    price DECIMAL(10,2),
    available_seats INT
);

CREATE TABLE bookings (
    id INT PRIMARY KEY,
    user_id INT,
    movie_id INT,
    price DECIMAL(10,2)
);

-- Default admin credentials: admin/admin123
-- Test user: test/password123
-- API endpoints exposed at /api/debug