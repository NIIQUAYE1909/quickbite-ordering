# QuickBite — Setup Instructions

Complete step-by-step guide to get QuickBite running on your machine.

---

## 🚀 Quick Start (Run Everything in 3 Steps!)

| Step | What to Do | Command / Action |
|------|------------|-------------------|
| 1 | Start XAMPP | Open XAMPP Control Panel → Start Apache & MySQL |
| 2 | Setup Database | Go to `http://localhost/phpmyadmin` → Create database `quickbite` → Import `database.sql` |
| 3 | Run Backend | Open terminal in `FRONTEND/BACKEND` → Run: `java -cp "src;lib/mysql-connector-j-9.6.0.jar;." Main` |
| 4 | Run Frontend | Open `FRONTEND/index.html` with Live Server |

**Backend runs on:** `http://localhost:8080`
**Frontend runs on:** `http://localhost:5500`

---

## Prerequisites

- **XAMPP** (for MySQL database) — https://www.apachefriends.org/
- **Java JDK 11+** — https://adoptium.net/
- **VS Code** with the **Live Server** extension
- **MySQL Connector JAR** (already included in `lib/`)

---

## Step 1 — Create config.properties

Create a file named `config.properties` in the `FRONTEND/BACKEND/` folder with this content:

```properties
# QuickBite - Configuration

# Database connection settings (XAMPP defaults)
db.url=jdbc:mysql://localhost:3306/quickbite
db.user=root
db.password=

# Server port
server.port=8080

# Admin settings
admin.email=your-email@gmail.com
```

---

## Step 2 — Database Setup

1. Open **XAMPP Control Panel**
2. Start **Apache** and **MySQL**
3. Open browser → go to `http://localhost/phpmyadmin`
4. Click the **SQL** tab
5. Copy & paste ALL content from `FRONTEND/BACKEND/database.sql`
6. Click **Go**

This creates:
- `quickbite` database
- `foods`, `users`, `orders`, `order_items`, `reviews` tables
- `delivery_tracking` table (for real-time GPS tracking) ⭐ NEW
- Sample food menu data

**If you already have an existing database**, run these upgrade commands:
```sql
ALTER TABLE orders ADD COLUMN customer_email VARCHAR(150);
ALTER TABLE orders ADD COLUMN driver_name VARCHAR(100);
ALTER TABLE orders ADD COLUMN driver_phone VARCHAR(20);

CREATE TABLE IF NOT EXISTS delivery_tracking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    driver_name VARCHAR(100),
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    speed_kmh DECIMAL(5,1) DEFAULT 0,
    heading INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
```

---

## Step 3 — Configure Email Notifications ⭐ NEW

To send automatic emails to customers when their order is on the way or delivered:

1. Open `FRONTEND/BACKEND/src/EmailService.java`
2. Find this line near the top:
   ```java
   private static final String FROM_PASSWORD = "YOUR_GMAIL_APP_PASSWORD_HERE";
   ```
