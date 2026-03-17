# 🍽️ QuickBite — Food Ordering System
## Complete Project Overview & Presentation Guide

---

## ☕ Java Version & Libraries Used

### ❓ Does This Project Use JavaFX?

**No — this project does NOT use JavaFX.**

Here is the difference:

| | JavaFX | This Project |
|--|--------|-------------|
| **What it is** | A Java library for building desktop GUI apps (windows, buttons, forms) | A web application (runs in a browser) |
| **User interface** | Java windows and controls (like a desktop app) | HTML + CSS + JavaScript in a web browser |
| **Who sees it** | Only on the computer running the Java app | Anyone with a browser (phone, laptop, tablet) |
| **Use case** | Desktop software (like a calculator or inventory app) | Web apps (like Uber Eats, online shopping) |

**This project uses Java only for the backend server** — it handles HTTP requests, talks to the database, and sends emails. The user interface is entirely in the browser using HTML/CSS/JavaScript.

Think of it like this:
```
JavaFX project:  Java code → draws windows on screen
This project:    Java code → listens for web requests → sends JSON → browser shows the UI
```

---

### Java Version
This project uses **Java SE (Standard Edition) — minimum Java 9, recommended Java 11+**

The specific Java feature that requires Java 9+ is:
```java
exchange.getRequestBody().readAllBytes()  // InputStream.readAllBytes() — added in Java 9
```

To check your Java version:
```cmd
java -version
```
You should see something like: `java version "11.0.x"` or higher.

### Java APIs Used (all built-in — no extra downloads needed)

| Package / Class | What It Does | Where Used |
|----------------|-------------|-----------|
| `com.sun.net.httpserver.HttpServer` | Creates an HTTP web server | `Server.java` |
| `com.sun.net.httpserver.HttpHandler` | Interface for handling HTTP requests | All `*Routes.java` files |
| `com.sun.net.httpserver.HttpExchange` | Represents one HTTP request/response | All `*Routes.java` files |
| `java.net.InetSocketAddress` | Binds server to a port (8080) | `Server.java` |
| `java.util.concurrent.Executors` | Thread pool for handling multiple requests | `Server.java` |
| `java.sql.Connection` | Represents a database connection | `DatabaseConnection.java` |
| `java.sql.DriverManager` | Creates database connections | `DatabaseConnection.java` |
| `java.sql.PreparedStatement` | Runs parameterized SQL queries safely | All `*Routes.java` files |
| `java.sql.ResultSet` | Holds results from SQL SELECT queries | All `*Routes.java` files |
| `java.sql.DatabaseMetaData` | Checks if columns exist in tables | `OrderRoutes.java` |
| `java.sql.Statement` | Used to get auto-generated keys | `OrderRoutes.java` |
| `java.io.OutputStream` | Writes HTTP response body | `Server.java` |
| `java.io.FileInputStream` | Reads `config.properties` file | `DatabaseConnection.java` |
| `java.util.Properties` | Parses `.properties` config files | `DatabaseConnection.java` |
| `java.lang.Thread` | Background thread for sending emails | `OrderRoutes.java` |
| `java.lang.reflect.*` | Reflection API (loads JavaMail dynamically) | `EmailService.java` |

### External Library (JAR file)

| Library | Version | Purpose | Location |
|---------|---------|---------|---------|
| **MySQL Connector/J** | 9.6.0 | Connects Java to MySQL database | `FRONTEND/BACKEND/lib/mysql-connector-j-9.6.0.jar` |

This is the **only external dependency**. Everything else is built into Java.

### Optional Library (for email)

| Library | Purpose | How to Get |
|---------|---------|-----------|
| **JavaMail (javax.mail)** | Sends emails via Gmail SMTP | Download `mail.jar` from https://javaee.github.io/javamail/ |

> **Note:** JavaMail is optional. If it's not present, the app still works — emails are just skipped. The `EmailService.java` uses Java Reflection to load it dynamically so the app never crashes if it's missing.

### Java Concepts Used in This Project

