// =============================================
// QuickBite - Food Ordering System
// TrackingRoutes.java
// Handles all /api/tracking requests
// Drivers POST their GPS location here every few seconds
// Customers GET the latest driver location for their order
// =============================================

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.sql.*;

public class TrackingRoutes implements HttpHandler {

    @Override
    public void handle(HttpExchange exchange) throws IOException {

        if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
            Server.addCorsHeaders(exchange);
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        Server.addCorsHeaders(exchange);
        String method = exchange.getRequestMethod();
        String path   = exchange.getRequestURI().getPath();
        String query  = exchange.getRequestURI().getQuery(); // e.g. order_id=5

        // POST /api/tracking  — driver sends their GPS location
        if (method.equalsIgnoreCase("POST")) {
            updateDriverLocation(exchange);
            return;
        }

        // GET /api/tracking?order_id=5  — customer polls for driver location
        // GET /api/tracking/history?order_id=5  — get all GPS points for an order
        if (method.equalsIgnoreCase("GET")) {
            // Check if this is a history request
            if (query != null && query.contains("order_id") && path.contains("/history")) {
                int orderId = parseQueryParam(query, "order_id");
                if (orderId > 0) {
                    getTrackingHistory(exchange, orderId);
                    return;
                }
            }
            
            int orderId = parseQueryParam(query, "order_id");
            if (orderId > 0) {
                getDriverLocation(exchange, orderId);
            } else {
                Server.sendResponse(exchange, 400, "{\"error\":\"Missing order_id parameter\"}");
            }
            return;
        }

        Server.sendResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
    }

    // ---- DRIVER POSTS LOCATION ----
    // Body: { "order_id": 5, "driver_name": "Kofi", "latitude": 4.9016, "longitude": -1.7571, "speed_kmh": 35.5, "heading": 90 }
    private void updateDriverLocation(HttpExchange exchange) throws IOException {
        Connection conn = DatabaseConnection.getConnection();
        if (conn == null) {
            Server.sendResponse(exchange, 500, "{\"error\":\"Database not connected\"}");
            return;
        }

        try {
            String body = Server.readRequestBody(exchange);

            int    orderId    = (int) parseDouble(body, "order_id");
            String driverName = extractJsonValue(body, "driver_name");
            double latitude   = parseDouble(body, "latitude");
            double longitude  = parseDouble(body, "longitude");
            double speedKmh   = parseDouble(body, "speed_kmh");
            int    heading    = (int) parseDouble(body, "heading");

            if (orderId <= 0 || latitude == 0.0 || longitude == 0.0) {
                Server.sendResponse(exchange, 400, "{\"error\":\"order_id, latitude and longitude are required\"}");
                return;
            }

            // Ensure tracking tables exist (auto-create if missing)
            ensureTrackingTable(conn);
            ensureTrackingHistoryTable(conn);

            // Upsert: update existing row for this order, or insert new one
            String checkSql = "SELECT id FROM delivery_tracking WHERE order_id = ?";
            PreparedStatement checkStmt = conn.prepareStatement(checkSql);
            checkStmt.setInt(1, orderId);
            ResultSet rs = checkStmt.executeQuery();

            if (rs.next()) {
                // Update existing tracking row
                String updateSql = "UPDATE delivery_tracking SET driver_name=?, latitude=?, longitude=?, speed_kmh=?, heading=?, updated_at=NOW() WHERE order_id=?";
                PreparedStatement updateStmt = conn.prepareStatement(updateSql);
                updateStmt.setString(1, driverName);
                updateStmt.setDouble(2, latitude);
                updateStmt.setDouble(3, longitude);
                updateStmt.setDouble(4, speedKmh);
                updateStmt.setInt(5, heading);
                updateStmt.setInt(6, orderId);
                updateStmt.executeUpdate();
            } else {
                // Insert new tracking row
                String insertSql = "INSERT INTO delivery_tracking (order_id, driver_name, latitude, longitude, speed_kmh, heading) VALUES (?,?,?,?,?,?)";
                PreparedStatement insertStmt = conn.prepareStatement(insertSql);
                insertStmt.setInt(1, orderId);
                insertStmt.setString(2, driverName);
                insertStmt.setDouble(3, latitude);
                insertStmt.setDouble(4, longitude);
                insertStmt.setDouble(5, speedKmh);
                insertStmt.setInt(6, heading);
                insertStmt.executeUpdate();
            }

            // Store every GPS update to tracking_history table for historical tracking
            String historySql = "INSERT INTO tracking_history (order_id, driver_name, latitude, longitude, speed_kmh, heading) VALUES (?,?,?,?,?,?)";
            PreparedStatement historyStmt = conn.prepareStatement(historySql);
            historyStmt.setInt(1, orderId);
            historyStmt.setString(2, driverName);
            historyStmt.setDouble(3, latitude);
            historyStmt.setDouble(4, longitude);
            historyStmt.setDouble(5, speedKmh);
            historyStmt.setInt(6, heading);
            historyStmt.executeUpdate();

            System.out.println("📍 Location update — Order #" + orderId + " | Driver: " + driverName
                    + " | Lat: " + latitude + " Lng: " + longitude + " | Speed: " + speedKmh + " km/h");

            Server.sendResponse(exchange, 200, "{\"message\":\"Location updated\",\"order_id\":" + orderId + "}");

        } catch (Exception e) {
            System.out.println("❌ Error updating driver location: " + e.getMessage());
            Server.sendResponse(exchange, 500, "{\"error\":\"Failed to update location\"}");
        }
    }

