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
            Server.sendResponse(exchange, 500, "{\"error\":\"Database not connected\"}");
            return;
        }

        try {
            String body = Server.readRequestBody(exchange);
            String name = extractJsonValue(body, "name");
            String email = extractJsonValue(body, "email");
            String phone = extractJsonValue(body, "phone");
            String password = extractJsonValue(body, "password");

            // Check if user already exists (by email)
            String checkSql = "SELECT id FROM users WHERE email = ?";
            PreparedStatement checkStmt = conn.prepareStatement(checkSql);
            checkStmt.setString(1, email);
            ResultSet rs = checkStmt.executeQuery();

            if (rs.next()) {
                Server.sendResponse(exchange, 400, "{\"error\":\"Email already exists\"}");
                return;
            }

            // Insert new user
            String sql = "INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)";
            PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            stmt.setString(1, name);
            stmt.setString(2, email);
            stmt.setString(3, phone);
            stmt.setString(4, password);
            stmt.executeUpdate();

            ResultSet keys = stmt.getGeneratedKeys();
            int newId = 0;
            if (keys.next()) newId = keys.getInt(1);

            String response = "{\"message\":\"Registration successful!\",\"userId\":" + newId + "}";
            Server.sendResponse(exchange, 201, response);

        } catch (Exception e) {
            System.out.println("❌ Error registering user: " + e.getMessage());
            Server.sendResponse(exchange, 500, "{\"error\":\"Failed to register user\"}");
        }
    }

    // ---- LOGIN USER ----
    private void loginUser(HttpExchange exchange) throws IOException {
        Connection conn = DatabaseConnection.getConnection();

        if (conn == null) {
            Server.sendResponse(exchange, 500, "{\"error\":\"Database not connected\"}");
            return;
        }

        try {
            String body = Server.readRequestBody(exchange);
            String email = extractJsonValue(body, "email");
            String password = extractJsonValue(body, "password");

            String sql = "SELECT id, name FROM users WHERE email = ? AND password = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, email);
            stmt.setString(2, password);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                int userId = rs.getInt("id");
                String name = rs.getString("name");
                String response = "{\"message\":\"Login successful!\",\"userId\":" + userId + ",\"name\":\"" + name + "\"}";
                Server.sendResponse(exchange, 200, response);
            } else {
                Server.sendResponse(exchange, 401, "{\"error\":\"Invalid credentials\"}");
            }

        } catch (Exception e) {
            System.out.println("❌ Error logging in: " + e.getMessage());
            Server.sendResponse(exchange, 500, "{\"error\":\"Failed to login\"}");
        }
    }

    // ---- SIMPLE JSON VALUE EXTRACTOR ----
    private String extractJsonValue(String json, String key) {
        String searchKey = "\"" + key + "\"";
        int keyIndex = json.indexOf(searchKey);
        if (keyIndex == -1) return "";
        int colonIndex = json.indexOf(":", keyIndex);
        int start = json.indexOf("\"", colonIndex + 1) + 1;
        int end = json.indexOf("\"", start);
        if (start == 0 || start < colonIndex) {
            String numStr = json.substring(colonIndex + 1).replaceAll("[^0-9.]", "");
            return numStr.split(",")[0].split("}")[0].trim();
        }
        return json.substring(start, end);
    }
}
