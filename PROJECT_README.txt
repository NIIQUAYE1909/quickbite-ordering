================================================================================
                    QUICKBITE - ONLINE FOOD ORDERING SYSTEM
                           PROJECT DOCUMENTATION
================================================================================

PROJECT OVERVIEW
--------------------------------------------------------------------------------
QuickBite is a full-stack online food ordering system for a restaurant in 
Sekondi-Takoradi, Ghana. It allows customers to browse a menu, place orders,
track deliveries in real-time, and receive email notifications.

TECHNOLOGY STACK
--------------------------------------------------------------------------------
- Frontend: HTML, CSS, JavaScript (Vanilla)
- Backend: Java (JDK 11+) with built-in HTTP server
- Database: MySQL (via XAMPP)
- External APIs: OpenStreetMap (for GPS tracking)

PROJECT STRUCTURE
================================================================================

FOOD ORDERING SYSTEM/
├── FRONTEND/
│   ├── index.html          # Main frontend page
│   ├── main.js             # Frontend JavaScript logic
│   ├── style.css           # Styling (dark/light mode)
│   ├── env.js              # API configuration
│   ├── env.example.js      # Template for env.js
│   └── BACKEND/
│       ├── src/
│       │   ├── Main.java              # Entry point
│       │   ├── Server.java            # HTTP server & routing
│       │   ├── DatabaseConnection.java # MySQL connection
│       │   ├── FoodRoutes.java        # /api/foods endpoints
│       │   ├── OrderRoutes.java       # /api/orders endpoints
│       │   ├── UserRoutes.java        # /api/users endpoints
│       │   ├── ReviewRoutes.java      # /api/reviews endpoints
│       │   ├── TrackingRoutes.java    # /api/tracking endpoints
│       │   └── EmailService.java      # Email notifications
│       ├── lib/
│       │   └── mysql-connector-j-9.6.0.jar  # MySQL driver
│       ├── database.sql        # Database schema & seed data
│       ├── config.properties   # Configuration (DB credentials)
│       ├── Procfile            # For Render deployment
│       ├── SETUP.md            # Setup instructions
│       └── README.md           # Full documentation
├── .gitignore
├── PROJECT_OVERVIEW.md
└── README.md


HOW TO RUN THE PROJECT (LOCAL DEVELOPMENT)
================================================================================

PREREQUISITES:
1. XAMPP (for MySQL) - https://www.apachefriends.org/
2. Java JDK 11+ - https://adoptium.net/
3. VS Code with Live Server extension

STEP 1: START DATABASE
--------------------------------------------------------------------------------
1. Open XAMPP Control Panel
2. Start Apache and MySQL
3. Go to http://localhost/phpmyadmin
4. Create a database named "quickbite"
5. Click the SQL tab and paste contents of FRONTEND/BACKEND/database.sql
6. Click Go

STEP 2: CONFIGURE DATABASE
--------------------------------------------------------------------------------
1. Go to FRONTEND/BACKEND/
2. Copy config.properties.template to config.properties
3. Edit config.properties with your settings:
   - db.url=jdbc:mysql://localhost:3306/quickbite
   - db.user=root
   - db.password= (leave empty for XAMPP)

STEP 3: RUN BACKEND
--------------------------------------------------------------------------------
In PowerShell:
  cd "c:/Users/HP/Downloads/FOOD ORDERING SYSTEM/FRONTEND/BACKEND"
  java -cp "src;lib/mysql-connector-j-9.6.0.jar;." Main

The backend runs on: http://localhost:8080

STEP 4: RUN FRONTEND
--------------------------------------------------------------------------------
1. Open VS Code
2. Right-click FRONTEND/index.html
3. Select "Open with Live Server"
4. The app runs on http://localhost:5500


API ENDPOINTS (BACKEND)
================================================================================

FOODS
------
GET  http://localhost:8080/api/foods
     - Returns all food items from the menu