3. Replace `YOUR_GMAIL_APP_PASSWORD_HERE` with your Gmail App Password:
   - Go to [https://myaccount.google.com/security](https://myaccount.google.com/security)
   - Enable **2-Step Verification** (required)
   - Scroll down to **App Passwords**
   - Create a new App Password → select "Mail" → copy the 16-character code
   - Paste it in the file (no spaces needed)
4. Example result:
   ```java
   private static final String FROM_PASSWORD = "abcdabcdabcdabcd";
   ```
5. The sender email is already set to `quayen010@gmail.com`

> **Note:** If you skip this step, the app still works perfectly — emails are just skipped silently.

---

## Step 4 — Run the Backend

**The server is already running!** If you need to restart it:

Open a terminal (Command Prompt or VS Code terminal):

```cmd
cd "c:\Users\HP\Downloads\FOOD ORDERING SYSTEM\FRONTEND\BACKEND"

REM Run the server (already compiled)
java -cp "src;lib/mysql-connector-j-9.6.0.jar;." Main
```

**Expected output:**
```
✅ Database connected successfully!
✉️  Email service ready — sending from: quayen010@gmail.com
🚀 Server started! Listening on http://localhost:8080
📡 Available routes:
   GET  http://localhost:8080/api/health
   GET  http://localhost:8080/api/foods
   POST http://localhost:8080/api/orders
   PUT  http://localhost:8080/api/orders/{id}/status
   PUT  http://localhost:8080/api/orders/{id}/driver
   POST http://localhost:8080/api/users/register
   POST http://localhost:8080/api/users/login
   POST http://localhost:8080/api/reviews
   GET  http://localhost:8080/api/reviews
   POST http://localhost:8080/api/tracking  (driver posts GPS)
   GET  http://localhost:8080/api/tracking?order_id=X  (customer polls)
==========================================
```

Keep this terminal open while using the app.

---

## Step 5 — Run the Frontend

1. Open VS Code
2. Open the `FRONTEND/` folder
3. Right-click `index.html` → **Open with Live Server**
4. App opens at `http://localhost:5500`

---

## How to Use the New Features

### 🚗 Real-Time Driver Tracking

**As the Admin:**
1. Log in to Admin panel (password: `quickbite2025`)
2. When an order is "Preparing", click **🚗 Assign Driver**
3. Enter driver name and phone → click Assign
4. When order is "On the way", click **📍 Track Live** to see the map

**As the Driver (on their phone):**
1. Open the QuickBite website on their phone browser
2. Click **🚗 Driver** in the navigation bar
3. Enter their name and the order ID they're delivering
4. Tap **📍 Start Sharing Location**
5. Allow location access when the browser asks
6. Their GPS updates every 5 seconds — tap **🛑 Stop Sharing** when done

**As the Customer:**
1. Click **Track Order** in the nav
2. Enter the order number (just the number, e.g. `5`)
3. See live progress steps + driver name/phone
4. If the driver is sharing GPS, an OpenStreetMap shows their exact location
5. The map auto-refreshes every 5 seconds

### ✉️ Email Notifications

Emails are sent automatically (if configured):
- **"🚗 On Its Way!"** — when admin assigns a driver
- **"✅ Delivered!"** — when admin marks order as Delivered

Customers must provide their email at checkout (the Email field in the checkout form).

### 🌙☀️ Dark / Light Mode

- Click the **☀️** button in the top-right navbar
- Switches between dark (default) and light theme
- Preference is saved — remembered on next visit

---

## File Structure

```
FRONTEND/BACKEND/
├── src/
│   ├── Main.java                ← Entry point
│   ├── Server.java              ← HTTP server & routes
│   ├── DatabaseConnection.java  ← MySQL connection
│   ├── FoodRoutes.java          ← /api/foods
│   ├── OrderRoutes.java         ← /api/orders
│   ├── UserRoutes.java          ← /api/users
│   ├── ReviewRoutes.java        ← /api/reviews
│   ├── TrackingRoutes.java      ← /api/tracking ⭐ NEW
│   └── EmailService.java        ← Email notifications ⭐ NEW
├── lib/
│   └── mysql-connector-j-9.6.0.jar
├── out/                         ← Compiled .class files (auto-created)
├── database.sql                 ← Run in phpMyAdmin
├── config.properties            ← DB credentials
├── README.md                    ← Full documentation
└── SETUP.md                     ← This file
```

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| `MySQL Driver not found` | Make sure `mysql-connector-j-*.jar` is in the `lib/` folder |
| `Database not connected` | Check XAMPP MySQL is running on port 3306 |
| `config.properties not found` | Run the compile command from inside the `FRONTEND/BACKEND/` folder |
| `Port 8080 in use` | Stop any other Java processes, or change `PORT` in `Server.java` |
| `Email not sending` | Check `FROM_PASSWORD` in `EmailService.java` is a valid Gmail App Password |
| `GPS not working` | Driver must use HTTPS or localhost; allow location in browser settings |
| `Map not showing` | Driver must be sharing GPS first; map only appears when lat/lng data exists |
| `javac: command not found` | Install Java JDK and add it to your PATH |

---

## Quick Start Command (copy-paste)

```cmd
cd "c:\Users\HP\Downloads\FOOD ORDERING SYSTEM\FRONTEND\BACKEND" && java -cp "src;lib/mysql-connector-j-9.6.0.jar;." Main
```

---

*QuickBite · Sekondi-Takoradi, Ghana 🇬🇭 · quayen010@gmail.com*

---

## 🚀 Deploying to Production (Render/Railway)

### Option 1: Deploy Backend on Render (Free)

1. **Create a Render account:** https://render.com/
2. **Create a new Web Service:**
   - Connect your GitHub repository
   - Build command: (leave empty - Java doesn't need build)
   - Start command: `java -cp "src:lib/mysql-connector-j-9.6.0.jar:." Main`
3. **Add Environment Variables:**
   - Go to the "Environment" tab
   - Add these variables:
     - `db.url` = `jdbc:mysql://your-mysql-host:3306/quickbite`
     - `db.user` = `your-db-username`
     - `db.password` = `your-db-password`
4. **Deploy!** Render will give you a URL like `https://your-app.onrender.com`

### Option 2: Deploy Database on Render (Free MySQL)

1. In Render dashboard, click "New" → "PostgreSQL" or use a MySQL add-on
2. Get the connection string from the dashboard
3. Use that in your backend environment variables

### Option 3: Frontend Hosting

**Deploy Frontend on GitHub Pages (Free):**
1. Go to your GitHub repository
2. Settings → Pages
3. Select "main" branch and `/ (root)` folder
4. Save! Your site will be at `https://yourusername.github.io/Quickbites-online-food-ordering-system/`

**Update API URL:**
1. Edit `FRONTEND/env.js`
2. Change `API_URL` to your Render backend URL:
   ```js
   API_URL: 'https://your-backend.onrender.com/api'
   ```

---

## 📝 Quick Deploy Checklist

- [ ] Push code to GitHub
- [ ] Create Render account
- [ ] Deploy MySQL database on Render
- [ ] Deploy Java backend on Render with DB credentials
- [ ] Update `FRONTEND/env.js` with your backend URL
- [ ] Deploy frontend on GitHub Pages or Netlify
- [ ] Test your live app!

// CODE FOR RUNNING THE BACKEND 

cd "c:/Users/HP/Downloads/FOOD ORDERING SYSTEM/FRONTEND/BACKEND"; java -cp "src;lib/mysql-connector-j-9.6.0.jar;." Main