| Concept | Where It's Used |
|---------|----------------|
| **Classes & Objects** | Every `.java` file is a class |
| **Interfaces** | `HttpHandler` interface implemented by all route classes |
| **Static methods** | `DatabaseConnection.getConnection()`, `Server.sendResponse()` |
| **Exception handling** | `try/catch/finally` throughout all database operations |
| **String manipulation** | Manual JSON building with `StringBuilder` |
| **Multithreading** | `Executors.newFixedThreadPool(10)` for concurrent requests |
| **File I/O** | Reading `config.properties` with `FileInputStream` |
| **JDBC** | `PreparedStatement`, `ResultSet`, `Connection` |
| **Reflection** | Dynamic class loading in `EmailService.java` |
| **Anonymous classes** | Used in `EmailService.java` for the SMTP authenticator |


> **Prepared for:** Lecturer Presentation  
> **Project:** Full-Stack Food Ordering Web Application  
> **Developer:** QuickBite Team — Sekondi-Takoradi, Ghana 🇬🇭  
> **Contact:** quayen010@gmail.com · +233 50 95 11 074

---

## 📌 What Is This Project?

**QuickBite** is a complete, production-ready online food ordering system — similar to Uber Eats or Bolt Food — built specifically for restaurants in Sekondi-Takoradi, Ghana.

It allows customers to:
- Browse a restaurant menu
- Add food to a cart and place orders
- Track their delivery driver in **real-time on a map**
- Receive **email notifications** when their food is on the way and when it arrives

It allows the restaurant admin to:
- View all incoming orders
- Update order status (Confirmed → Preparing → On the way → Delivered)
- Assign delivery drivers to orders
- Track drivers live on a map

It allows delivery drivers to:
- Open the website on their phone
- Share their live GPS location so customers can track them

---

## 🏗️ System Architecture

The project is built using a **3-tier architecture** — a standard industry pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                    TIER 1: PRESENTATION                      │
│              (What the user sees in the browser)             │
│                                                              │
│   HTML5 (structure) + CSS3 (design) + JavaScript (logic)    │
│   Files: index.html, style.css, main.js                     │
└──────────────────────────┬──────────────────────────────────┘
                           │  HTTP Requests (fetch API)
                           │  JSON Responses
┌──────────────────────────▼──────────────────────────────────┐
│                    TIER 2: APPLICATION                       │
│              (Business logic — runs on the server)           │
│                                                              │
│   Java HTTP Server (port 8080)                              │
│   Files: Server.java, OrderRoutes.java, TrackingRoutes.java  │
│          FoodRoutes.java, UserRoutes.java, EmailService.java  │
└──────────────────────────┬──────────────────────────────────┘
                           │  SQL Queries (JDBC)
                           │  ResultSets
┌──────────────────────────▼──────────────────────────────────┐
│                    TIER 3: DATA                              │
│              (Persistent storage)                            │
│                                                              │
│   MySQL Database (XAMPP — port 3306)                        │
│   Tables: foods, users, orders, order_items, reviews,        │
│           delivery_tracking                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Complete File Structure & What Each File Does

