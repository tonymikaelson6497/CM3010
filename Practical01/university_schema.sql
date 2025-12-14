-- CM3010 Database and Advanced Data Techniques
-- Practical 1: Relational Database Setup
-- Topic 2: SQL, E/R Modelling

-- Create database
CREATE DATABASE IF NOT EXISTS university_db;
USE CM3010_db;

-- Students table
CREATE TABLE students (
    student_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);

-- Courses table
CREATE TABLE courses (
    course_code CHAR(7) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    credits TINYINT DEFAULT 15
);

-- Enrolments junction table
CREATE TABLE enrolments (
    student_id INT,
    course_code CHAR(7),
    enrolment_date DATE DEFAULT (CURRENT_DATE),
    PRIMARY KEY (student_id, course_code),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (course_code) REFERENCES courses(course_code) ON DELETE CASCADE
);

-- Sample data: students
INSERT INTO students (first_name, last_name, email) VALUES
('Alice', 'Johnson', 'alice.j@university.edu'),
('Bob', 'Smith', 'bob.s@university.edu'),
('Chloe', 'Williams', 'chloe.w@university.edu');

-- Sample data: courses
INSERT INTO courses (course_code, title, credits) VALUES
('CM3010', 'Databases and Advanced Data Techniques', 15),
('CM2005', 'Web Development', 15),
('CM1001', 'Programming Fundamentals', 15);

-- Enrolments
INSERT INTO enrolments (student_id, course_code) VALUES
(1, 'CM3010'),
(1, 'CM2005'),
(2, 'CM3010'),
(3, 'CM1001'),
(3, 'CM3010');

-- Verification queries
SELECT * FROM students;
SELECT * FROM courses WHERE credits = 15;
