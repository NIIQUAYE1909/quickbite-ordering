// =============================================
// QuickBite - Food Ordering System
// FoodRoutes.java
// Handles all /api/foods API requests
// When the frontend asks "give me all food items", this responds
// =============================================

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.sql.*;

public class FoodRoutes implements HttpHandler {

    // This method is called automatically when a request hits /api/foods
    @Override
    public void handle(HttpExchange exchange) throws IOException {

        // Handle browser preflight (CORS OPTIONS check)
        if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
            Server.addCorsHeaders(exchange);
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        Server.addCorsHeaders(exchange);
        String method = exchange.getRequestMethod();

        // Route to correct handler based on HTTP method
        if (method.equalsIgnoreCase("GET")) {
            getAllFoods(exchange);
        } else {
            Server.sendResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
        }
    }

    // ---- GET ALL FOODS ----
    // Reads all food items from the database and sends them as JSON
    private void getAllFoods(HttpExchange exchange) throws IOException {
        Connection conn = DatabaseConnection.getConnection();

        if (conn == null) {
            Server.sendResponse(exchange, 500, "{\"error\":\"Database not connected\"}");
            return;
        }

        try {
            // SQL query to fetch all food items
            String sql = "SELECT * FROM foods ORDER BY id ASC";
            PreparedStatement stmt = conn.prepareStatement(sql);
            ResultSet rs = stmt.executeQuery();

            // Build a JSON array manually from the results
            StringBuilder json = new StringBuilder("[");
            boolean first = true;

            while (rs.next()) {
                if (!first) json.append(",");
                json.append("{")
                    .append("\"id\":").append(rs.getInt("id")).append(",")
                    .append("\"name\":\"").append(rs.getString("name")).append("\",")
                    .append("\"description\":\"").append(rs.getString("description")).append("\",")
                    .append("\"price\":").append(rs.getDouble("price")).append(",")
                    .append("\"emoji\":\"").append(rs.getString("emoji")).append("\",")
                    .append("\"category\":\"").append(rs.getString("category")).append("\",")
                    .append("\"rating\":").append(rs.getDouble("rating")).append(",")
                    .append("\"reviews\":0,")
                    .append("\"badge\":").append(rs.getString("badge") == null ? "null" : "\"" + rs.getString("badge") + "\"")
                    .append("}");
                first = false;
            }

            json.append("]");

            Server.sendResponse(exchange, 200, json.toString());

        } catch (SQLException e) {
            System.out.println("❌ Error fetching foods: " + e.getMessage());
            Server.sendResponse(exchange, 500, "{\"error\":\"Failed to fetch food items\"}");
        }
    }
}