```
FOOD ORDERING SYSTEM/
│
├── PROJECT_OVERVIEW.md          ← THIS FILE (for lecturer)
│
├── FRONTEND/                    ← Everything the user sees
│   │
│   ├── index.html               ← The entire website structure
│   │                               Contains: navbar, hero, menu grid,
│   │                               cart sidebar, checkout modal,
│   │                               order tracking modal, driver modal,
│   │                               admin panel, login/register modals
│   │
│   ├── style.css                ← All visual design
│   │                               Contains: dark mode (default),
│   │                               light mode, animations, responsive
│   │                               design for mobile/tablet/desktop,
│   │                               tracking map styles, driver cards
│   │
│   ├── main.js                  ← All JavaScript logic
│   │                               Contains: menu rendering, cart,
│   │                               wishlist, checkout, order placement,
│   │                               real-time GPS tracking, driver sharing,
│   │                               admin panel, dark/light mode toggle,
│   │                               email field, API calls to backend
│   │
│   └── BACKEND/                 ← Server-side Java code
│       │
│       ├── README.md            ← Full technical documentation
│       ├── SETUP.md             ← Step-by-step setup guide
│       ├── database.sql         ← SQL to create all tables + sample data
│       ├── config.properties    ← Database & email credentials
│       │
│       ├── lib/
│       │   └── mysql-connector-j-9.6.0.jar  ← MySQL JDBC driver
│       │
│       └── src/                 ← Java source files
│           │
│           ├── Main.java        ← Entry point — starts the server
│           │
│           ├── Server.java      ← Creates the HTTP server on port 8080
│           │                       Registers all API routes
│           │                       Handles CORS (allows browser requests)
│           │
│           ├── DatabaseConnection.java
│           │                    ← Connects to MySQL using JDBC
│           │                       Reads credentials from config.properties
│           │                       Returns a Connection object
│           │
│           ├── FoodRoutes.java  ← Handles GET /api/foods
│           │                       Returns all food items as JSON
│           │
│           ├── OrderRoutes.java ← Handles all order operations:
│           │                       POST /api/orders (place order)
│           │                       GET  /api/orders (get all orders)
│           │                       PUT  /api/orders/{id}/status (update)
│           │                       PUT  /api/orders/{id}/driver (assign)
│           │                       Triggers emails on driver assign & delivery
│           │
│           ├── UserRoutes.java  ← Handles user accounts:
│           │                       POST /api/users/register
│           │                       POST /api/users/login
│           │
│           ├── ReviewRoutes.java← Handles food reviews:
│           │                       GET  /api/reviews
│           │                       POST /api/reviews
│           │
│           ├── TrackingRoutes.java ← ⭐ NEW: Real-time GPS tracking
│           │                       POST /api/tracking (driver sends location)
│           │                       GET  /api/tracking?order_id=X (customer polls)
│           │                       Stores lat/lng in delivery_tracking table
│           │
│           └── EmailService.java   ← ⭐ NEW: Email notifications
│                                   Sends "Driver Assigned" email
│                                   Sends "Order Delivered" email
│                                   Uses Gmail SMTP (App Password)
│                                   Gracefully skips if not configured
```

---

## 🗄️ Database Design

The database is called `quickbite` and has 6 tables:

### Table 1: `foods`
Stores the restaurant menu.
```
id | name                  | price | emoji | category | rating | badge
---|-----------------------|-------|-------|----------|--------|-------
1  | Double Smash Burger   | 55.00 | 🍔    | burger   | 4.9    | HOT
2  | Classic Margherita    | 70.00 | 🍕    | pizza    | 4.7    | NULL
3  | Waakye Special        | 30.00 | 🍜    | local    | 4.9    | FAN FAV
```

### Table 2: `users`
Stores registered customer accounts.
```
id | name        | email              | phone       | password (hashed)
---|-------------|--------------------|-----------  |------------------
1  | John Mensah | john@example.com   | 024XXXXXXX  | $2a$10$...
```

### Table 3: `orders`
Stores every order placed.
```
id | customer_name | customer_email      | phone      | address        | total  | status      | driver_name | driver_phone
---|---------------|---------------------|------------|----------------|--------|-------------|-------------|-------------
1  | John Mensah   | john@example.com    | 024XXXXXXX | Takoradi Market| 125.00 | On the way  | Kofi Adu    | 055XXXXXXX
```

### Table 4: `order_items`
Links orders to food items (one order can have many items).
```
id | order_id | food_id | quantity | price
---|----------|---------|----------|------
1  | 1        | 1       | 2        | 55.00
2  | 1        | 3       | 1        | 30.00
```

### Table 5: `reviews`
Stores customer reviews (admin approves before publishing).
```
id | order_id | food_id | customer_name | rating | comment          | status
---|----------|---------|---------------|--------|------------------|--------
1  | 1        | 1       | John Mensah   | 5      | Amazing burger!  | pending
```

### Table 6: `delivery_tracking` ⭐ NEW
Stores the driver's real-time GPS location (updated every 5 seconds).
```
id | order_id | driver_name | latitude  | longitude  | speed_kmh | heading | updated_at
---|----------|-------------|-----------|------------|-----------|---------|-------------------
1  | 1        | Kofi Adu    | 4.9016000 | -1.7571000 | 35.5      | 90      | 2025-03-03 11:30:00
```

---

## 🔄 How a Complete Order Works (Flow Diagram)

