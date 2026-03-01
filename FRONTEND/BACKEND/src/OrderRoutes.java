// =============================================
// QuickBite - Food Ordering System
// OrderRoutes.java
// Handles all /api/orders requests
// =============================================

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.sql.*;

public class OrderRoutes implements HttpHandler {

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

        if (method.equalsIgnoreCase("PUT") && path.matches(".*/api/orders/\\d+/driver.*")) {
            int orderId = extractOrderId(path);
            assignDriver(exchange, orderId);
            return;
        }

        if (method.equalsIgnoreCase("PUT") && path.matches(".*/api/orders/\\d+/status.*")) {
            int orderId = extractOrderId(path);
            updateOrderStatus(exchange, orderId);
            return;
        }

        if (method.equalsIgnoreCase("GET")) {
            getAllOrders(exchange);
        } else if (method.equalsIgnoreCase("POST")) {
            placeOrder(exchange);
        } else {
            Server.sendResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
        }
    }

    private int extractOrderId(String path) {
        try {
            String[] parts = path.split("/");
            for (int i = 0; i < parts.length; i++) {
                if (parts[i].equals("orders") && i + 1 < parts.length) {
                    return Integer.parseInt(parts[i + 1]);
                }
            }
        } catch (Exception e) {
            System.out.println("Error extracting order ID: " + e.getMessage());
        }
        return 0;
    }

    // ---- GET ALL ORDERS ----
    private void getAllOrders(HttpExchange exchange) throws IOException {
        Connection conn = DatabaseConnection.getConnection();

        if (conn == null) {
            Server.sendResponse(exchange, 500, "{\"error\":\"Database not connected\"}");
            return;
        }

        try {
            DatabaseMetaData meta = conn.getMetaData();
            boolean hasDriverColumns = false;
            try (ResultSet columns = meta.getColumns(null, null, "orders", "driver_name")) {
                hasDriverColumns = columns.next();
            } catch (SQLException e) {
                hasDriverColumns = false;
            }
            
            String driverCols = hasDriverColumns ? ", driver_name, driver_phone" : "";
            String sql = "SELECT *" + driverCols + " FROM orders ORDER BY created_at DESC";
            PreparedStatement stmt = conn.prepareStatement(sql);
            ResultSet rs = stmt.executeQuery();

            StringBuilder json = new StringBuilder("[");
            boolean first = true;

            while (rs.next()) {
                if (!first) json.append(",");
                String driverName = "", driverPhone = "";
                if (hasDriverColumns) {
                    try { driverName = rs.getString("driver_name"); } catch (Exception e) { driverName = ""; }
                    try { driverPhone = rs.getString("driver_phone"); } catch (Exception e) { driverPhone = ""; }
                }
                json.append("{")
                    .append("\"id\":").append(rs.getInt("id")).append(",")
                    .append("\"customer_name\":\"").append(escapeJson(rs.getString("customer_name"))).append("\",")
                    .append("\"phone\":\"").append(escapeJson(rs.getString("phone"))).append("\",")
                    .append("\"address\":\"").append(escapeJson(rs.getString("address"))).append("\",")
                    .append("\"total\":").append(rs.getDouble("total")).append(",")
                    .append("\"status\":\"").append(escapeJson(rs.getString("status"))).append("\",")
                    .append("\"driver_name\":\"").append(escapeJson(driverName)).append("\",")
                    .append("\"driver_phone\":\"").append(escapeJson(driverPhone)).append("\",")
                    .append("\"created_at\":\"").append(rs.getString("created_at")).append("\"")
                    .append("}");
                first = false;
            }

            json.append("]");
            Server.sendResponse(exchange, 200, json.toString());

        } catch (SQLException e) {
            System.out.println("❌ Error fetching orders: " + e.getMessage());
            Server.sendResponse(exchange, 500, "{\"error\":\"Failed to fetch orders\"}");
        }
    }

    // ---- PLACE NEW ORDER ----
    private void placeOrder(HttpExchange exchange) throws IOException {
        Connection conn = DatabaseConnection.getConnection();

        if (conn == null) {
            Server.sendResponse(exchange, 500, "{\"error\":\"Database not connected\"}");
            return;
        }

        try {
            String body = Server.readRequestBody(exchange);
            String customerName = extractJsonValue(body, "customer_name");
            double total = Double.parseDouble(extractJsonValue(body, "total"));
            String phone = extractJsonValue(body, "phone");
            String address = extractJsonValue(body, "address");

            String sql = "INSERT INTO orders (customer_name, phone, address, total, status) VALUES (?, ?, ?, ?, 'Confirmed')";
            PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            stmt.setString(1, customerName);
            stmt.setString(2, phone);
            stmt.setString(3, address);
            stmt.setDouble(4, total);
            stmt.executeUpdate();

            ResultSet keys = stmt.getGeneratedKeys();
            int newId = 0;
            if (keys.next()) newId = keys.getInt(1);

            System.out.println("===========================================");
            System.out.println("📦 NEW ORDER RECEIVED!");
            System.out.println("===========================================");
            System.out.println("Order ID: #" + newId);
            System.out.println("Customer: " + customerName);
            System.out.println("Phone: " + phone);
            System.out.println("Address: " + address);
            System.out.println("Total: GH₵" + total);
            System.out.println("Time: " + new java.util.Date());
            System.out.println("===========================================\n");

            String response = "{\"message\":\"Order placed!\",\"orderId\":" + newId + ",\"status\":\"Confirmed\"}";
            Server.sendResponse(exchange, 201, response);

        } catch (Exception e) {
            System.out.println("❌ Error placing order: " + e.getMessage());
            Server.sendResponse(exchange, 500, "{\"error\":\"Failed to place order\"}");
        }
    }

    // ---- ASSIGN DRIVER TO ORDER ----
    private void assignDriver(HttpExchange exchange, int orderId) throws IOException {
        Connection conn = DatabaseConnection.getConnection();

        if (conn == null) {
            Server.sendResponse(exchange, 500, "{\"error\":\"Database not connected\"}");
            return;
        }

        try {
            // Check if columns exist
            DatabaseMetaData meta = conn.getMetaData();
            boolean hasDriverColumns = false;
            try (ResultSet columns = meta.getColumns(null, null, "orders", "driver_name")) {
                hasDriverColumns = columns.next();
            } catch (SQLException e) {
                hasDriverColumns = false;
            }
            
            if (!hasDriverColumns) {
                Server.sendResponse(exchange, 400, "{\"error\":\"Driver columns not found in database. Please run database upgrade.\"}");
                return;
            }

            String body = Server.readRequestBody(exchange);
            String driverName = extractJsonValue(body, "driver_name");
            String driverPhone = extractJsonValue(body, "driver_phone");

            String sql = "UPDATE orders SET driver_name = ?, driver_phone = ? WHERE id = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, driverName);
            stmt.setString(2, driverPhone);
            stmt.setInt(3, orderId);
            int rows = stmt.executeUpdate();

            if (rows > 0) {
                String statusSql = "UPDATE orders SET status = 'On the way' WHERE id = ? AND status != 'Delivered'";
                PreparedStatement statusStmt = conn.prepareStatement(statusSql);
                statusStmt.setInt(1, orderId);
                statusStmt.executeUpdate();

                System.out.println("🚗 Driver assigned to Order #" + orderId + ": " + driverName + " (" + driverPhone + ")");
                Server.sendResponse(exchange, 200, "{\"message\":\"Driver assigned successfully\"}");
            } else {
                Server.sendResponse(exchange, 404, "{\"error\":\"Order not found\"}");
            }

        } catch (Exception e) {
            System.out.println("❌ Error assigning driver: " + e.getMessage());
            Server.sendResponse(exchange, 500, "{\"error\":\"Failed to assign driver\"}");
        }
    }

    // ---- UPDATE ORDER STATUS ----
    private void updateOrderStatus(HttpExchange exchange, int orderId) throws IOException {
        Connection conn = DatabaseConnection.getConnection();

        if (conn == null) {
            Server.sendResponse(exchange, 500, "{\"error\":\"Database not connected\"}");
            return;
        }

        try {
            String body = Server.readRequestBody(exchange);
            String newStatus = extractJsonValue(body, "status");

            String sql = "UPDATE orders SET status = ? WHERE id = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, newStatus);
            stmt.setInt(2, orderId);
            int rows = stmt.executeUpdate();

            if (rows > 0) {
                System.out.println("📋 Order #" + orderId + " status updated to: " + newStatus);
                Server.sendResponse(exchange, 200, "{\"message\":\"Status updated to " + newStatus + "\"}");
            } else {
                Server.sendResponse(exchange, 404, "{\"error\":\"Order not found\"}");
            }

        } catch (Exception e) {
            System.out.println("❌ Error updating status: " + e.getMessage());
            Server.sendResponse(exchange, 500, "{\"error\":\"Failed to update status\"}");
        }
    }

    private String escapeJson(String value) {
        if (value == null) return "";
        return value.replace("\\", "\\\\")
                    .replace("\"", "\\\"")
                    .replace("\n", "\\n")
                    .replace("\r", "\\r")
                    .replace("\t", "\\t");
    }

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
