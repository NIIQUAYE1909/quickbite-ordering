// =============================================
// QuickBite - Food Ordering System
// ReviewRoutes.java
// Handles review submissions and admin review management
// =============================================

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.sql.*;

public class ReviewRoutes implements HttpHandler {

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

        // POST /api/reviews - Submit a new review
        if (method.equalsIgnoreCase("POST") && path.equals("/api/reviews")) {
            submitReview(exchange);
            return;
        }

        // GET /api/reviews - Get all reviews (for admin)
        if (method.equalsIgnoreCase("GET") && path.equals("/api/reviews")) {
            getAllReviews(exchange);
            return;
        }

        // PUT /api/reviews/{id}/status - Approve or reject review (admin)
        if (method.equalsIgnoreCase("PUT") && path.matches(".*/api/reviews/\\d+/status.*")) {
            int reviewId = extractReviewId(path);
            updateReviewStatus(exchange, reviewId);
            return;
        }

        // GET /api/reviews/approved - Get approved reviews (for public display)
        if (method.equalsIgnoreCase("GET") && path.equals("/api/reviews/approved")) {
            getApprovedReviews(exchange);
            return;
        }

        Server.sendResponse(exchange, 404, "{\"error\":\"Endpoint not found\"}");
    }

    private int extractReviewId(String path) {
        try {
            String[] parts = path.split("/");
            for (int i = 0; i < parts.length; i++) {
                if (parts[i].equals("reviews") && i + 1 < parts.length) {
                    return Integer.parseInt(parts[i + 1]);
                }
            }
        } catch (Exception e) {
            System.out.println("Error extracting review ID: " + e.getMessage());
        }
        return 0;
    }

    // Submit a new review (goes to pending initially)
    private void submitReview(HttpExchange exchange) throws IOException {
        Connection conn = DatabaseConnection.getConnection();

        if (conn == null) {
            Server.sendResponse(exchange, 500, "{\"error\":\"Database not connected\"}");
            return;
        }

        try {
            String body = Server.readRequestBody(exchange);
            String customerName = extractJsonValue(body, "customer_name");
            int rating = Integer.parseInt(extractJsonValue(body, "rating"));
            String comment = extractJsonValue(body, "comment");
            String foodIdStr = extractJsonValue(body, "food_id");
            String orderIdStr = extractJsonValue(body, "order_id");

            Integer foodId = foodIdStr.isEmpty() ? null : Integer.parseInt(foodIdStr);
            Integer orderId = orderIdStr.isEmpty() ? null : Integer.parseInt(orderIdStr);

            String sql = "INSERT INTO reviews (order_id, food_id, customer_name, rating, comment, status) VALUES (?, ?, ?, ?, ?, 'pending')";
            PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            
            if (orderId != null) stmt.setInt(1, orderId);
            else stmt.setNull(1, Types.INTEGER);
            
            if (foodId != null) stmt.setInt(2, foodId);
            else stmt.setNull(2, Types.INTEGER);
            
            stmt.setString(3, customerName);
            stmt.setInt(4, rating);
            stmt.setString(5, comment);
            
            stmt.executeUpdate();

            ResultSet keys = stmt.getGeneratedKeys();
            int newId = 0;
            if (keys.next()) newId = keys.getInt(1);

            // Notify admin
            System.out.println("===========================================");
            System.out.println("📝 NEW REVIEW SUBMITTED!");
            System.out.println("===========================================");
            System.out.println("Review ID: #" + newId);
            System.out.println("Customer: " + customerName);
            System.out.println("Rating: " + rating + "/5 stars");
            System.out.println("Comment: " + comment);
            System.out.println("Status: Pending approval");
            System.out.println("===========================================");

            Server.sendResponse(exchange, 201, "{\"message\":\"Review submitted! Pending approval.\",\"reviewId\":" + newId + "}");

        } catch (Exception e) {
            System.out.println("❌ Error submitting review: " + e.getMessage());
            Server.sendResponse(exchange, 500, "{\"error\":\"Failed to submit review\"}");
        }
    }

    // Get all reviews (for admin - shows pending, approved, rejected)
    private void getAllReviews(HttpExchange exchange) throws IOException {
        Connection conn = DatabaseConnection.getConnection();

        if (conn == null) {
            Server.sendResponse(exchange, 500, "{\"error\":\"Database not connected\"}");
            return;
        }

        try {
            String sql = "SELECT * FROM reviews ORDER BY created_at DESC";
            PreparedStatement stmt = conn.prepareStatement(sql);
            ResultSet rs = stmt.executeQuery();

            StringBuilder json = new StringBuilder("[");
            boolean first = true;

            while (rs.next()) {
                if (!first) json.append(",");
                json.append("{")
                    .append("\"id\":").append(rs.getInt("id")).append(",")
                    .append("\"order_id\":").append(rs.getObject("order_id") != null ? rs.getInt("order_id") : "null").append(",")
                    .append("\"food_id\":").append(rs.getObject("food_id") != null ? rs.getInt("food_id") : "null").append(",")
                    .append("\"customer_name\":\"").append(escapeJson(rs.getString("customer_name"))).append("\",")
                    .append("\"rating\":").append(rs.getInt("rating")).append(",")
                    .append("\"comment\":\"").append(escapeJson(rs.getString("comment"))).append("\",")
                    .append("\"status\":\"").append(rs.getString("status")).append("\",")
                    .append("\"created_at\":\"").append(rs.getString("created_at")).append("\"")
                    .append("}");
                first = false;
            }

            json.append("]");
            Server.sendResponse(exchange, 200, json.toString());

        } catch (SQLException e) {
            System.out.println("❌ Error fetching reviews: " + e.getMessage());
            Server.sendResponse(exchange, 500, "{\"error\":\"Failed to fetch reviews\"}");
        }
    }

    // Get approved reviews (for public display)
    private void getApprovedReviews(HttpExchange exchange) throws IOException {
        Connection conn = DatabaseConnection.getConnection();

        if (conn == null) {
            Server.sendResponse(exchange, 500, "{\"error\":\"Database not connected\"}");
            return;
        }

        try {
            String sql = "SELECT * FROM reviews WHERE status = 'approved' ORDER BY created_at DESC LIMIT 20";
            PreparedStatement stmt = conn.prepareStatement(sql);
            ResultSet rs = stmt.executeQuery();

            StringBuilder json = new StringBuilder("[");
            boolean first = true;

            while (rs.next()) {
                if (!first) json.append(",");
                json.append("{")
                    .append("\"id\":").append(rs.getInt("id")).append(",")
                    .append("\"customer_name\":\"").append(escapeJson(rs.getString("customer_name"))).append("\",")
                    .append("\"rating\":").append(rs.getInt("rating")).append(",")
                    .append("\"comment\":\"").append(escapeJson(rs.getString("comment"))).append("\",")
                    .append("\"created_at\":\"").append(rs.getString("created_at")).append("\"")
                    .append("}");
                first = false;
            }

            json.append("]");
            Server.sendResponse(exchange, 200, json.toString());

        } catch (SQLException e) {
            System.out.println("❌ Error fetching approved reviews: " + e.getMessage());
            Server.sendResponse(exchange, 500, "{\"error\":\"Failed to fetch reviews\"}");
        }
    }

    // Update review status (approve or reject)
    private void updateReviewStatus(HttpExchange exchange, int reviewId) throws IOException {
        Connection conn = DatabaseConnection.getConnection();

        if (conn == null) {
            Server.sendResponse(exchange, 500, "{\"error\":\"Database not connected\"}");
            return;
        }

        try {
            String body = Server.readRequestBody(exchange);
            String newStatus = extractJsonValue(body, "status");

            if (!newStatus.equals("approved") && !newStatus.equals("rejected")) {
                Server.sendResponse(exchange, 400, "{\"error\":\"Status must be 'approved' or 'rejected'\"}");
                return;
            }

            String sql = "UPDATE reviews SET status = ? WHERE id = ?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, newStatus);
            stmt.setInt(2, reviewId);
            int rows = stmt.executeUpdate();

            if (rows > 0) {
                System.out.println("📝 Review #" + reviewId + " " + newStatus);
                Server.sendResponse(exchange, 200, "{\"message\":\"Review " + newStatus + "\"}");
            } else {
                Server.sendResponse(exchange, 404, "{\"error\":\"Review not found\"}");
            }

        } catch (Exception e) {
            System.out.println("❌ Error updating review: " + e.getMessage());
            Server.sendResponse(exchange, 500, "{\"error\":\"Failed to update review\"}");
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