```
CUSTOMER                    FRONTEND (JS)              BACKEND (Java)           DATABASE
   │                             │                           │                      │
   │ 1. Browses menu             │                           │                      │
   │──────────────────────────►  │                           │                      │
   │                             │ GET /api/foods ──────────►│                      │
   │                             │                           │ SELECT * FROM foods ►│
   │                             │                           │◄─────────────────────│
   │◄────────────────────────────│◄──────────────────────────│                      │
   │ Sees food cards             │                           │                      │
   │                             │                           │                      │
   │ 2. Adds to cart             │                           │                      │
   │──────────────────────────►  │ (stored in localStorage)  │                      │
   │                             │                           │                      │
   │ 3. Clicks "Place Order"     │                           │                      │
   │──────────────────────────►  │                           │                      │
   │ Fills name, email, phone,   │                           │                      │
   │ address, payment            │                           │                      │
   │                             │ POST /api/orders ────────►│                      │
   │                             │ { name, email, total... } │ INSERT INTO orders ──►│
   │                             │                           │◄─────────────────────│
   │◄────────────────────────────│◄──────────────────────────│ { orderId: 5 }       │
   │ Sees "Order Placed! #5"     │                           │                      │
   │                             │                           │                      │
ADMIN                            │                           │                      │
   │ 4. Sees order in panel      │                           │                      │
   │──────────────────────────►  │ GET /api/orders ─────────►│                      │
   │                             │                           │ SELECT * FROM orders ►│
   │◄────────────────────────────│◄──────────────────────────│                      │
   │ Clicks "Start Preparing"    │                           │                      │
   │──────────────────────────►  │ PUT /api/orders/5/status ►│                      │
   │                             │ { status: "Preparing" }   │ UPDATE orders SET... ►│
   │                             │                           │                      │
   │ Clicks "Assign Driver"      │                           │                      │
   │──────────────────────────►  │ PUT /api/orders/5/driver ►│                      │
   │                             │ { driver_name: "Kofi",    │ UPDATE orders SET... ►│
   │                             │   driver_phone: "055..." }│                      │
   │                             │                           │ EmailService ────────►│ Gmail SMTP
   │                             │                           │ sends "On the way"    │ → customer email
   │                             │                           │                      │
DRIVER (phone)                   │                           │                      │
   │ 5. Opens Driver Mode        │                           │                      │
   │──────────────────────────►  │                           │                      │
   │ Enters name + order ID 5    │                           │                      │
   │ Taps "Start Sharing"        │                           │                      │
   │ (GPS reads every 5 seconds) │                           │                      │
   │──────────────────────────►  │ POST /api/tracking ──────►│                      │
   │                             │ { order_id:5, lat:4.90,   │ UPSERT delivery_ ────►│
   │                             │   lng:-1.75, speed:35 }   │ tracking table        │
   │                             │                           │                      │
CUSTOMER                         │                           │                      │
   │ 6. Opens Track Order        │                           │                      │
   │──────────────────────────►  │                           │                      │
   │ Enters order ID: 5          │                           │                      │
   │                             │ GET /api/tracking?order_id=5 ──────────────────►│
   │                             │                           │ SELECT FROM tracking ►│
   │◄────────────────────────────│◄──────────────────────────│ { lat, lng, speed }  │
   │ Sees live map + driver info │ (repeats every 5 seconds) │                      │
   │                             │                           │                      │
ADMIN                            │                           │                      │
   │ 7. Clicks "Mark Delivered"  │                           │                      │
   │──────────────────────────►  │ PUT /api/orders/5/status ►│                      │
   │                             │ { status: "Delivered" }   │ UPDATE orders SET... ►│
   │                             │                           │ EmailService ────────►│ Gmail SMTP
   │                             │                           │ sends "Delivered!"    │ → customer email
```

---

## 🌐 API Reference

All API endpoints are served at `http://localhost:8080`

