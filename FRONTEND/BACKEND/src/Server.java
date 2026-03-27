// =============================================
// QuickBite - Food Ordering System
// Server.java
// This file starts an HTTP server and defines API routes
// It uses Java's built-in HttpServer (no extra library needed)
// Routes are like "doors" — each URL path leads to a different action
// =============================================



import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.util.concurrent.Executors;

public class Server {

    // The port our server listens on
    // Frontend will send requests to: http://localhost:8080/api/...
    private static int getPort() {
        String envPort = System.getenv("PORT");
        if (envPort != null && !envPort.isEmpty()) {
            return Integer.parseInt(envPort);
        }
        return 8080;
    }
    private static final int PORT = getPort();

    public void start() {
        try {
            // Create the HTTP server on port 8080
            HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);

            // ---- REGISTER ROUTES ----
            // Each context (path) is connected to a handler class
            // e.g. GET http://localhost:8080/api/foods → FoodRoutes handles it
            server.createContext("/api/foods",    new FoodRoutes());
            server.createContext("/api/orders",   new OrderRoutes());
            server.createContext("/api/users",    new UserRoutes());
            server.createContext("/api/complaints", new ComplaintRoutes());
            server.createContext("/api/reviews",  new ReviewRoutes());
            server.createContext("/api/tracking", new TrackingRoutes());

            // A simple health-check route so we know the server is alive
            server.createContext("/api/health", (exchange) -> {
                addCorsHeaders(exchange);           // Allow frontend to talk to backend
                String response = "{\"status\":\"QuickBite server is running!\"}";
                sendResponse(exchange, 200, response);
            });

            // Use a thread pool so multiple requests can be handled at once
            server.setExecutor(Executors.newFixedThreadPool(10));

            // Start the server!
            server.start();

            System.out.println("🚀 Server started! Listening on http://localhost:" + PORT);
            System.out.println("📡 Available routes:");
            System.out.println("   GET  http://localhost:" + PORT + "/api/health");
            System.out.println("   GET  http://localhost:" + PORT + "/api/foods");
            System.out.println("   POST http://localhost:" + PORT + "/api/orders");
            System.out.println("   PUT  http://localhost:" + PORT + "/api/orders/{id}/status");
            System.out.println("   PUT  http://localhost:" + PORT + "/api/orders/{id}/driver");
            System.out.println("   POST http://localhost:" + PORT + "/api/users/register");
            System.out.println("   POST http://localhost:" + PORT + "/api/users/login");
            System.out.println("   POST http://localhost:" + PORT + "/api/reviews");
            System.out.println("   GET  http://localhost:" + PORT + "/api/reviews");
            System.out.println("   POST http://localhost:" + PORT + "/api/tracking  (driver posts GPS)");
            System.out.println("   GET  http://localhost:" + PORT + "/api/tracking?order_id=X  (customer polls)");
            System.out.println("==========================================");

        } catch (IOException e) {
            System.out.println("❌ Server failed to start.");
            e.printStackTrace();
        }
    }

    // ---- CORS HEADERS ----
    // CORS (Cross-Origin Resource Sharing) allows your HTML frontend
    // (running on file:// or localhost:5500) to talk to your Java backend
    // Without this, the browser will BLOCK the request for security reasons
    public static void addCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type, Authorization");
        exchange.getResponseHeaders().add("Content-Type", "application/json");
    }

    // ---- SEND RESPONSE HELPER ----
    // A reusable method to send JSON responses back to the frontend
    public static void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        byte[] bytes = response.getBytes("UTF-8");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(bytes);
        os.close();
    }

    // ---- READ REQUEST BODY ----
    // Used to read the JSON data sent from the frontend in POST requests
    public static String readRequestBody(HttpExchange exchange) throws IOException {
        return new String(exchange.getRequestBody().readAllBytes(), "UTF-8");
    }
}