    // ---- CUSTOMER GETS DRIVER LOCATION ----
    private void getDriverLocation(HttpExchange exchange, int orderId) throws IOException {
        Connection conn = DatabaseConnection.getConnection();
        if (conn == null) {
            Server.sendResponse(exchange, 500, "{\"error\":\"Database not connected\"}");
            return;
        }

        try {
            ensureTrackingTable(conn);

            // Also fetch order status and driver info
            String sql = "SELECT t.*, o.status, o.driver_name AS order_driver_name, o.driver_phone, o.customer_name, o.address, o.created_at " +
                         "FROM delivery_tracking t " +
                         "JOIN orders o ON t.order_id = o.id " +
                         "WHERE t.order_id = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setInt(1, orderId);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                String json = "{"
                    + "\"order_id\":"      + orderId + ","
                    + "\"driver_name\":\""  + escapeJson(rs.getString("order_driver_name")) + "\","
                    + "\"driver_phone\":\"" + escapeJson(rs.getString("driver_phone")) + "\","
                    + "\"customer_name\":\"" + escapeJson(rs.getString("customer_name")) + "\","
                    + "\"address\":\""      + escapeJson(rs.getString("address")) + "\","
                    + "\"ordered_at\":\""   + escapeJson(rs.getString("created_at")) + "\","
                    + "\"items\":"          + getOrderItemsJson(conn, orderId) + ","
                    + "\"latitude\":"       + rs.getDouble("latitude") + ","
                    + "\"longitude\":"      + rs.getDouble("longitude") + ","
                    + "\"speed_kmh\":"      + rs.getDouble("speed_kmh") + ","
                    + "\"heading\":"        + rs.getInt("heading") + ","
                    + "\"status\":\""       + escapeJson(rs.getString("status")) + "\","
                    + "\"updated_at\":\""   + rs.getString("updated_at") + "\""
                    + "}";
                Server.sendResponse(exchange, 200, json);
            } else {
                // No tracking data yet — return order status only
                String orderSql = "SELECT id, status, driver_name, driver_phone, customer_name, address, created_at FROM orders WHERE id = ?";
                PreparedStatement orderStmt = conn.prepareStatement(orderSql);
                orderStmt.setInt(1, orderId);
                ResultSet orderRs = orderStmt.executeQuery();

                if (orderRs.next()) {
                    String json = "{"
                        + "\"order_id\":"      + orderId + ","
                        + "\"driver_name\":\""  + escapeJson(orderRs.getString("driver_name")) + "\","
                        + "\"driver_phone\":\"" + escapeJson(orderRs.getString("driver_phone")) + "\","
                        + "\"customer_name\":\"" + escapeJson(orderRs.getString("customer_name")) + "\","
                        + "\"address\":\""      + escapeJson(orderRs.getString("address")) + "\","
                        + "\"ordered_at\":\""   + escapeJson(orderRs.getString("created_at")) + "\","
                        + "\"items\":"          + getOrderItemsJson(conn, orderId) + ","
                        + "\"latitude\":null,"
                        + "\"longitude\":null,"
                        + "\"speed_kmh\":0,"
                        + "\"heading\":0,"
                        + "\"status\":\""       + escapeJson(orderRs.getString("status")) + "\","
                        + "\"updated_at\":null"
                        + "}";
                    Server.sendResponse(exchange, 200, json);
                } else {
                    Server.sendResponse(exchange, 404, "{\"error\":\"Order not found\"}");
                }
            }

        } catch (Exception e) {
            System.out.println("❌ Error fetching driver location: " + e.getMessage());
            Server.sendResponse(exchange, 500, "{\"error\":\"Failed to fetch location\"}");
        }
    }

