# 🍽️ QuickBite — Online Food Ordering System

A full-stack food ordering web application built with **HTML/CSS/JavaScript** (frontend) and **Java** (backend) connected to **MySQL** via XAMPP. Features a modern dark/light design with cart, wishlist, promo codes, checkout, real-time GPS driver tracking, and automated email notifications.

---

## 🚀 Currently Running

The application is currently **LIVE** at:

| Service | URL |
|---------|-----|
| **Backend API** | http://localhost:8080 |
| **Frontend** | Open `FRONTEND/index.html` in browser |

### API Health Check
```
GET http://localhost:8080/api/health
```
Returns: `{"status":"QuickBite server is running!"}`

---

## 📁 Project Structure

```
FOOD ORDERING SYSTEM/
│
├── FRONTEND/                          ← Everything the user SEES
│   ├── index.html                     ← Main page structure & all modals
│   ├── style.css                      ← All visual styling (dark + light mode)
│   └── main.js                        ← All interactivity, API calls & logic
│
└── BACKEND/                  ← Server-side Java code
    ├── src/
    │   ├── Main.java                  ← Entry point (run this)
    │   ├── Server.java                ← HTTP server & route registration
    │   ├── DatabaseConnection.java    ← MySQL connection helper
    │   ├── FoodRoutes.java            ← /api/foods
    │   ├── OrderRoutes.java           ← /api/orders (place, status, driver)
    │   ├── UserRoutes.java            ← /api/users (register, login)
    │   ├── ReviewRoutes.java          ← /api/reviews
    │   ├── TrackingRoutes.java        ← /api/tracking (real-time GPS) ⭐ NEW
    │   └── EmailService.java          ← Email notifications via Gmail ⭐ NEW
    ├── lib/
    │   └── mysql-connector-j-9.6.0.jar
    ├── database.sql                   ← Run this in phpMyAdmin
    └── config.properties              ← Database & email credentials
```

---

## 🚀 How to Set Up & Run

### Step 1 — Database Setup
1. Open **XAMPP Control Panel**
2. Start **Apache** and **MySQL**
3. Open browser → go to `http://localhost/phpmyadmin`
4. Click the **SQL** tab
5. Copy & paste everything from `BACKEND/database.sql`
6. Click **Go** — this creates your database, tables, and sample food data