ORDERS
------
POST http://localhost:8080/api/orders
     - Place a new order
     - Body: {customer_name, phone, address, items:[{food_id, quantity}]}

GET  http://localhost:8080/api/orders
     - Get all orders (for admin)

PUT  http://localhost:8080/api/orders/{id}/status
     - Update order status
     - Body: {status: "Confirmed|Preparing|On the way|Delivered"}

PUT  http://localhost:8080/api/orders/{id}/driver
     - Assign driver to order
     - Body: {driver_name, driver_phone}

USERS
------
POST http://localhost:8080/api/users/register
     - Register new user
     - Body: {name, email, phone, password}

POST http://localhost:8080/api/users/login
     - User login
     - Body: {email, password}

REVIEWS
-------
POST http://localhost:8080/api/reviews
     - Submit a review
     - Body: {order_id, food_id, customer_name, rating, comment}

GET  http://localhost:8080/api/reviews
     - Get all approved reviews

TRACKING (GPS)
--------------
POST http://localhost:8080/api/tracking
     - Driver posts GPS location
     - Body: {order_id, driver_name, latitude, longitude, speed_kmh, heading}

GET  http://localhost:8080/api/tracking?order_id={id}
     - Get current location for an order

HEALTH CHECK
------------
GET  http://localhost:8080/api/health
     - Check if server is running


KEY FEATURES
================================================================================

1. MENU DISPLAY
   - Categories: Burgers, Pizza, Local Ghanaian, Chicken, Drinks, Desserts
   - Ratings and badges (HOT, NEW, DEAL)
   - Search functionality

2. SHOPPING CART
   - Add/remove items
   - Update quantities
   - View total price

3. ORDER MANAGEMENT
   - Place orders with contact details
   - Order status tracking (Confirmed → Preparing → On the way → Delivered)

4. REAL-TIME GPS TRACKING
   - Driver shares location via phone browser
   - Customer sees driver location on map
   - Updates every 5 seconds

5. EMAIL NOTIFICATIONS
   - Email sent when order is on the way
   - Email sent when order is delivered

6. ADMIN PANEL
   - View all orders
   - Update order status
   - Assign drivers
   - View delivery tracking

7. DRIVER INTERFACE
   - Driver enters name and order ID
   - Shares GPS location
   - Location visible to customer

8. DARK/LIGHT MODE
   - Toggle between themes
   - Preference saved in browser


DATABASE SCHEMA
================================================================================

foods
------
id          INT (PK)
name        VARCHAR(150)
description TEXT
price       DECIMAL(10,2)
emoji       VARCHAR(10)
category    VARCHAR(50)
rating      DECIMAL(2,1)
badge       VARCHAR(30)

users
-----
id         INT (PK)
name       VARCHAR(100)
email      VARCHAR(150) UNIQUE
phone      VARCHAR(20)
password   VARCHAR(255)
created_at TIMESTAMP

orders
------
id             INT (PK)
customer_name  VARCHAR(100)
customer_email VARCHAR(150)
phone          VARCHAR(20)
address        VARCHAR(255)
total          DECIMAL(10,2)
status         VARCHAR(50)
driver_name    VARCHAR(100)
driver_phone   VARCHAR(20)
created_at     TIMESTAMP

order_items
-----------
id       INT (PK)
order_id INT (FK)
food_id  INT (FK)
quantity INT
price    DECIMAL(10,2)

delivery_tracking
-----------------
id         INT (PK)
order_id   INT (FK)
driver_name VARCHAR(100)
latitude   DECIMAL(10,7)
longitude  DECIMAL(10,7)
speed_kmh  DECIMAL(5,1)
heading    INT
updated_at TIMESTAMP

reviews
-------
id           INT (PK)
order_id     INT
food_id      INT
customer_name VARCHAR(100)
rating       INT
comment      TEXT
status       VARCHAR(20)
created_at   TIMESTAMP


DEFAULT CREDENTIALS
================================================================================
Admin Panel Password: quickbite2025
(The password is hardcoded in main.js - search for "quickbite2025")


