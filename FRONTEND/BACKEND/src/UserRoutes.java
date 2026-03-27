// =============================================
// QuickBite - Food Ordering System
// UserRoutes.java
// Handles all /api/users requests (register, login)
// =============================================

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.sql.*;

public class UserRoutes implements HttpHandler {

    @Override
    public void handle(HttpExchange exchange) throws IOException {

        // Handle preflight CORS check
        if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
            Server.addCorsHeaders(exchange);
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        Server.addCorsHeaders(exchange);
        String method = exchange.getRequestMethod();

        if (method.equalsIgnoreCase("POST")) {
            String path = exchange.getRequestURI().getPath();
            if (path.endsWith("/register")) {
                registerUser(exchange);
            } else if (path.endsWith("/login")) {
                loginUser(exchange);
            } else {
                Server.sendResponse(exchange, 404, "{\"error\":\"Not found\"}");
            }
        } else {
            Server.sendResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
        }
    }

    // ---- REGISTER USER ----
    private void registerUser(HttpExchange exchange) throws IOException {
        Connection conn = DatabaseConnection.getConnection();

        if (conn == null) {
            Server.sendResponse(exchange, 500, "{\"error\":\"Database not connected. Please try again later.\"}");
            return;
        }

        try {
            String body = Server.readRequestBody(exchange);
            String name = extractJsonValue(body, "name");
            String email = extractJsonValue(body, "email");
            String phone = extractJsonValue(body, "phone");
            String password = extractJsonValue(body, "password");

            // Validate required fields
            if (name == null || name.trim().isEmpty()) {
                Server.sendResponse(exchange, 400, "{\"error\":\"Please enter your full name.\"}");
                return;
            }
            if (email == null || email.trim().isEmpty()) {
                Server.sendResponse(exchange, 400, "{\"error\":\"Please enter your email address.\"}");
                return;
            }
            if (password == null || password.isEmpty()) {
                Server.sendResponse(exchange, 400, "{\"error\":\"Please create a password.\"}");
                return;
            }

            // Validate password strength
            if (!PasswordHasher.isStrongPassword(password)) {
                Server.sendResponse(exchange, 400, "{\"error\":\"Password must be at least 8 characters with uppercase, lowercase, a number, and special character.\"}");
                return;
            }

            // Validate email format
            if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                Server.sendResponse(exchange, 400, "{\"error\":\"Please enter a valid email address.\"}");
                return;
            }

            // Check if user already exists (by email)
            String checkSql = "SELECT id FROM users WHERE email = ?";
            PreparedStatement checkStmt = conn.prepareStatement(checkSql);
            checkStmt.setString(1, email.trim().toLowerCase());
            ResultSet rs = checkStmt.executeQuery();

            if (rs.next()) {
                Server.sendResponse(exchange, 409, "{\"error\":\"An account with this email already exists. Please sign in instead.\"}");
                return;
            }

            // Hash the password professionally
            String hashedPassword = PasswordHasher.hashPassword(password);

            // Insert new user with hashed password
            String sql = "INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)";
            PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            stmt.setString(1, name.trim());
            stmt.setString(2, email.trim().toLowerCase());
            stmt.setString(3, phone != null ? phone.trim() : "");
            stmt.setString(4, hashedPassword);
            stmt.executeUpdate();

            ResultSet keys = stmt.getGeneratedKeys();
            int newId = 0;
            if (keys.next()) newId = keys.getInt(1);

            String response = "{\"message\":\"Account created successfully! Please sign in to continue.\",\"userId\":" + newId + "}";
            Server.sendResponse(exchange, 201, response);

        } catch (Exception e) {
            System.out.println("❌ Error registering user: " + e.getMessage());
            Server.sendResponse(exchange, 500, "{\"error\":\"Failed to create account. Please try again later.\"}");
        }
    }

    // ---- LOGIN USER ----
    private void loginUser(HttpExchange exchange) throws IOException {
        Connection conn = DatabaseConnection.getConnection();

        if (conn == null) {
            Server.sendResponse(exchange, 500, "{\"error\":\"Database not connected. Please try again later.\"}");
            return;
        }

        try {
            String body = Server.readRequestBody(exchange);
            String email = extractJsonValue(body, "email");
            String password = extractJsonValue(body, "password");

            // Validate required fields
            if (email == null || email.trim().isEmpty()) {
                Server.sendResponse(exchange, 400, "{\"error\":\"Please enter your email address.\"}");
                return;
            }
            if (password == null || password.isEmpty()) {
                Server.sendResponse(exchange, 400, "{\"error\":\"Please enter your password.\"}");
                return;
            }

            // Find user by email
            String checkSql = "SELECT id, name, email, phone, password FROM users WHERE LOWER(email) = ?";
            PreparedStatement checkStmt = conn.prepareStatement(checkSql);
            checkStmt.setString(1, email.trim().toLowerCase());
            ResultSet checkRs = checkStmt.executeQuery();

            if (!checkRs.next()) {
                // Email not found - provide helpful message
                Server.sendResponse(exchange, 401, "{\"error\":\"No account found with this email. Please create an account to get started.\"}");
                return;
            }

            // Email exists, verify password using the stored secure hash
            String storedPassword = checkRs.getString("password");
            boolean passwordValid = storedPassword != null && PasswordHasher.verifyPassword(password, storedPassword);
            
            if (!passwordValid) {
                Server.sendResponse(exchange, 401, "{\"error\":\"Incorrect password. Please try again or use 'Forgot Password' to reset.\"}");
                return;
            }

            // Login successful
            int userId = checkRs.getInt("id");
            String name = checkRs.getString("name");
            String response = "{"
                + "\"message\":\"Welcome back! Sign in successful.\","
                + "\"userId\":" + userId + ","
                + "\"name\":\"" + escapeJson(name) + "\","
                + "\"email\":\"" + escapeJson(checkRs.getString("email")) + "\","
                + "\"phone\":\"" + escapeJson(checkRs.getString("phone")) + "\""
                + "}";
            Server.sendResponse(exchange, 200, response);

        } catch (Exception e) {
            System.out.println("❌ Error logging in: " + e.getMessage());
            Server.sendResponse(exchange, 500, "{\"error\":\"Unable to sign in right now. Please try again later.\"}");
        }
    }

    // ---- SIMPLE JSON VALUE EXTRACTOR ----
    private String extractJsonValue(String json, String key) {
        if (json == null || json.isEmpty()) return "";
        String searchKey = "\"" + key + "\"";
        int keyIndex = json.indexOf(searchKey);
        if (keyIndex == -1) return "";
        int colonIndex = json.indexOf(":", keyIndex);
        if (colonIndex == -1) return "";
        int start = json.indexOf("\"", colonIndex + 1) + 1;
        int end = json.indexOf("\"", start);
        if (start == 0 || start < colonIndex) {
            String numStr = json.substring(colonIndex + 1).replaceAll("[^0-9.]", "");
            return numStr.split(",")[0].split("}")[0].trim();
        }
        if (end == -1) end = json.length();
        return json.substring(start, end);
    }

    private String escapeJson(String value) {
        if (value == null) return "";
        return value.replace("\\", "\\\\")
                    .replace("\"", "\\\"")
                    .replace("\n", "\\n")
                    .replace("\r", "\\r")
                    .replace("\t", "\\t");
    }
}
