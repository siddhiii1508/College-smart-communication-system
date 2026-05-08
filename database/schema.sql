-- Dr. APJ Abdul Kalam Women's Institute of Technology
-- Complete Database Schema

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'student',
    branch VARCHAR(50),
    semester VARCHAR(20),
    batch_start INT,
    batch_end INT,
    profile_pic VARCHAR(255) DEFAULT 'default-profile.png',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    head VARCHAR(100),
    description TEXT
);

-- 3. Notices Table
CREATE TABLE IF NOT EXISTS notices (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255),
    department_id INT REFERENCES departments(id),
    category VARCHAR(50) DEFAULT 'General',
    target_branch VARCHAR(50) DEFAULT 'All',
    target_batch VARCHAR(50) DEFAULT 'All',
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Academic Calendar Table
CREATE TABLE IF NOT EXISTS academic_calendar (
    id SERIAL PRIMARY KEY,
    event_date DATE NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    branch VARCHAR(50) DEFAULT 'All',
    batch VARCHAR(50) DEFAULT 'All',
    semester VARCHAR(50) DEFAULT 'All',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