    // ---- AUTO-CREATE TRACKING TABLE IF MISSING ----
    private void ensureTrackingTable(Connection conn) {
        try {
            String createSql = "CREATE TABLE IF NOT EXISTS delivery_tracking (" +
                "id INT AUTO_INCREMENT PRIMARY KEY," +
                "order_id INT NOT NULL," +
                "driver_name VARCHAR(100)," +
                "latitude DECIMAL(10,7) NOT NULL," +
                "longitude DECIMAL(10,7) NOT NULL," +
                "speed_kmh DECIMAL(5,1) DEFAULT 0," +
                "heading INT DEFAULT 0," +
                "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP," +
                "FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE" +
                ")";
            conn.prepareStatement(createSql).execute();
        } catch (SQLException e) {
            System.out.println("⚠️ Could not ensure tracking table: " + e.getMessage());
        }
    }

    // ---- AUTO-CREATE TRACKING HISTORY TABLE IF MISSING ----
    private void ensureTrackingHistoryTable(Connection conn) {
        try {
            String createSql = "CREATE TABLE IF NOT EXISTS tracking_history (" +
                "id INT AUTO_INCREMENT PRIMARY KEY," +
                "order_id INT NOT NULL," +
                "driver_name VARCHAR(100)," +
                "latitude DECIMAL(10,7) NOT NULL," +
                "longitude DECIMAL(10,7) NOT NULL," +
                "speed_kmh DECIMAL(5,1) DEFAULT 0," +
                "heading INT DEFAULT 0," +
                "recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
                "FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE" +
                ")";
            conn.prepareStatement(createSql).execute();
        } catch (SQLException e) {
            System.out.println("⚠️ Could not ensure tracking_history table: " + e.getMessage());
        }
    }

