-- =============================================
-- QuickBite - Food Ordering System
-- database.sql
-- Run this file in XAMPP phpMyAdmin to set up your database
-- Go to phpMyAdmin > SQL tab > paste this > click Go
-- =============================================

-- Step 1: Create the database
CREATE DATABASE IF NOT EXISTS quickbite;

-- Step 2: Use it
USE quickbite;

-- =============================================
-- UPGRADE: Add driver columns if they don't exist (for existing databases)
-- Run these commands if you already have an orders table:
-- ALTER TABLE orders ADD COLUMN driver_name VARCHAR(100);
-- ALTER TABLE orders ADD COLUMN driver_phone VARCHAR(20);
-- ALTER TABLE orders ADD COLUMN customer_email VARCHAR(150);
-- =============================================

-- =============================================
-- TABLE: complaints
-- Stores customer concerns/issues for admin review
-- =============================================
CREATE TABLE IF NOT EXISTS complaints (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    order_id    INT,
    customer_name VARCHAR(100),
    customer_email VARCHAR(150),
    message     TEXT NOT NULL,
    status      VARCHAR(20) DEFAULT 'pending',  -- pending, reviewed, resolved
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLE: reviews
-- Stores customer reviews (goes to admin first, then published)
-- =============================================
CREATE TABLE reviews (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    order_id    INT,
    food_id     INT,
    customer_name VARCHAR(100),
    rating      INT NOT NULL,          -- 1-5 stars
    comment     TEXT,
    status      VARCHAR(20) DEFAULT 'pending',  -- pending, approved, rejected
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLE: users
-- Stores registered customer accounts
-- =============================================
CREATE TABLE users (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(150) NOT NULL UNIQUE,
    phone      VARCHAR(20),
    password   VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLE: foods
-- Stores all the food items on the menu
-- =============================================
CREATE TABLE foods (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    description TEXT,
    price       DECIMAL(10, 2) NOT NULL,
    emoji       VARCHAR(10),
    category    VARCHAR(50),                  -- burger, pizza, local, chicken, drinks, dessert
    rating      DECIMAL(2, 1) DEFAULT 4.5,
    badge       VARCHAR(30),                  -- HOT, NEW, DEAL, etc. (nullable)
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLE: orders
-- Stores customer orders
-- =============================================
CREATE TABLE orders (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    customer_name  VARCHAR(100) NOT NULL,
    customer_email VARCHAR(150),
    phone          VARCHAR(20),
    address        VARCHAR(255),
    total          DECIMAL(10, 2) NOT NULL,
    status         VARCHAR(50) DEFAULT 'Confirmed',   -- Confirmed, Preparing, On the way, Delivered
    driver_name    VARCHAR(100),
    driver_phone   VARCHAR(20),
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLE: delivery_tracking
-- Stores real-time GPS location updates from drivers
-- Driver's phone/app POSTs their location here every few seconds
-- =============================================
CREATE TABLE delivery_tracking (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    order_id   INT NOT NULL,
    driver_name VARCHAR(100),
    latitude   DECIMAL(10, 7) NOT NULL,
    longitude  DECIMAL(10, 7) NOT NULL,
    speed_kmh  DECIMAL(5, 1) DEFAULT 0,
    heading    INT DEFAULT 0,              -- degrees 0-360
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- =============================================
-- TABLE: tracking_history
-- Stores every GPS update with timestamp for historical tracking
-- Every driver location update is recorded here for order history
-- =============================================
CREATE TABLE IF NOT EXISTS tracking_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    driver_name VARCHAR(100),
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    speed_kmh DECIMAL(5, 1) DEFAULT 0,
    heading INT DEFAULT 0,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- =============================================
-- TABLE: order_items
-- Stores individual food items inside each order
-- (One order can have many items — this links them)
-- =============================================
CREATE TABLE order_items (
    id       INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    food_id  INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price    DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (food_id)  REFERENCES foods(id)  ON DELETE CASCADE
);

-- =============================================
-- SEED DATA: Insert sample food items
-- This populates the menu with test data
-- =============================================
INSERT INTO foods (name, description, price, emoji, category, rating, badge) VALUES
('Double Smash Burger',   'Two smashed beef patties, cheddar, caramelized onions & special sauce', 55.00, '🍔', 'burger',  4.9, 'HOT'),
('Classic Margherita',    '12\" hand-tossed dough, San Marzano tomato, fresh mozzarella & basil',  70.00, '🍕', 'pizza',   4.7, NULL),
('Waakye Special',        'Waakye, fried fish, boiled egg, spaghetti, stew & kelewele',            30.00, '🍜', 'local',   4.9, 'FAN FAV'),
('Grilled Chicken Combo', 'Whole grilled chicken, jollof rice, coleslaw & chilled drink',          75.00, '🍗', 'chicken', 4.8, 'DEAL'),
('Pepperoni Pizza',       'Premium pepperoni, triple mozzarella on a crispy thin crust',           80.00, '🍕', 'pizza',   4.6, NULL),
('Chicken Shawarma',      'Grilled chicken strips, garlic mayo, veggies wrapped in warm pita',     35.00, '🌯', 'chicken', 4.8, NULL),
('Banku & Tilapia',       'Freshly made banku with whole grilled tilapia and pepper sauce',        45.00, '🐟', 'local',   4.9, 'LOCAL FAV'),
('Chocolate Lava Cake',   'Warm chocolate cake with a gooey molten center, vanilla ice cream',     28.00, '🍰', 'dessert', 4.7, NULL),
('Fresh Fruit Smoothie',  'Blended mango, pineapple, strawberry with a hint of ginger',            20.00, '🥤', 'drinks',  4.6, NULL),
('Cheese Burger Deluxe',  'Juicy beef patty, bacon, triple cheese, lettuce, tomato & pickle',      60.00, '🍔', 'burger',  4.8, NULL),
('Jollof Rice Special',   'Party jollof rice with fried plantain, coleslaw & your choice of protein', 40.00, '🍚', 'local', 4.9, 'BESTSELLER'),
('Strawberry Cheesecake', 'Creamy New York cheesecake on graham cracker crust, topped with strawberry coulis', 32.00, '🍓', 'dessert', 4.8, NULL),
('Sobolo Delight',        'Chilled hibiscus drink with ginger, mint & a squeeze of lime',          15.00, '🍹', 'drinks',  4.8, 'LOCAL FAV'),
('Fufu & Light Soup',     'Soft pounded cassava fufu served with rich light soup and tender goat meat', 48.00, '🍲', 'local', 4.8, 'LOCAL FAV'),
('Kenkey & Fried Fish',   'Ga kenkey with crispy fried fish, shito, onions and fresh pepper',      34.00, '🐟', 'local',   4.7, NULL),
('Red Red Bowl',          'Beans stew served with sweet fried plantain and gari topping',           26.00, '🥘', 'local',   4.7, NULL),
('Ampesi & Kontomire',    'Boiled yam and plantain served with kontomire stew and smoked fish',    38.00, '🥔', 'local',   4.8, NULL),
('Tuo Zaafi Special',     'Northern-style tuo zaafi served with ayoyo soup and tender beef',       42.00, '🍲', 'local',   4.8, 'CHEF PICK'),
('Crispy Chicken Burger', 'Crunchy chicken fillet, lettuce, spicy mayo and pickles on a toasted bun', 52.00, '🍔', 'burger', 4.7, NULL),
('Caramel Choco Brownie', 'Fudgy chocolate brownie topped with caramel drizzle and vanilla cream', 24.00, '🍫', 'dessert', 4.7, NULL),
('Lamugin Cooler',        'Refreshing northern spice drink with milk, ginger and cloves served cold', 18.00, '🥛', 'drinks', 4.6, NULL);

-- =============================================
-- TEST: View your data
-- =============================================
SELECT * FROM foods;
SELECT * FROM users;
SELECT * FROM orders;

-- =============================================
-- ADDITIONAL QUERIES FOR FOOD ORDERING SYSTEM
-- =============================================

-- ---- INSERT ORDER ITEMS (TEST DATA) ----
-- IMPORTANT: Run the INSERT ORDER test first, then insert items for that order
-- Step 1: First insert a test order (run this first)
INSERT INTO orders (customer_name, total, status) VALUES ('Test Customer', 110.00, 'Confirmed');

-- Step 2: Then insert order items (run after order is created, replace order_id=1 with actual id)
-- Get the order_id from: SELECT LAST_INSERT_ID(); after inserting the order
INSERT INTO order_items (order_id, food_id, quantity, price) VALUES (1, 1, 2, 55.00);
INSERT INTO order_items (order_id, food_id, quantity, price) VALUES (1, 2, 1, 70.00);

-- ---- INSERT ORDER ITEMS (SAFER) ----
-- Use this to save individual food items when placing an order
-- Example: Insert 2 burgers (food_id=1) at price 55.00 for order_id=X (must match existing order)

-- ---- GET ORDER WITH ITEMS ----
-- Retrieve a complete order with all its items (JOIN orders, order_items, foods)
SELECT 
    o.id AS order_id,
    o.customer_name,
    o.total,
    o.status,
    o.created_at,
    f.name AS food_name,
    f.emoji,
    oi.quantity,
    oi.price AS item_price
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN foods f ON oi.food_id = f.id
WHERE o.id = 1;

-- ---- GET ALL ORDERS WITH THEIR ITEMS ----
-- List all orders with complete item details
SELECT 
    o.id AS order_id,
    o.customer_name,
    o.total,
    o.status,
    o.created_at,
    f.name AS food_name,
    f.emoji,
    oi.quantity,
    oi.price AS item_price
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN foods f ON oi.food_id = f.id
ORDER BY o.created_at DESC;

-- ---- GET FOODS BY CATEGORY ----
-- Filter foods by category (burger, pizza, local, chicken, drinks, dessert)
SELECT * FROM foods WHERE category = 'burger';
SELECT * FROM foods WHERE category = 'pizza';
SELECT * FROM foods WHERE category = 'local';

-- ---- SEARCH FOODS BY NAME ----
-- Search for food items containing a keyword
SELECT * FROM foods WHERE name LIKE '%burger%';
SELECT * FROM foods WHERE name LIKE '%pizza%';

-- ---- GET TOP RATED FOODS ----
-- Show highest rated food items
SELECT * FROM foods ORDER BY rating DESC LIMIT 10;

-- ---- GET FOODS WITH DEALS ----
-- Show foods that have a badge (HOT, DEAL, NEW, etc.)
SELECT * FROM foods WHERE badge IS NOT NULL;

-- ---- UPDATE ORDER STATUS ----
-- Change the status of an order (Confirmed -> Preparing -> Delivered)
UPDATE orders SET status = 'Preparing' WHERE id = 1;
UPDATE orders SET status = 'Delivered' WHERE id = 1;

-- ---- DELETE AN ORDER ----
-- Remove an order and its items (CASCADE will remove items automatically)
DELETE FROM orders WHERE id = 1;

-- ---- GET USER'S ORDER HISTORY ----
-- See all orders placed by a specific customer
SELECT * FROM orders WHERE customer_name = 'John' ORDER BY created_at DESC;

-- ---- COUNT ORDERS BY STATUS ----
-- Get count of orders in each status
SELECT status, COUNT(*) AS count FROM orders GROUP BY status;

-- ---- GET TOTAL SALES ----
-- Calculate total revenue from all orders
SELECT SUM(total) AS total_revenue FROM orders;

-- ---- GET DAILY SALES ----
-- Get total sales for today
SELECT SUM(total) AS daily_sales 
FROM orders 
WHERE DATE(created_at) = CURDATE();

-- ---- GET ORDER COUNT ----
-- Count total number of orders
SELECT COUNT(*) AS total_orders FROM orders;
