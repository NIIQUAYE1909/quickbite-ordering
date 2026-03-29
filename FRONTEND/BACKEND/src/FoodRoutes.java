// =============================================
// QuickBite - Food Ordering System
// FoodRoutes.java
// Handles all /api/foods API requests
// When the frontend asks "give me all food items", this responds
// =============================================

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class FoodRoutes implements HttpHandler {

    private static final FoodSeed[] CORE_FOODS = new FoodSeed[] {
        new FoodSeed("Double Smash Burger", "Two smashed beef patties, cheddar, caramelized onions & special sauce", 55.00, "🍔", "burger", 4.9, "HOT"),
        new FoodSeed("Classic Margherita", "12\" hand-tossed dough, San Marzano tomato, fresh mozzarella & basil", 70.00, "🍕", "pizza", 4.7, null),
        new FoodSeed("Waakye Special", "Waakye, fried fish, boiled egg, spaghetti, stew & kelewele", 30.00, "🍜", "local", 4.9, "FAN FAV"),
        new FoodSeed("Grilled Chicken Combo", "Whole grilled chicken, jollof rice, coleslaw & chilled drink", 75.00, "🍗", "chicken", 4.8, "DEAL"),
        new FoodSeed("Pepperoni Pizza", "Premium pepperoni, triple mozzarella on a crispy thin crust", 80.00, "🍕", "pizza", 4.6, null),
        new FoodSeed("Chicken Shawarma", "Grilled chicken strips, garlic mayo, veggies wrapped in warm pita", 35.00, "🌯", "chicken", 4.8, null),
        new FoodSeed("Banku & Tilapia", "Freshly made banku with whole grilled tilapia and pepper sauce", 45.00, "🐟", "local", 4.9, "LOCAL FAV"),
        new FoodSeed("Chocolate Lava Cake", "Warm chocolate cake with a gooey molten center, vanilla ice cream", 28.00, "🍰", "dessert", 4.7, null),
        new FoodSeed("Fresh Fruit Smoothie", "Blended mango, pineapple, strawberry with a hint of ginger", 20.00, "🥤", "drinks", 4.6, null),
        new FoodSeed("Cheese Burger Deluxe", "Juicy beef patty, bacon, triple cheese, lettuce, tomato & pickle", 60.00, "🍔", "burger", 4.8, null),
        new FoodSeed("Jollof Rice Special", "Party jollof rice with fried plantain, coleslaw & your choice of protein", 40.00, "🍚", "local", 4.9, "BESTSELLER"),
        new FoodSeed("Strawberry Cheesecake", "Creamy New York cheesecake on graham cracker crust, topped with strawberry coulis", 32.00, "🍓", "dessert", 4.8, null),
        new FoodSeed("Sobolo Delight", "Chilled hibiscus drink with ginger, mint & a squeeze of lime", 15.00, "🍹", "drinks", 4.8, "LOCAL FAV"),
        new FoodSeed("Fufu & Light Soup", "Soft pounded cassava fufu served with rich light soup and tender goat meat", 48.00, "🍲", "local", 4.8, "LOCAL FAV"),
        new FoodSeed("Kenkey & Fried Fish", "Ga kenkey with crispy fried fish, shito, onions and fresh pepper", 34.00, "🐟", "local", 4.7, null),
        new FoodSeed("Red Red Bowl", "Beans stew served with sweet fried plantain and gari topping", 26.00, "🥘", "local", 4.7, null),
        new FoodSeed("Ampesi & Kontomire", "Boiled yam and plantain served with kontomire stew and smoked fish", 38.00, "🥔", "local", 4.8, null),
        new FoodSeed("Tuo Zaafi Special", "Northern-style tuo zaafi served with ayoyo soup and tender beef", 42.00, "🍲", "local", 4.8, "CHEF PICK"),
        new FoodSeed("Crispy Chicken Burger", "Crunchy chicken fillet, lettuce, spicy mayo and pickles on a toasted bun", 52.00, "🍔", "burger", 4.7, null),
        new FoodSeed("Caramel Choco Brownie", "Fudgy chocolate brownie topped with caramel drizzle and vanilla cream", 24.00, "🍫", "dessert", 4.7, null),
        new FoodSeed("Lamugin Cooler", "Refreshing northern spice drink with milk, ginger and cloves served cold", 18.00, "🥛", "drinks", 4.6, null)
    };

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
            Server.addCorsHeaders(exchange);
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        Server.addCorsHeaders(exchange);
        String method = exchange.getRequestMethod();

        if (method.equalsIgnoreCase("GET")) {
            getAllFoods(exchange);
        } else {
            Server.sendResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
        }
    }

    private void getAllFoods(HttpExchange exchange) throws IOException {
        Connection conn = DatabaseConnection.getConnection();

        if (conn == null) {
            Server.sendResponse(exchange, 500, "{\"error\":\"Database not connected\"}");
            return;
        }

        try {
            ensureCoreFoods(conn);

            String sql = "SELECT * FROM foods ORDER BY id ASC";
            PreparedStatement stmt = conn.prepareStatement(sql);
            ResultSet rs = stmt.executeQuery();

            StringBuilder json = new StringBuilder("[");
            boolean first = true;

            while (rs.next()) {
                if (!first) {
                    json.append(",");
                }
                json.append("{")
                    .append("\"id\":").append(rs.getInt("id")).append(",")
                    .append("\"name\":\"").append(escapeJson(rs.getString("name"))).append("\",")
                    .append("\"description\":\"").append(escapeJson(rs.getString("description"))).append("\",")
                    .append("\"price\":").append(rs.getDouble("price")).append(",")
                    .append("\"emoji\":\"").append(escapeJson(rs.getString("emoji"))).append("\",")
                    .append("\"category\":\"").append(escapeJson(rs.getString("category"))).append("\",")
                    .append("\"rating\":").append(rs.getDouble("rating")).append(",")
                    .append("\"reviews\":0,")
                    .append("\"badge\":").append(rs.getString("badge") == null ? "null" : "\"" + escapeJson(rs.getString("badge")) + "\"")
                    .append("}");
                first = false;
            }

            json.append("]");
            Server.sendResponse(exchange, 200, json.toString());
        } catch (SQLException e) {
            System.out.println("Error fetching foods: " + e.getMessage());
            Server.sendResponse(exchange, 500, "{\"error\":\"Failed to fetch food items\"}");
        }
    }

    private void ensureCoreFoods(Connection conn) throws SQLException {
        String existsSql = "SELECT 1 FROM foods WHERE LOWER(name) = LOWER(?) LIMIT 1";
        String insertSql = "INSERT INTO foods (name, description, price, emoji, category, rating, badge) VALUES (?, ?, ?, ?, ?, ?, ?)";

        try (PreparedStatement existsStmt = conn.prepareStatement(existsSql);
             PreparedStatement insertStmt = conn.prepareStatement(insertSql)) {
            for (FoodSeed food : CORE_FOODS) {
                existsStmt.setString(1, food.name);
                try (ResultSet rs = existsStmt.executeQuery()) {
                    if (rs.next()) {
                        continue;
                    }
                }

                insertStmt.setString(1, food.name);
                insertStmt.setString(2, food.description);
                insertStmt.setDouble(3, food.price);
                insertStmt.setString(4, food.emoji);
                insertStmt.setString(5, food.category);
                insertStmt.setDouble(6, food.rating);
                insertStmt.setString(7, food.badge);
                insertStmt.executeUpdate();
            }
        }
    }

    private String escapeJson(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\\", "\\\\")
                    .replace("\"", "\\\"")
                    .replace("\n", "\\n")
                    .replace("\r", "\\r")
                    .replace("\t", "\\t");
    }

    private static class FoodSeed {
        private final String name;
        private final String description;
        private final double price;
        private final String emoji;
        private final String category;
        private final double rating;
        private final String badge;

        private FoodSeed(String name, String description, double price, String emoji, String category, double rating, String badge) {
            this.name = name;
            this.description = description;
            this.price = price;
            this.emoji = emoji;
            this.category = category;
            this.rating = rating;
            this.badge = badge;
        }
    }
}
