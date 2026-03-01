# 🍽️ QuickBite — Online Food Ordering System

A full-stack food ordering web application built with HTML/CSS/JavaScript (frontend) and Java (backend) connected to MySQL via XAMPP. Features a modern design with cart, wishlist, promo codes, checkout flow, and order tracking.

---

## 📁 Project Structure

```
food-ordering-system/
│
├── FRONTEND/                     ← Everything the user SEES
│   ├── index.html                ← Main page structure
│   ├── style.css                 ← All visual styling
│   ├── main.js                   ← All interactivity & logic
│   └── assets/                   ← Images and icons
│
└── FRONTEND/BACKEND/             ← Server-side Java code
    ├── src/
    │   ├── Main.java             ← Entry point (run this)
    │   ├── Server.java            ← HTTP server & routing
    │   ├── DatabaseConnection.java ← MySQL connection
    │   ├── FoodRoutes.java       ← /api/foods
    │   ├── OrderRoutes.java       ← /api/orders
    │   └── UserRoutes.java        ← /api/users
    ├── lib/                      ← JAR files (MySQL Connector)
    ├── database.sql               ← Run this in phpMyAdmin
    └── config.properties          ← Database credentials
```

---

## 🚀 How to Set Up & Run

### Step 1 — Database Setup
1. Open **XAMPP Control Panel**
2. Start **Apache** and **MySQL**
3. Open browser → go to `http://localhost/phpmyadmin`
4. Click the **SQL** tab
5. Copy & paste everything from `FRONTEND/BACKEND/database.sql`
6. Click **Go** — this creates your database and tables

### Step 2 — Download Required JAR Files
Put the MySQL Connector JAR in the `FRONTEND/BACKEND/lib/` folder:
- **MySQL Connector**: https://dev.mysql.com/downloads/connector/j/
  - Download the platform-independent ZIP, extract the `.jar` file

### Step 3 — Run the Frontend
1. Open the `FRONTEND/` folder in VS Code
2. Right-click `index.html` → **Open with Live Server**
3. Your app opens in the browser at `http://localhost:5500`

### Step 4 — Run the Backend
In the terminal, navigate to the backend folder and compile + run:

```cmd
cd c:\Users\HP\Downloads\FOOD ORDERING SYSTEM\FRONTEND\BACKEND

REM Compile all Java files
javac -cp "lib/*" -d out src/*.java

REM Run the server
java -cp "out;lib/*" Main
```

You should see:
```
✅ Database connected successfully!
🚀 Server started! Listening on http://localhost:8080
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🍔 Menu Browsing | Browse food items with categories (Burgers, Pizza, Local, Chicken, Drinks, Desserts) |
| 🔍 Search & Filter | Search by name/description, filter by category, sort by price/rating |
| 🛒 Shopping Cart | Add items, adjust quantities, view totals |
| ♡ Wishlist | Save favorite items for later |
| 🎫 Promo Codes | Apply discount codes (Try: WELCOME50 for 50% off) |
| 📦 Checkout | Full checkout with delivery details and payment options |
| 📍 Order Tracking | Track order status by ID |
| ⭐ Reviews | Rate and review your orders |
| 💾 Auto-Save | Cart, wishlist, and orders persist in local storage |

---

## 🧠 How It All Works Together

```
USER (Browser)
     ↓  clicks "Add to Cart" / "Place Order"
HTML + CSS + JavaScript (frontend)
     ↓  sends HTTP request (fetch)
Java HTTP Server (backend — port 8080)
     ↓  runs SQL query
MySQL Database (XAMPP — port 3306)
     ↓  returns data
Java sends JSON response
     ↓
JavaScript updates the page
```

---

## 📡 API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/health | Check if server is running |
| GET | /api/foods | Get all food items |
| GET | /api/orders | Get all orders |
| POST | /api/orders | Place a new order |
| POST | /api/users/register | Register new user |
| POST | /api/users/login | Login user |

---

## 🛠️ Technologies Used

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | HTML5 | Page structure |
| Frontend | CSS3 | Styling & animations |
| Frontend | JavaScript (Vanilla) | Interactivity & API calls |
| Backend | Java | Server logic & API |
| Database | MySQL (XAMPP) | Data storage |

---

*Built with ❤️ for Sekondi-Takoradi, Ghana 🇬🇭*