| Method | Endpoint | What It Does | Who Calls It |
|--------|----------|-------------|--------------|
| GET | `/api/health` | Check server is alive | Browser |
| GET | `/api/foods` | Get all menu items | Customer (page load) |
| GET | `/api/orders` | Get all orders | Admin panel |
| POST | `/api/orders` | Place a new order | Customer checkout |
| PUT | `/api/orders/{id}/status` | Change order status | Admin |
| PUT | `/api/orders/{id}/driver` | Assign driver | Admin |
| POST | `/api/users/register` | Create account | Customer |
| POST | `/api/users/login` | Login | Customer |
| GET | `/api/reviews` | Get all reviews | Menu page |
| POST | `/api/reviews` | Submit a review | Customer |
| **POST** | **`/api/tracking`** | **Driver sends GPS** | **Driver's phone** |
| **GET** | **`/api/tracking?order_id=X`** | **Get driver location** | **Customer (every 5s)** |

---

## ✨ Key Features Explained

### 1. 🍔 Menu System
- 15 food items across 6 categories (Burgers, Pizza, Local, Chicken, Drinks, Desserts)
- Search by name or description
- Filter by category
- Sort by price, rating, or popularity
- Each item has: name, description, price, emoji, rating, review count, prep time, calories

### 2. 🛒 Shopping Cart
- Add/remove items, adjust quantities
- Promo code support (WELCOME50, SAVE10, QUICKBITE, FREEDEL, LOCAL20)
- Delivery zone selection with different fees
- Special instructions field
- Persists in localStorage (survives page refresh)

### 3. 📦 Checkout
- Collects: Full Name, Email, Phone, Delivery Address, Delivery Zone
- Payment options: Mobile Money (MTN/Vodafone/AirtelTigo), Cash on Delivery, Card
- Sends order to Java backend → saved in MySQL

### 4. 📍 Real-Time GPS Tracking ⭐ KEY FEATURE
- **Driver side:** Uses browser's `navigator.geolocation.watchPosition()` API
  - Reads GPS coordinates continuously
  - POSTs to `/api/tracking` every 5 seconds
  - Works on any smartphone browser (Chrome, Safari, Firefox)
- **Customer side:** JavaScript polls `/api/tracking?order_id=X` every 5 seconds
  - Renders an OpenStreetMap iframe with the driver's pin
  - Shows driver name, phone, speed
  - No Google Maps API key needed — completely free

### 5. ✉️ Email Notifications ⭐ KEY FEATURE
- Uses **Gmail SMTP** via Java's `javax.mail` library
- Two automatic emails:
  1. **"On the Way"** — sent when admin assigns a driver
  2. **"Delivered"** — sent when admin marks order as delivered
