// =============================================
// QuickBite - Food Ordering System
// ComplaintRoutes.java
// Handles all /api/complaints requests
// =============================================

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.sql.*;

public class ComplaintRoutes implements HttpHandler {

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

        // POST /api/complaints - Submit a new complaint
        if (method.equalsIgnoreCase("POST") && path.endsWith("/complaints")) {
            submitComplaint(exchange);
            return;
        }

        // GET /api/complaints - Admin only, get all complaints
        if (method.equalsIgnoreCase("GET") && path.endsWith("/complaints")) {
            getAllComplaints(exchange);
            return;
        }

        // PUT /api/complaints/{id}/status - Admin only, update complaint status
        if (method.equalsIgnoreCase("PUT") && path.matches(".*/api/complaints/\\d+/status.*")) {
            int complaintId = extractComplaintId(path);
            updateComplaintStatus(exchange, complaintId);
            return;
        }

        Server.sendResponse(exchange, 404, "{\"error\":\"Not found\"}");
    }

    private int extractComplaintId(String path) {
        try {
            String[] parts = path.split("/");
            for (int i = 0; i < parts.length; i++) {
                if (parts[i].equals("complaints") && i + 1 < parts.length) {
                    return Integer.parseInt(parts[i + 1]);
                }
            }
        } catch (Exception e) {
            System.out.println("Error extracting complaint ID: " + e.getMessage());
        }
        return 0;
    }

    // ---- SUBMIT COMPLAINT ----
    private void submitComplaint(HttpExchange exchange) throws IOException {
        Connection conn = DatabaseConnection.getConnection();

        if (conn == null) {
            Server.sendResponse(exchange, 500, "{\"error\":\"Database not connected. Please try again later.\"}");
            return;
        }

        try {
            // Ensure complaints table exists
            ensureComplaintsTable(conn);

            String body = Server.readRequestBody(exchange);
            String orderId = extractJsonValue(body, "order_id");
            String customerName = extractJsonValue(body, "name");
            String customerEmail = extractJsonValue(body, "email");
            String message = extractJsonValue(body, "message");

            // Validate required fields
            if (message == null || message.trim().isEmpty()) {
                Server.sendResponse(exchange, 400, "{\"error\":\"Please describe your concern.\"}");
                return;
            }
            if (customerEmail == null || customerEmail.trim().isEmpty()) {
                Server.sendResponse(exchange, 400, "{\"error\":\"Please provide your email address.\"}");
                return;
            }

            // If order ID provided, validate it exists
            int orderIdInt = 0;
            if (orderId != null && !orderId.isEmpty()) {
                try {
                    orderIdInt = Integer.parseInt(orderId);
                    // Verify order exists and belongs to this email
                    String checkSql = "SELECT id FROM orders WHERE id = ? AND (customer_email = ? OR customer_email IS NULL)";
                    PreparedStatement checkStmt = conn.prepareStatement(checkSql);
                    checkStmt.setInt(1, orderIdInt);
                    checkStmt.setString(2, customerEmail.trim().toLowerCase());
                    ResultSet checkRs = checkStmt.executeQuery();
                    if (!checkRs.next()) {
                        orderIdInt = 0; // Reset if order not found or doesn't match
                    }
                } catch (Exception e) {
                    orderIdInt = 0;
                }
            }

            // Insert complaint
            String sql = "INSERT INTO complaints (order_id, customer_name, customer_email, message, status) VALUES (?, ?, ?, ?, 'pending')";
            PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            stmt.setInt(1, orderIdInt);
            stmt.setString(2, customerName != null ? customerName.trim() : "");
            stmt.setString(3, customerEmail.trim().toLowerCase());
            stmt.setString(4, message.trim());
            stmt.executeUpdate();

            ResultSet keys = stmt.getGeneratedKeys();
            int newId = 0;
            if (keys.next()) newId = keys.getInt(1);

            System.out.println("📝 New complaint submitted! ID: " + newId + " from: " + customerEmail);

            String response = "{\"message\":\"Your concern has been submitted. We will review it shortly.\",\"complaintId\":" + newId + "}";
            Server.sendResponse(exchange, 201, response);

        } catch (Exception e) {
            System.out.println("❌ Error submitting complaint: " + e.getMessage());
            Server.sendResponse(exchange, 500, "{\"error\":\"Failed to submit concern. Please try again later.\"}");
        }
    }

    // ---- GET ALL COMPLAINTS (Admin) ----
    private void getAllComplaints(HttpExchange exchange) throws IOException {
        Connection conn = DatabaseConnection.getConnection();

        if (conn == null) {
            Server.sendResponse(exchange, 500, "{\"error\":\"Database not connected.\"}");
            return;
        }

        try {
            String sql = "SELECT * FROM complaints ORDER BY created_at DESC";
            PreparedStatement stmt = conn.prepareStatement(sql);
            ResultSet rs = stmt.executeQuery();

            StringBuilder json = new StringBuilder("[");
            boolean first = true;

            while (rs.next()) {
                if (!first) json.append(",");
                json.append("{")
                    .append("\"id\":").append(rs.getInt("id")).append(",")
                    .append("\"order_id\":").append(rs.getInt("order_id")).append(",")
                    .append("\"customer_name\":\"").append(escapeJson(rs.getString("customer_name"))).append("\",")
                    .append("\"customer_email\":\"").append(escapeJson(rs.getString("customer_email"))).append("\",")
                    .append("\"message\":\"").append(escapeJson(rs.getString("message"))).append("\",")
                    .append("\"status\":\"").append(escapeJson(rs.getString("status"))).append("\",")
                    .append("\"created_at\":\"").append(rs.getString("created_at")).append("\"")
                    .append("}");
                first = false;
            }

            json.append("]");
            Server.sendResponse(exchange, 200, json.toString());

        } catch (Exception e) {
            System.out.println("❌ Error fetching complaints: " + e.getMessage());
            Server.sendResponse(exchange, 500, "{\"error\":\"Failed to fetch complaints\"}");
        }
    }

    // ---- UPDATE COMPLAINT STATUS (Admin) ----
    private void updateComplaintStatus(HttpExchange exchange, int complaintId) throws IOException {
        Connection conn = DatabaseConnection.getConnection();

        if (conn == null) {
            Server.sendResponse(exchange, 500, "{\"error\":\"Database not connected.\"}");
            return;
        }

        try {
            String body = Server.readRequestBody(exchange);
            String newStatus = extractJsonValue(body, "status");

            if (newStatus == null || newStatus.isEmpty()) {
                Server.sendResponse(exchange, 400, "{\"error\":\"Status is required.\"}");
                return;
            }

            String sql = "UPDATE complaints SET status = ? WHERE id = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, newStatus);
            stmt.setInt(2, complaintId);
            int rows = stmt.executeUpdate();

            if (rows > 0) {
                System.out.println("📝 Complaint #" + complaintId + " status updated to: " + newStatus);
                Server.sendResponse(exchange, 200, "{\"message\":\"Complaint status updated to " + newStatus + "\"}");
            } else {
                Server.sendResponse(exchange, 404, "{\"error\":\"Complaint not found\"}");
            }

        } catch (Exception e) {
            System.out.println("❌ Error updating complaint: " + e.getMessage());
            Server.sendResponse(exchange, 500, "{\"error\":\"Failed to update complaint\"}");
        }
    }

    private void ensureComplaintsTable(Connection conn) {
        try {
            String createSql = "CREATE TABLE IF NOT EXISTS complaints (" +
                "id INT AUTO_INCREMENT PRIMARY KEY, " +
                "order_id INT, " +
                "customer_name VARCHAR(100), " +
                "customer_email VARCHAR(150), " +
                "message TEXT NOT NULL, " +
                "status VARCHAR(20) DEFAULT 'pending', " +
                "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                ")";
            conn.prepareStatement(createSql).execute();
        } catch (SQLException e) {
            System.out.println("⚠️ Could not create complaints table: " + e.getMessage());
        }
    }

    private String escapeJson(String value) {
        if (value == null) return "";
        return value.replace("\\", "\\\\")
                    .replace("\"", "\\\"")
                    .replace("\n", "\\n")
                    .replace("\r", "\\r");
    }

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
}