-- =========================================
-- CM3010 Practical 4
-- Role-Based Inventory Management Database
-- =========================================

DROP DATABASE IF EXISTS cm3010_inventory;
CREATE DATABASE cm3010_inventory;
USE cm3010_inventory;

-- =========================
-- ROLES
-- =========================
CREATE TABLE roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO roles (role_name) VALUES
('Administrator'),
('Manager'),
('User');

-- =========================
-- USERS
-- =========================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    role_id INT NOT NULL,
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

INSERT INTO users (username, password, role_id) VALUES
('admin', 'admin123', 1),
('manager', 'manager123', 2),
('user1', 'user123', 3);

-- =========================
-- CATEGORIES
-- =========================
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL
);

INSERT INTO categories (category_name) VALUES
('Electronics'),
('Office Supplies'),
('Furniture');

-- =========================
-- PRODUCTS
-- =========================
CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    category_id INT NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

INSERT INTO products (product_name, category_id, stock) VALUES
('Laptop', 1, 10),
('Printer', 1, 5),
('Office Chair', 3, 20),
('Pen Pack', 2, 100);

-- =========================
-- STOCK TRANSACTIONS
-- =========================
CREATE TABLE stock_transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    quantity INT NOT NULL,
    transaction_type ENUM('IN', 'OUT') NOT NULL,
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Sample stock movement
INSERT INTO stock_transactions (product_id, user_id, quantity, transaction_type)
VALUES
(1, 2, 2, 'OUT'),
(4, 3, 10, 'OUT');
