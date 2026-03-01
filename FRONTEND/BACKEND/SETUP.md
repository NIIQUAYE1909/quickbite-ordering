# QuickBite - Setup Instructions

## 1. Download MySQL Connector JAR

The backend needs the MySQL JDBC driver to connect to the database.

### Steps to download:
1. Go to: https://dev.mysql.com/downloads/connector/j/
2. Under "Platform Independent", click "Download" for the ZIP archive
3. Extract the ZIP file
4. Find `mysql-connector-j-*.jar` (the .jar file, not the sources or javadoc)
5. Copy it to: `FRONTEND/BACKEND/lib/` folder

The folder structure should look like:
```
FRONTEND/BACKEND/
├── lib/
│   └── mysql-connector-j-9.6.0.jar   ← ADD THIS FILE
├── src/
│   ├── Main.java
│   ├── Server.java
│   ├── DatabaseConnection.java
│   ├── FoodRoutes.java
│   ├── OrderRoutes.java
│   └── UserRoutes.java
├── config.properties
└── database.sql
```

---

## 2. Run the Database Setup

1. Start XAMPP (Apache + MySQL)
2. Open phpMyAdmin: http://localhost/phpmyadmin
3. Click the "SQL" tab
4. Copy and paste ALL content from `database.sql`
5. Click "Go"

---

## 3. Run the Backend

Open a terminal in `FRONTEND/BACKEND/` folder:

```cmd
cd c:\Users\HP\Downloads\FOOD ORDERING SYSTEM\FRONTEND\BACKEND

REM Compile all Java files
javac -cp "lib/*" -d out src/*.java

REM Run the server
java -cp "out;lib/*" Main
```

Expected output:
```
✅ Database connected successfully!
🚀 Server started! Listening on http://localhost:8080
```

---

## 4. Run the Frontend

1. Open VS Code
2. Right-click `FRONTEND/index.html`
3. Select "Open with Live Server"
4. App opens at http://localhost:5500

---

## Features

- 🍔 Browse food menu with categories (Burgers, Pizza, Local Dishes, Chicken, Drinks, Desserts)
- 🔍 Search and filter food items
- 🛒 Add items to cart with quantity management
- ♡ Add items to favorites/wishlist
- 🎫 Apply promo codes (Try: WELCOME50 for 50% off)
- 📦 Full checkout flow with delivery details
- 📍 Track order status
- ⭐ Rate and review orders
- 💾 Local storage - cart, favorites, and orders persist across sessions

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| "MySQL Driver not found" | Make sure the JAR is in the lib folder |
| "Database not connected" | Check XAMPP MySQL is running |
| "config.properties not found" | The code now searches multiple paths automatically |
| "Port 8080 in use" | Stop any other Java processes or change PORT in Server.java |

// HOW TO START THE BACKEND
cd c:\Users\HP\Downloads\FOOD ORDERING SYSTEM\FRONTEND\BACKEND
java -cp "out;lib/*" Main