    // ---- GET TRACKING HISTORY FOR AN ORDER ----
    // GET /api/tracking/history?order_id=X - Returns all GPS points for an order
    private void getTrackingHistory(HttpExchange exchange, int orderId) throws IOException {
        Connection conn = DatabaseConnection.getConnection();
        if (conn == null) {
            Server.sendResponse(exchange, 500, "{\"error\":\"Database not connected\"}");
            return;
        }

        try {
            ensureTrackingHistoryTable(conn);

            // First check if order exists
            String orderSql = "SELECT id FROM orders WHERE id = ?";
            PreparedStatement orderStmt = conn.prepareStatement(orderSql);
            orderStmt.setInt(1, orderId);
            ResultSet orderRs = orderStmt.executeQuery();
            if (!orderRs.next()) {
                Server.sendResponse(exchange, 404, "{\"error\":\"Order not found\"}");
                return;
            }

            // Get all tracking history points for this order
            String sql = "SELECT * FROM tracking_history WHERE order_id = ? ORDER BY recorded_at ASC";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setInt(1, orderId);
            ResultSet rs = stmt.executeQuery();

            StringBuilder json = new StringBuilder("{\"order_id\":" + orderId + ",\"tracking_points\":[");
            boolean first = true;
            while (rs.next()) {
                if (!first) json.append(",");
                json.append("{")
                    .append("\"id\":").append(rs.getInt("id")).append(",")
                    .append("\"driver_name\":\"").append(escapeJson(rs.getString("driver_name"))).append("\",")
                    .append("\"latitude\":").append(rs.getDouble("latitude")).append(",")
                    .append("\"longitude\":").append(rs.getDouble("longitude")).append(",")
                    .append("\"speed_kmh\":").append(rs.getDouble("speed_kmh")).append(",")
                    .append("\"heading\":").append(rs.getInt("heading")).append(",")
                    .append("\"recorded_at\":\"").append(rs.getString("recorded_at")).append("\"")
                    .append("}");
                first = false;
            }
            json.append("]}");
            Server.sendResponse(exchange, 200, json.toString());

        } catch (Exception e) {
            System.out.println("❌ Error fetching tracking history: " + e.getMessage());
            Server.sendResponse(exchange, 500, "{\"error\":\"Failed to fetch tracking history\"}");
        }
    }

    // ---- HELPERS ----
    private int parseQueryParam(String query, String key) {
        if (query == null) return 0;
        for (String part : query.split("&")) {
            String[] kv = part.split("=");
            if (kv.length == 2 && kv[0].equals(key)) {
                try { return Integer.parseInt(kv[1]); } catch (Exception e) { return 0; }
            }
        }
        return 0;
    }

    private double parseDouble(String json, String key) {
        String searchKey = "\"" + key + "\"";
        int keyIndex = json.indexOf(searchKey);
        if (keyIndex == -1) return 0.0;
        int colonIndex = json.indexOf(":", keyIndex);
        String rest = json.substring(colonIndex + 1).trim();
        // Handle null
        if (rest.startsWith("null")) return 0.0;
        // Extract number
        StringBuilder num = new StringBuilder();
        for (char c : rest.toCharArray()) {
            if (Character.isDigit(c) || c == '.' || c == '-') num.append(c);
            else if (num.length() > 0) break;
        }
        try { return Double.parseDouble(num.toString()); } catch (Exception e) { return 0.0; }
    }

    private String extractJsonValue(String json, String key) {
        String searchKey = "\"" + key + "\"";
        int keyIndex = json.indexOf(searchKey);
        if (keyIndex == -1) return "";
        int colonIndex = json.indexOf(":", keyIndex);
        int start = json.indexOf("\"", colonIndex + 1) + 1;
        int end   = json.indexOf("\"", start);
        if (start <= colonIndex) return "";
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

    private String getOrderItemsJson(Connection conn, int orderId) {
        String sql = "SELECT oi.food_id, oi.quantity, oi.price, f.name, f.emoji " +
                     "FROM order_items oi LEFT JOIN foods f ON oi.food_id = f.id " +
                     "WHERE oi.order_id = ? ORDER BY oi.id ASC";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, orderId);
            ResultSet rs = stmt.executeQuery();
            StringBuilder json = new StringBuilder("[");
            boolean first = true;
            while (rs.next()) {
                if (!first) json.append(",");
                json.append("{")
                    .append("\"id\":").append(rs.getInt("food_id")).append(",")
                    .append("\"name\":\"").append(escapeJson(rs.getString("name"))).append("\",")
                    .append("\"emoji\":\"").append(escapeJson(rs.getString("emoji"))).append("\",")
                    .append("\"qty\":").append(rs.getInt("quantity")).append(",")
                    .append("\"price\":").append(rs.getDouble("price"))
                    .append("}");
                first = false;
            }
            json.append("]");
            return json.toString();
        } catch (SQLException e) {
            return "[]";
        }
    }
}
