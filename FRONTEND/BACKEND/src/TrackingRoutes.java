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
        String path = exchange.getRequestURI().getPath();
        String query = exchange.getRequestURI().getQuery();

        if (method.equalsIgnoreCase("POST")) {
            updateLiveLocation(exchange);
            return;
        }

        if (method.equalsIgnoreCase("GET")) {
            if (query != null && query.contains("order_id") && path.contains("/history")) {
                int orderId = parseQueryParam(query, "order_id");
                if (orderId > 0) {
                    getTrackingHistory(exchange, orderId);
                    return;
                }
            }

            int orderId = parseQueryParam(query, "order_id");
            if (orderId > 0) {
                getLiveTracking(exchange, orderId);
            } else {
                Server.sendResponse(exchange, 400, "{\"error\":\"Missing order_id parameter\"}");
            }
            return;
        }

        Server.sendResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
    }

    private void updateLiveLocation(HttpExchange exchange) throws IOException {
        Connection conn = DatabaseConnection.getConnection();
        if (conn == null) {
            Server.sendResponse(exchange, 500, "{\"error\":\"Database not connected\"}");
            return;
        }

        try {
            String body = Server.readRequestBody(exchange);

            int orderId = (int) parseDouble(body, "order_id");
            String actorType = extractJsonValue(body, "actor_type");
            if (actorType == null || actorType.trim().isEmpty()) actorType = "driver";
            actorType = actorType.trim().toLowerCase();

            if (!"driver".equals(actorType) && !"customer".equals(actorType)) {
                Server.sendResponse(exchange, 400, "{\"error\":\"actor_type must be driver or customer\"}");
                return;
            }

            String actorName = extractJsonValue(body, "actor_name");
            if (actorName.isEmpty()) {
                actorName = "customer".equals(actorType)
                    ? extractJsonValue(body, "customer_name")
                    : extractJsonValue(body, "driver_name");
            }

            double latitude = parseDouble(body, "latitude");
            double longitude = parseDouble(body, "longitude");
            double speedKmh = parseDouble(body, "speed_kmh");
            int heading = (int) parseDouble(body, "heading");

            if (orderId <= 0 || !hasJsonKey(body, "latitude") || !hasJsonKey(body, "longitude")) {
                Server.sendResponse(exchange, 400, "{\"error\":\"order_id, latitude and longitude are required\"}");
                return;
            }

            ensureTrackingTable(conn);
            ensureTrackingHistoryTable(conn);

            String checkSql = "SELECT id FROM delivery_tracking WHERE order_id = ?";
            PreparedStatement checkStmt = conn.prepareStatement(checkSql);
            checkStmt.setInt(1, orderId);
            ResultSet rs = checkStmt.executeQuery();

            if (rs.next()) {
                String updateSql = "driver".equals(actorType)
                    ? "UPDATE delivery_tracking SET driver_name=?, latitude=?, longitude=?, speed_kmh=?, heading=?, updated_at=NOW() WHERE order_id=?"
                    : "UPDATE delivery_tracking SET customer_name=?, customer_latitude=?, customer_longitude=?, customer_speed_kmh=?, customer_heading=?, customer_updated_at=NOW() WHERE order_id=?";
                PreparedStatement updateStmt = conn.prepareStatement(updateSql);
                updateStmt.setString(1, actorName);
                updateStmt.setDouble(2, latitude);
                updateStmt.setDouble(3, longitude);
                updateStmt.setDouble(4, speedKmh);
                updateStmt.setInt(5, heading);
                updateStmt.setInt(6, orderId);
                updateStmt.executeUpdate();
            } else {
                String insertSql = "driver".equals(actorType)
                    ? "INSERT INTO delivery_tracking (order_id, driver_name, latitude, longitude, speed_kmh, heading) VALUES (?,?,?,?,?,?)"
                    : "INSERT INTO delivery_tracking (order_id, customer_name, customer_latitude, customer_longitude, customer_speed_kmh, customer_heading) VALUES (?,?,?,?,?,?)";
                PreparedStatement insertStmt = conn.prepareStatement(insertSql);
                insertStmt.setInt(1, orderId);
                insertStmt.setString(2, actorName);
                insertStmt.setDouble(3, latitude);
                insertStmt.setDouble(4, longitude);
                insertStmt.setDouble(5, speedKmh);
                insertStmt.setInt(6, heading);
                insertStmt.executeUpdate();
            }

            String historySql = "INSERT INTO tracking_history (order_id, actor_type, actor_name, latitude, longitude, speed_kmh, heading) VALUES (?,?,?,?,?,?,?)";
            PreparedStatement historyStmt = conn.prepareStatement(historySql);
            historyStmt.setInt(1, orderId);
            historyStmt.setString(2, actorType);
            historyStmt.setString(3, actorName);
            historyStmt.setDouble(4, latitude);
            historyStmt.setDouble(5, longitude);
            historyStmt.setDouble(6, speedKmh);
            historyStmt.setInt(7, heading);
            historyStmt.executeUpdate();

            System.out.println("Tracking update | order #" + orderId + " | " + actorType + ": " + actorName
                + " | lat " + latitude + " | lng " + longitude + " | speed " + speedKmh + " km/h");

            Server.sendResponse(exchange, 200, "{\"message\":\"Location updated\",\"order_id\":" + orderId + ",\"actor_type\":\"" + escapeJson(actorType) + "\"}");
        } catch (Exception e) {
            System.out.println("Error updating live location: " + e.getMessage());
            Server.sendResponse(exchange, 500, "{\"error\":\"Failed to update location\"}");
        }
    }

    private void getLiveTracking(HttpExchange exchange, int orderId) throws IOException {
        Connection conn = DatabaseConnection.getConnection();
        if (conn == null) {
            Server.sendResponse(exchange, 500, "{\"error\":\"Database not connected\"}");
            return;
        }

        try {
            ensureTrackingTable(conn);

            String sql = "SELECT t.driver_name AS live_driver_name, t.latitude, t.longitude, t.speed_kmh, t.heading, t.updated_at, " +
                         "t.customer_name AS live_customer_name, t.customer_latitude, t.customer_longitude, " +
                         "t.customer_speed_kmh, t.customer_heading, t.customer_updated_at, " +
                         "o.status, o.driver_name AS order_driver_name, o.driver_phone, " +
                         "o.customer_name AS order_customer_name, o.address, o.created_at " +
                         "FROM orders o LEFT JOIN delivery_tracking t ON t.order_id = o.id WHERE o.id = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setInt(1, orderId);
            ResultSet rs = stmt.executeQuery();

            if (!rs.next()) {
                Server.sendResponse(exchange, 404, "{\"error\":\"Order not found\"}");
                return;
            }

            String json = "{"
                + "\"order_id\":" + orderId + ","
                + "\"driver_name\":\"" + escapeJson(valueOrFallback(rs.getString("order_driver_name"), rs.getString("live_driver_name"))) + "\","
                + "\"driver_phone\":\"" + escapeJson(rs.getString("driver_phone")) + "\","
                + "\"customer_name\":\"" + escapeJson(rs.getString("order_customer_name")) + "\","
                + "\"customer_live_name\":\"" + escapeJson(valueOrFallback(rs.getString("live_customer_name"), rs.getString("order_customer_name"))) + "\","
                + "\"address\":\"" + escapeJson(rs.getString("address")) + "\","
                + "\"ordered_at\":\"" + escapeJson(rs.getString("created_at")) + "\","
                + "\"items\":" + getOrderItemsJson(conn, orderId) + ","
                + "\"latitude\":" + nullableDouble(rs, "latitude") + ","
                + "\"longitude\":" + nullableDouble(rs, "longitude") + ","
                + "\"speed_kmh\":" + nullableDouble(rs, "speed_kmh") + ","
                + "\"heading\":" + nullableInt(rs, "heading") + ","
                + "\"customer_latitude\":" + nullableDouble(rs, "customer_latitude") + ","
                + "\"customer_longitude\":" + nullableDouble(rs, "customer_longitude") + ","
                + "\"customer_speed_kmh\":" + nullableDouble(rs, "customer_speed_kmh") + ","
                + "\"customer_heading\":" + nullableInt(rs, "customer_heading") + ","
                + "\"customer_updated_at\":" + quoteOrNull(rs.getString("customer_updated_at")) + ","
                + "\"status\":\"" + escapeJson(rs.getString("status")) + "\","
                + "\"updated_at\":" + quoteOrNull(rs.getString("updated_at"))
                + "}";

            Server.sendResponse(exchange, 200, json);
        } catch (Exception e) {
            System.out.println("Error fetching live tracking: " + e.getMessage());
            Server.sendResponse(exchange, 500, "{\"error\":\"Failed to fetch location\"}");
        }
    }

    private void ensureTrackingTable(Connection conn) {
        try {
            String createSql = "CREATE TABLE IF NOT EXISTS delivery_tracking (" +
                "id INT AUTO_INCREMENT PRIMARY KEY," +
                "order_id INT NOT NULL," +
                "driver_name VARCHAR(100)," +
                "latitude DECIMAL(10,7) NULL," +
                "longitude DECIMAL(10,7) NULL," +
                "speed_kmh DECIMAL(5,1) DEFAULT 0," +
                "heading INT DEFAULT 0," +
                "customer_name VARCHAR(100)," +
                "customer_latitude DECIMAL(10,7) NULL," +
                "customer_longitude DECIMAL(10,7) NULL," +
                "customer_speed_kmh DECIMAL(5,1) DEFAULT 0," +
                "customer_heading INT DEFAULT 0," +
                "customer_updated_at TIMESTAMP NULL DEFAULT NULL," +
                "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP," +
                "FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE" +
                ")";
            conn.prepareStatement(createSql).execute();
            ensureTrackingColumns(conn);
        } catch (SQLException e) {
            System.out.println("Could not ensure tracking table: " + e.getMessage());
        }
    }

    private void ensureTrackingColumns(Connection conn) {
        try {
            DatabaseMetaData meta = conn.getMetaData();
            ensureColumn(conn, meta, "delivery_tracking", "driver_name", "ALTER TABLE delivery_tracking ADD COLUMN driver_name VARCHAR(100)");
            ensureColumn(conn, meta, "delivery_tracking", "latitude", "ALTER TABLE delivery_tracking ADD COLUMN latitude DECIMAL(10,7) NULL");
            ensureColumn(conn, meta, "delivery_tracking", "longitude", "ALTER TABLE delivery_tracking ADD COLUMN longitude DECIMAL(10,7) NULL");
            ensureColumn(conn, meta, "delivery_tracking", "speed_kmh", "ALTER TABLE delivery_tracking ADD COLUMN speed_kmh DECIMAL(5,1) DEFAULT 0");
            ensureColumn(conn, meta, "delivery_tracking", "heading", "ALTER TABLE delivery_tracking ADD COLUMN heading INT DEFAULT 0");
            ensureColumn(conn, meta, "delivery_tracking", "customer_name", "ALTER TABLE delivery_tracking ADD COLUMN customer_name VARCHAR(100)");
            ensureColumn(conn, meta, "delivery_tracking", "customer_latitude", "ALTER TABLE delivery_tracking ADD COLUMN customer_latitude DECIMAL(10,7) NULL");
            ensureColumn(conn, meta, "delivery_tracking", "customer_longitude", "ALTER TABLE delivery_tracking ADD COLUMN customer_longitude DECIMAL(10,7) NULL");
            ensureColumn(conn, meta, "delivery_tracking", "customer_speed_kmh", "ALTER TABLE delivery_tracking ADD COLUMN customer_speed_kmh DECIMAL(5,1) DEFAULT 0");
            ensureColumn(conn, meta, "delivery_tracking", "customer_heading", "ALTER TABLE delivery_tracking ADD COLUMN customer_heading INT DEFAULT 0");
            ensureColumn(conn, meta, "delivery_tracking", "customer_updated_at", "ALTER TABLE delivery_tracking ADD COLUMN customer_updated_at TIMESTAMP NULL DEFAULT NULL");
        } catch (SQLException e) {
            System.out.println("Could not ensure tracking columns: " + e.getMessage());
        }
    }

    private void ensureTrackingHistoryTable(Connection conn) {
        try {
            String createSql = "CREATE TABLE IF NOT EXISTS tracking_history (" +
                "id INT AUTO_INCREMENT PRIMARY KEY," +
                "order_id INT NOT NULL," +
                "actor_type VARCHAR(20) DEFAULT 'driver'," +
                "actor_name VARCHAR(100)," +
                "latitude DECIMAL(10,7) NOT NULL," +
                "longitude DECIMAL(10,7) NOT NULL," +
                "speed_kmh DECIMAL(5,1) DEFAULT 0," +
                "heading INT DEFAULT 0," +
                "recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
                "FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE" +
                ")";
            conn.prepareStatement(createSql).execute();
            ensureTrackingHistoryColumns(conn);
        } catch (SQLException e) {
            System.out.println("Could not ensure tracking_history table: " + e.getMessage());
        }
    }

    private void ensureTrackingHistoryColumns(Connection conn) {
        try {
            DatabaseMetaData meta = conn.getMetaData();
            ensureColumn(conn, meta, "tracking_history", "actor_type", "ALTER TABLE tracking_history ADD COLUMN actor_type VARCHAR(20) DEFAULT 'driver'");
            ensureColumn(conn, meta, "tracking_history", "actor_name", "ALTER TABLE tracking_history ADD COLUMN actor_name VARCHAR(100)");
        } catch (SQLException e) {
            System.out.println("Could not ensure tracking_history columns: " + e.getMessage());
        }
    }

    private void getTrackingHistory(HttpExchange exchange, int orderId) throws IOException {
        Connection conn = DatabaseConnection.getConnection();
        if (conn == null) {
            Server.sendResponse(exchange, 500, "{\"error\":\"Database not connected\"}");
            return;
        }

        try {
            ensureTrackingHistoryTable(conn);

            String orderSql = "SELECT id FROM orders WHERE id = ?";
            PreparedStatement orderStmt = conn.prepareStatement(orderSql);
            orderStmt.setInt(1, orderId);
            ResultSet orderRs = orderStmt.executeQuery();
            if (!orderRs.next()) {
                Server.sendResponse(exchange, 404, "{\"error\":\"Order not found\"}");
                return;
            }

            String sql = "SELECT * FROM tracking_history WHERE order_id = ? ORDER BY recorded_at ASC";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setInt(1, orderId);
            ResultSet rs = stmt.executeQuery();

            StringBuilder json = new StringBuilder("{\"order_id\":").append(orderId).append(",\"tracking_points\":[");
            boolean first = true;
            while (rs.next()) {
                if (!first) json.append(",");
                json.append("{")
                    .append("\"id\":").append(rs.getInt("id")).append(",")
                    .append("\"actor_type\":\"").append(escapeJson(rs.getString("actor_type"))).append("\",")
                    .append("\"actor_name\":\"").append(escapeJson(rs.getString("actor_name"))).append("\",")
                    .append("\"latitude\":").append(rs.getDouble("latitude")).append(",")
                    .append("\"longitude\":").append(rs.getDouble("longitude")).append(",")
                    .append("\"speed_kmh\":").append(rs.getDouble("speed_kmh")).append(",")
                    .append("\"heading\":").append(rs.getInt("heading")).append(",")
                    .append("\"recorded_at\":\"").append(escapeJson(rs.getString("recorded_at"))).append("\"")
                    .append("}");
                first = false;
            }
            json.append("]}");
            Server.sendResponse(exchange, 200, json.toString());
        } catch (Exception e) {
            System.out.println("Error fetching tracking history: " + e.getMessage());
            Server.sendResponse(exchange, 500, "{\"error\":\"Failed to fetch tracking history\"}");
        }
    }

    private void ensureColumn(Connection conn, DatabaseMetaData meta, String tableName, String columnName, String alterSql) {
        try (ResultSet columns = meta.getColumns(null, null, tableName, columnName)) {
            if (!columns.next()) {
                conn.prepareStatement(alterSql).execute();
            }
        } catch (SQLException e) {
            System.out.println("Could not ensure column " + columnName + " on " + tableName + ": " + e.getMessage());
        }
    }

    private int parseQueryParam(String query, String key) {
        if (query == null) return 0;
        for (String part : query.split("&")) {
            String[] kv = part.split("=");
            if (kv.length == 2 && kv[0].equals(key)) {
                try {
                    return Integer.parseInt(kv[1]);
                } catch (Exception e) {
                    return 0;
                }
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
        if (rest.startsWith("null")) return 0.0;
        StringBuilder num = new StringBuilder();
        for (char c : rest.toCharArray()) {
            if (Character.isDigit(c) || c == '.' || c == '-') num.append(c);
            else if (num.length() > 0) break;
        }
        try {
            return Double.parseDouble(num.toString());
        } catch (Exception e) {
            return 0.0;
        }
    }

    private boolean hasJsonKey(String json, String key) {
        return json != null && json.indexOf("\"" + key + "\"") >= 0;
    }

    private String extractJsonValue(String json, String key) {
        String searchKey = "\"" + key + "\"";
        int keyIndex = json.indexOf(searchKey);
        if (keyIndex == -1) return "";
        int colonIndex = json.indexOf(":", keyIndex);
        int start = json.indexOf("\"", colonIndex + 1) + 1;
        int end = json.indexOf("\"", start);
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

    private String quoteOrNull(String value) {
        return value == null ? "null" : "\"" + escapeJson(value) + "\"";
    }

    private String nullableDouble(ResultSet rs, String column) throws SQLException {
        double value = rs.getDouble(column);
        return rs.wasNull() ? "null" : String.valueOf(value);
    }

    private String nullableInt(ResultSet rs, String column) throws SQLException {
        int value = rs.getInt(column);
        return rs.wasNull() ? "null" : String.valueOf(value);
    }

    private String valueOrFallback(String preferred, String fallback) {
        return preferred != null && !preferred.isEmpty() ? preferred : (fallback == null ? "" : fallback);
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