HOSTING ON RENDER (CLOUD)
================================================================================

1. Create account at https://render.com

2. Deploy MySQL Database:
   - Dashboard → New → PostgreSQL (or MySQL)
   - Note the connection string

3. Deploy Backend:
   - Dashboard → New → Web Service
   - Connect GitHub repository
   - Start command: java -cp "src:lib/mysql-connector-j-9.6.0.jar:." Main
   - Add environment variables:
     * db.url = your-mysql-connection-string
     * db.user = your-db-username
     * db.password = your-db-password

4. Deploy Frontend:
   - Use GitHub Pages or Netlify
   - Edit FRONTEND/env.js with your backend URL

Full instructions in: FRONTEND/BACKEND/SETUP.md


CONTACT
================================================================================
Developer: Quaye (Nii Quaye Kingsley Asare)
Email: quayen010@gmail.com
Location: Sekondi-Takoradi, Ghana

================================================================================
                           OOP CONCEPTS IMPLEMENTED
================================================================================

YOUR PROJECT USES THESE OBJECT-ORIENTED PROGRAMMING CONCEPTS:

1. CLASSES (OOP)
   - DatabaseConnection.java  - Handles database operations
   - FoodRoutes.java         - Handles food API requests
   - OrderRoutes.java        - Handles order API requests  
   - UserRoutes.java         - Handles user API requests
   - ReviewRoutes.java       - Handles review API requests
   - TrackingRoutes.java     - Handles GPS tracking
   - Server.java             - HTTP server class
   - EmailService.java       - Email service class
   - Main.java               - Entry point class

2. TYPES OF METHODS

   a) INSTANCE METHODS
      - Called on an object of the class
      - Example: connect(), getAllFoods()
      - Can access instance variables

   b) STATIC METHODS
      - Called on the class itself, not an object
      - Example: DatabaseConnection.getConnection()
      - Cannot access instance variables (only static ones)

   c) PRIVATE METHODS
      - Only accessible within the same class
      - Example: loadConfig() in DatabaseConnection
      - Used for internal helper functions

   d) PUBLIC METHODS
      - Accessible from anywhere
      - Example: start() in Server, handle() in FoodRoutes

   e) VOID METHODS
      - Don't return any value
      - Example: connect(), start()

   f) RETURN METHODS  
      - Return a value
      - Example: getConnection() returns Connection object

   g) OVERRIDE METHODS
      - Implement interface methods
      - Example: handle() @Override in all *Routes classes
      - All implement HttpHandler interface

3. KEY OOP CONCEPTS DEMONSTRATED

   ✅ ENCAPSULATION
      - Private fields: private static Connection connection
      - Public getters: public static Connection getConnection()
      - Data hiding: Database credentials are encapsulated

   ✅ ABSTRACTION
      - Complex DB operations hidden in DatabaseConnection class
      - User doesn't need to know how DB connection works
      - Just call getConnection()

   ✅ INHERITANCE
      - All *Routes classes inherit/implement HttpHandler
      - They override the handle() method

   ✅ INTERFACES
      - HttpHandler from com.sun.net.httpserver
      - All route classes implement this interface

4. JAVA HTTP SERVER METHODS USED

   - HttpServer.createContext()  - Creates API routes/endpoints
   - server.setExecutor()        - Thread pool for multiple requests
   - server.start()              - Starts the server
   - exchange.sendResponseHeaders() - Sends HTTP response
   - exchange.getRequestMethod() - Gets GET, POST, PUT, etc.
   - exchange.getRequestBody()  - Reads POST data

5. METHOD SIGNATURE EXAMPLES

   public void connect()              // instance, void
   public static Connection getConnection()  // static, return
   private Properties loadConfig()     // private, return
   public void handle(HttpExchange)    // public, void, override
   public static void sendResponse()   // static, void, public


================================================================================
                              END OF OOP SECTION
================================================================================

================================================================================
                              END OF DOCUMENTATION
================================================================================