- Beautiful HTML email templates with order summary
- Runs in a background thread (doesn't slow down the API response)

### 6. 🔧 Admin Panel
- Password-protected (default: `quickbite2025`)
- Shows all orders with stats (total revenue, orders by status)
- Action buttons per order:
  - 🍳 Start Preparing
  - 🚗 Assign Driver (opens modal with driver name/phone fields)
  - ✅ Mark Delivered
  - 📍 Track Live (opens tracking modal for that order)

### 7. 🌙☀️ Dark / Light Mode ⭐ KEY FEATURE
- Toggle button (☀️/🌙) in the top-right navbar
- Smooth 0.35-second transition between themes
- Preference saved in localStorage
- Complete light mode with warm off-white palette

### 8. ⭐ Reviews System
- Customers can rate orders 1–5 stars
- Reviews go to admin for approval before publishing
- Stored in MySQL `reviews` table

---

## 🛠️ Technologies & Why We Chose Them

| Technology | Why We Used It |
|-----------|---------------|
| **HTML5** | Standard web structure — works in every browser |
| **CSS3** | Modern styling with CSS variables for easy theming |
| **Vanilla JavaScript** | No framework needed — keeps it simple and fast |
| **Java (JDK 11+)** | Robust, typed language for server-side logic |
| **Java HttpServer** | Built into Java — no extra web framework needed |
| **MySQL (XAMPP)** | Industry-standard relational database, easy local setup |
| **JDBC** | Java's standard way to talk to databases |
| **Browser Geolocation API** | Free GPS — built into every modern browser |
| **OpenStreetMap** | Free map tiles — no API key or billing required |
| **Gmail SMTP** | Free email sending via App Passwords |

---

## 🚀 How to Run the Project (Step by Step)

### Prerequisites (install these first)
1. **XAMPP** — https://www.apachefriends.org/ (for MySQL)
2. **Java JDK 11+** — https://adoptium.net/
3. **VS Code** — https://code.visualstudio.com/
4. **Live Server extension** for VS Code

### Running the Project

**Step 1: Start the Database**
```
1. Open XAMPP Control Panel
2. Click START next to MySQL
3. Click START next to Apache
4. Open browser → http://localhost/phpmyadmin
5. Click SQL tab
6. Paste contents of: FRONTEND/BACKEND/database.sql
7. Click Go
```

**Step 2: Compile the Java Backend**
```cmd
Open Command Prompt and run:

cd "c:\Users\HP\Downloads\FOOD ORDERING SYSTEM\FRONTEND\BACKEND"
mkdir out
javac -cp "lib/*" -d out src/*.java
```

**Step 3: Start the Java Server**
```cmd
java -cp "out;lib/*" Main
```
Leave this terminal open. You should see:
```
✅ Database connected successfully!
🚀 Server started! Listening on http://localhost:8080
```

**Step 4: Open the Website**
```
1. Open VS Code
2. Open the FRONTEND folder
3. Right-click index.html
4. Select "Open with Live Server"
5. Website opens at http://localhost:5500
```

**Step 5: Test the App**
- Browse the menu and add items to cart
- Place an order (use any name/email/phone)
- Go to Admin (password: `quickbite2025`)
- Update the order status
- Try the Track Order feature

---

## 🧪 Testing the Real-Time Tracking

To test GPS tracking without a real driver:

**Option A — Use your own phone:**
1. Connect your phone to the same WiFi as your computer
2. Find your computer's local IP (run `ipconfig` in cmd, look for IPv4)
3. Open `http://YOUR_IP:5500` on your phone
4. Click 🚗 Driver in the nav
5. Enter a name and order ID → Start Sharing
6. On your computer, open Track Order and enter the same order ID

**Option B — Simulate in browser (for demo):**
You can manually POST a location using any REST client (Postman, curl, or browser console):
```javascript
fetch('http://localhost:8080/api/tracking', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    order_id: 1,
    driver_name: "Kofi Adu",
    latitude: 4.9016,
    longitude: -1.7571,
    speed_kmh: 35.5,
    heading: 90
  })
})
```
Then open Track Order → enter order ID 1 → see the map appear.

---

## 📊 Project Statistics

| Metric | Value |
|--------|-------|
| Total files | 12 source files |
| Lines of Java code | ~1,200 lines |
| Lines of JavaScript | ~1,300 lines |
| Lines of CSS | ~1,500 lines |
| Database tables | 6 tables |
| API endpoints | 12 endpoints |
| Food items (sample data) | 15 items |
| Promo codes | 5 codes |

---

## 🔐 Security Notes

- Admin panel is password-protected
- Passwords are stored (in a real deployment, they would be hashed with bcrypt)
- CORS headers allow only specific origins
- SQL queries use `PreparedStatement` to prevent SQL injection
- Email credentials are stored in source code (in production, use environment variables)

---

## 🌍 Real-World Applicability

This system could be deployed for a real restaurant in Sekondi-Takoradi by:
1. Hosting the Java backend on a cloud server (AWS, DigitalOcean, etc.)
2. Hosting the frontend on Netlify or Vercel
3. Using a cloud MySQL database (PlanetScale, AWS RDS)
4. Replacing the Gmail SMTP with a professional email service (SendGrid, Mailgun)
5. Adding HTTPS (required for GPS on real phones)

---

## 👨‍💻 Developer Notes

- The project uses **no external JavaScript frameworks** (no React, Vue, Angular) — pure Vanilla JS
- The Java backend uses **no external web frameworks** (no Spring Boot) — pure Java HttpServer
- The map uses **OpenStreetMap** (free, no API key) instead of Google Maps
- The GPS tracking uses the **browser's built-in Geolocation API** (free, no third-party service)
- All features degrade gracefully — if the backend is offline, the frontend still works with localStorage

---

*QuickBite — Built with ❤️ for Ghana 🇬🇭*  
*Sekondi-Takoradi, Western Region*  
*📞 +233 50 95 11 074 · ✉️ quayen010@gmail.com*
