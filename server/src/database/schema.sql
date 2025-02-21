-- Create database
CREATE DATABASE IF NOT EXISTS quiz_system;
USE quiz_system;

-- Create major_types table
CREATE TABLE IF NOT EXISTS major_types (
    type_code VARCHAR(50) PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create minor_types table
CREATE TABLE IF NOT EXISTS minor_types (
    type_code VARCHAR(50) PRIMARY KEY,
    major_type_code VARCHAR(50) NOT NULL,
    type_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (major_type_code) REFERENCES major_types(type_code)
);

-- Create idioms table
CREATE TABLE IF NOT EXISTS idioms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idiom VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    examples JSON NOT NULL,
    exam_images JSON,
    major_type_code VARCHAR(50) NOT NULL,
    minor_type_code VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (major_type_code) REFERENCES major_types(type_code),
    FOREIGN KEY (minor_type_code) REFERENCES minor_types(type_code)
);