### Step 2 — Configure Email (Optional but Recommended)
To receive delivery notification emails:
1. Open `src/EmailService.java`
2. Find the line: `private static final String FROM_PASSWORD = "YOUR_GMAIL_APP_PASSWORD_HERE";`
3. Replace with your Gmail App Password:
   - Go to [https://myaccount.google.com/security](https://myaccount.google.com/security)
   - Enable **2-Step Verification**
   - Go to **App Passwords** → create one for "Mail"
   - Paste the 16-character code (no spaces)
4. The sender email is already set to `quayen010@gmail.com`

### Step 3 — Run the Frontend
1. Open the `FRONTEND/` folder in VS Code
2. Right-click `index.html` → **Open with Live Server**
3. Your app opens in the browser at `http://localhost:5500`

### Step 4 — Compile & Run the Backend
**The server is already running!** If you need to restart it:

Open a terminal and run:

```cmd
cd BACKEND

REM Run the server (already compiled)
java -cp "src;lib/mysql-connector-j-9.6.0.jar;." Main
```

**To stop the server:** Press `Ctrl+C` in the terminal or close the terminal window.

You should see:
```
✅ Database connected successfully!
🚀 Server started! Listening on http://localhost:8080
📡 Available routes:
   GET  http://localhost:8080/api/health
   GET  http://localhost:8080/api/foods
   POST http://localhost:8080/api/orders
   PUT  http://localhost:8080/api/orders/{id}/status
   PUT  http://localhost:8080/api/orders/{id}/driver
   POST http://localhost:8080/api/tracking  (driver posts GPS)
   GET  http://localhost:8080/api/tracking?order_id=X  (customer polls)
   ...
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🍔 Menu Browsing | Browse food items with categories (Burgers, Pizza, Local, Chicken, Drinks, Desserts) |
| 🔍 Search & Filter | Search by name/description, filter by category, sort by price/rating/popularity |
| 🛒 Shopping Cart | Add items, adjust quantities, view subtotal/discount/delivery totals |
| ♡ Wishlist | Save favourite items for later |
| 🎫 Promo Codes | Apply discount codes (WELCOME50, SAVE10, QUICKBITE, FREEDEL, LOCAL20) |
| 📦 Checkout | Full checkout with name, email, phone, address, delivery zone, payment method |
| 📍 Real-Time Order Tracking | Track order status + live driver GPS on OpenStreetMap (updates every 5s) ⭐ NEW |
| 🚗 Driver Mode | Drivers open the site on their phone → share live GPS location ⭐ NEW |
| ✉️ Email Notifications | Auto-email when driver assigned + when order delivered ⭐ NEW |
| 🔧 Admin Panel | View all orders, update status, assign drivers, track live ⭐ UPDATED |
| ⭐ Reviews | Rate and review your orders |
| 🌙☀️ Dark / Light Mode | Toggle between dark and light themes, preference saved ⭐ NEW |
| 💾 Auto-Save | Cart, wishlist, orders, and theme persist in localStorage |

---

## 🗺️ How Real-Time Tracking Works

```
DRIVER (phone browser)
     ↓  opens "🚗 Driver Mode" in nav
     ↓  enters name + order ID → taps "Start Sharing"
     ↓  browser Geolocation API reads GPS every 5 seconds
     ↓  POSTs { order_id, lat, lng, speed, heading } to backend
POST /api/tracking
     ↓  Java saves to delivery_tracking table (upsert)
MySQL delivery_tracking table
     ↑  Customer polls every 5 seconds
GET /api/tracking?order_id=X
     ↑  JavaScript renders OpenStreetMap iframe + driver card
CUSTOMER sees live map with driver pin
```

---

## 📧 Email Flow

```
Admin assigns driver to order
     → EmailService.sendDriverAssignedEmail()
     → Customer receives "🚗 Your order is on its way!" email

Admin marks order as Delivered
     → EmailService.sendDeliveryConfirmation()
     → Customer receives "✅ Your order has been delivered!" email
```

---

## 🧠 Architecture Overview

```
USER (Browser)
     ↓  clicks "Add to Cart" / "Place Order" / "Track"
HTML + CSS + JavaScript (frontend)
     ↓  sends HTTP request (fetch API)
Java HTTP Server (backend — port 8080)
     ↓  runs SQL query / sends email
MySQL Database (XAMPP — port 3306)
     ↓  returns data as JSON
JavaScript updates the page in real-time
```

---

## 📡 API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/health` | Check if server is running |
| GET | `/api/foods` | Get all food items |
| GET | `/api/orders` | Get all orders |
| POST | `/api/orders` | Place a new order |
| PUT | `/api/orders/{id}/status` | Update order status |
| PUT | `/api/orders/{id}/driver` | Assign driver to order |
| POST | `/api/users/register` | Register new user |
| POST | `/api/users/login` | Login user |
| GET | `/api/reviews` | Get all reviews |
| POST | `/api/reviews` | Submit a review |
| **POST** | **`/api/tracking`** | **Driver posts GPS location** ⭐ NEW |
| **GET** | **`/api/tracking?order_id=X`** | **Get driver's live location** ⭐ NEW |

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `foods` | Menu items (name, price, emoji, category, rating) |
| `users` | Registered customer accounts |
| `orders` | Customer orders (includes `customer_email`, `driver_name`, `driver_phone`) |
| `order_items` | Individual food items within each order |
| `reviews` | Customer reviews (pending admin approval) |
| `delivery_tracking` | **Real-time driver GPS coordinates** ⭐ NEW |

---

## 🛠️ Technologies Used

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | HTML5 | Page structure & modals |
| Frontend | CSS3 | Styling, animations, dark/light mode |
| Frontend | JavaScript (Vanilla) | Interactivity, API calls, GPS polling |
| Frontend | OpenStreetMap (iframe) | Free map — no API key needed |
| Frontend | Browser Geolocation API | Driver GPS location sharing |
| Backend | Java (JDK 11+) | HTTP server, routing, business logic |
| Backend | javax.mail (JavaMail) | Gmail SMTP email notifications |
| Database | MySQL (XAMPP) | Data storage |

---

## 🎨 Theme

QuickBite supports **Dark Mode** (default) and **Light Mode**:
- Click the **☀️** button in the top-right navbar to switch
- Preference is saved in `localStorage` — persists across page reloads

---

## 🔐 Admin Access

- Click **Admin** in the navbar
- Default password: `quickbite2025`
- Change it in `main.js` → `const ADMIN_PASSWORD = 'quickbite2025';`

---

## 🎫 Promo Codes

| Code | Discount |
|------|---------|
| `WELCOME50` | 50% off your order |
| `SAVE10` | GH₵10 flat off |
| `QUICKBITE` | 15% off |
| `FREEDEL` | Free delivery |
| `LOCAL20` | 20% off local dishes |

---

*Built with ❤️ for Sekondi-Takoradi, Ghana 🇬🇭*
*QuickBite · +233 50 95 11 074 · quayen010@gmail.com*
