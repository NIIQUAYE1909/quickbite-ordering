// =============================================
// QuickBite - Food Ordering System
// OrderRoutes.java
// Handles all /api/orders requests
// =============================================

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.security.SecureRandom;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class OrderRoutes implements HttpHandler {
    private static final SecureRandom CODE_RANDOM = new SecureRandom();
    private static final String[] AUTO_DRIVER_NAMES = {
        "Kwame Mensah",
        "Ama Owusu",
        "Kofi Asare",
        "Abena Boateng",
        "Kojo Addo",
        "Efua Nyarko",
        "Yaw Ofori",
        "Akosua Badu"
    };

    private static final String[] AUTO_DRIVER_PHONES = {
        "0551002001",
        "0551002002",
        "0551002003",
        "0551002004",
        "0551002005",
        "0551002006",
        "0551002007",
        "0551002008"
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
        String path = exchange.getRequestURI().getPath();
        String query = exchange.getRequestURI().getQuery();

        if (method.equalsIgnoreCase("GET") && path.contains("/history")) {
            String email = query != null ? extractEmailFromQuery(query) : "";
            if (!email.isEmpty()) {
                getOrderHistory(exchange, email);
                return;
            }
        }

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

    private String extractEmailFromQuery(String query) {
        if (query == null) return "";
        for (String part : query.split("&")) {
            String[] kv = part.split("=");
            if (kv.length == 2 && kv[0].equals("email")) {
                return java.net.URLDecoder.decode(kv[1], java.nio.charset.StandardCharsets.UTF_8);
            }
        }
        return "";
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

    private void getAllOrders(HttpExchange exchange) throws IOException {
        Connection conn = DatabaseConnection.getConnection();

        if (conn == null) {
            Server.sendResponse(exchange, 500, "{\"error\":\"Database not connected\"}");
            return;
        }

        try {
            DatabaseMetaData meta = conn.getMetaData();
            boolean hasDriverColumns = hasColumn(meta, "orders", "driver_name")
                && hasColumn(meta, "orders", "driver_phone");

            String driverCols = hasDriverColumns ? ", driver_name, driver_phone" : "";
            String sql = "SELECT *" + driverCols + " FROM orders ORDER BY created_at DESC";
            PreparedStatement stmt = conn.prepareStatement(sql);
            ResultSet rs = stmt.executeQuery();

            StringBuilder json = new StringBuilder("[");
            boolean first = true;

            while (rs.next()) {
                if (!first) json.append(",");
                String driverName = "";
                String driverPhone = "";
                if (hasDriverColumns) {
                    try { driverName = rs.getString("driver_name"); } catch (Exception e) { driverName = ""; }
                    try { driverPhone = rs.getString("driver_phone"); } catch (Exception e) { driverPhone = ""; }
                }
                int orderId = rs.getInt("id");
                json.append("{")
                    .append("\"id\":").append(orderId).append(",")
                    .append("\"customer_name\":\"").append(escapeJson(rs.getString("customer_name"))).append("\",")
                    .append("\"phone\":\"").append(escapeJson(rs.getString("phone"))).append("\",")
                    .append("\"address\":\"").append(escapeJson(rs.getString("address"))).append("\",")
                    .append("\"total\":").append(rs.getDouble("total")).append(",")
                    .append("\"status\":\"").append(escapeJson(rs.getString("status"))).append("\",")
                    .append("\"driver_name\":\"").append(escapeJson(driverName)).append("\",")
                    .append("\"driver_phone\":\"").append(escapeJson(driverPhone)).append("\",")
                    .append("\"created_at\":\"").append(escapeJson(rs.getString("created_at"))).append("\",")
                    .append("\"items\":").append(getOrderItemsJson(conn, orderId))
                    .append("}");
                first = false;
            }

            json.append("]");
            Server.sendResponse(exchange, 200, json.toString());

        } catch (SQLException e) {
            System.out.println("Error fetching orders: " + e.getMessage());
            Server.sendResponse(exchange, 500, "{\"error\":\"Failed to fetch orders\"}");
        }
    }

    private void getOrderHistory(HttpExchange exchange, String email) throws IOException {
        Connection conn = DatabaseConnection.getConnection();
        if (conn == null) {
            Server.sendResponse(exchange, 500, "{\"error\":\"Database not connected\"}");
            return;
        }

        try {
            String sql = "SELECT * FROM orders WHERE customer_email = ? ORDER BY created_at DESC";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();

            StringBuilder json = new StringBuilder("{\"email\":\"")
                .append(escapeJson(email))
                .append("\",\"orders\":[");
            boolean first = true;

            while (rs.next()) {
                if (!first) json.append(",");
                int orderId = rs.getInt("id");

                String trackingSql = "SELECT latitude, longitude, speed_kmh, heading, updated_at FROM delivery_tracking WHERE order_id = ?";
                PreparedStatement trackingStmt = conn.prepareStatement(trackingSql);
                trackingStmt.setInt(1, orderId);
                ResultSet trackingRs = trackingStmt.executeQuery();

                String trackingJson = "null";
                if (trackingRs.next()) {
                    trackingJson = "{\"latitude\":" + trackingRs.getDouble("latitude")
                        + ",\"longitude\":" + trackingRs.getDouble("longitude")
                        + ",\"speed_kmh\":" + trackingRs.getDouble("speed_kmh")
                        + ",\"heading\":" + trackingRs.getInt("heading")
                        + ",\"updated_at\":\"" + escapeJson(trackingRs.getString("updated_at")) + "\"}";
                }

                json.append("{")
                    .append("\"id\":").append(orderId).append(",")
                    .append("\"customer_name\":\"").append(escapeJson(rs.getString("customer_name"))).append("\",")
                    .append("\"customer_email\":\"").append(escapeJson(rs.getString("customer_email"))).append("\",")
                    .append("\"phone\":\"").append(escapeJson(rs.getString("phone"))).append("\",")
                    .append("\"address\":\"").append(escapeJson(rs.getString("address"))).append("\",")
                    .append("\"total\":").append(rs.getDouble("total")).append(",")
                    .append("\"status\":\"").append(escapeJson(rs.getString("status"))).append("\",")
                    .append("\"driver_name\":\"").append(escapeJson(rs.getString("driver_name"))).append("\",")
                    .append("\"driver_phone\":\"").append(escapeJson(rs.getString("driver_phone"))).append("\",")
                    .append("\"created_at\":\"").append(escapeJson(rs.getString("created_at"))).append("\",")
                    .append("\"tracking\":").append(trackingJson).append(",")
                    .append("\"items\":").append(getOrderItemsJson(conn, orderId))
                    .append("}");
                first = false;
            }

            json.append("]}");
            Server.sendResponse(exchange, 200, json.toString());

        } catch (SQLException e) {
            System.out.println("Error fetching order history: " + e.getMessage());
            Server.sendResponse(exchange, 500, "{\"error\":\"Failed to fetch order history\"}");
        }
    }

    private void placeOrder(HttpExchange exchange) throws IOException {
        Connection conn = DatabaseConnection.getConnection();

        if (conn == null) {
            Server.sendResponse(exchange, 500, "{\"error\":\"Database not connected\"}");
            return;
        }

        try {
            String body = Server.readRequestBody(exchange);
            String customerName = extractJsonValue(body, "customer_name");
            String customerEmail = extractJsonValue(body, "customer_email");
            double total = Double.parseDouble(extractJsonValue(body, "total"));
            String phone = extractJsonValue(body, "phone");
            String address = extractJsonValue(body, "address");

            ensureOrderItemsTable(conn);
            ensureDriverColumns(conn);

            DriverAssignment autoDriver = generateDriverAssignment(customerName, phone, address);
            int newId = insertOrder(conn, customerName, customerEmail, phone, address, total, autoDriver);

            insertOrderItems(conn, newId, body);

            System.out.println("===========================================");
            System.out.println("NEW ORDER RECEIVED");
            System.out.println("===========================================");
            System.out.println("Order ID: #" + newId);
            System.out.println("Customer: " + customerName);
            System.out.println("Email: " + (customerEmail.isEmpty() ? "N/A" : customerEmail));
            System.out.println("Phone: " + phone);
            System.out.println("Address: " + address);
            System.out.println("Auto-assigned driver: " + autoDriver.name + " (" + autoDriver.phone + ")");
            System.out.println("Total: GHc " + total);
            System.out.println("Time: " + new java.util.Date());
            System.out.println("===========================================\n");

            String response = "{"
                + "\"message\":\"Order placed!\","
                + "\"orderId\":" + newId + ","
                + "\"status\":\"Confirmed\","
                + "\"driver_name\":\"" + escapeJson(autoDriver.name) + "\","
                + "\"driver_phone\":\"" + escapeJson(autoDriver.phone) + "\","
                + "\"tracking_history_enabled\":true,"
                + "\"items\":" + getOrderItemsJson(conn, newId)
                + "}";
            Server.sendResponse(exchange, 201, response);

        } catch (Exception e) {
            System.out.println("Error placing order: " + e.getMessage());
            Server.sendResponse(exchange, 500, "{\"error\":\"Failed to place order\"}");
        }
    }

    private void assignDriver(HttpExchange exchange, int orderId) throws IOException {
        Connection conn = DatabaseConnection.getConnection();

        if (conn == null) {
            Server.sendResponse(exchange, 500, "{\"error\":\"Database not connected\"}");
            return;
        }

        try {
            DatabaseMetaData meta = conn.getMetaData();
            boolean hasDriverColumns = hasColumn(meta, "orders", "driver_name")
                && hasColumn(meta, "orders", "driver_phone");

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

                System.out.println("Driver assigned to Order #" + orderId + ": " + driverName + " (" + driverPhone + ")");

                try {
                    String emailSql = "SELECT customer_name, customer_email, address FROM orders WHERE id = ?";
                    PreparedStatement emailStmt = conn.prepareStatement(emailSql);
                    emailStmt.setInt(1, orderId);
                    ResultSet emailRs = emailStmt.executeQuery();
                    if (emailRs.next()) {
                        final String custName = emailRs.getString("customer_name");
                        final String custEmail = emailRs.getString("customer_email");
                        final String custAddr = emailRs.getString("address");
                        final String drName = driverName;
                        final String drPhone = driverPhone;
                        final int oId = orderId;
                        new Thread(() -> EmailService.sendDriverAssignedEmail(
                            custEmail, custName, oId, drName, drPhone, custAddr)).start();
                    }
                } catch (Exception emailEx) {
                    System.out.println("Could not send driver-assigned email: " + emailEx.getMessage());
                }

                Server.sendResponse(exchange, 200, "{\"message\":\"Driver assigned successfully\"}");
            } else {
                Server.sendResponse(exchange, 404, "{\"error\":\"Order not found\"}");
            }

        } catch (Exception e) {
            System.out.println("Error assigning driver: " + e.getMessage());
            Server.sendResponse(exchange, 500, "{\"error\":\"Failed to assign driver\"}");
        }
    }

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
                System.out.println("Order #" + orderId + " status updated to: " + newStatus);

                if ("Delivered".equalsIgnoreCase(newStatus)) {
                    try {
                        String emailSql = "SELECT customer_name, customer_email, address, total, driver_name FROM orders WHERE id = ?";
                        PreparedStatement emailStmt = conn.prepareStatement(emailSql);
                        emailStmt.setInt(1, orderId);
                        ResultSet emailRs = emailStmt.executeQuery();
                        if (emailRs.next()) {
                            final String custName = emailRs.getString("customer_name");
                            final String custEmail = emailRs.getString("customer_email");
                            final String custAddr = emailRs.getString("address");
                            final double orderTotal = emailRs.getDouble("total");
                            final String drName = emailRs.getString("driver_name");
                            final int oId = orderId;
                            new Thread(() -> EmailService.sendDeliveryConfirmation(
                                custEmail, custName, oId, orderTotal, drName, custAddr)).start();
                        }
                    } catch (Exception emailEx) {
                        System.out.println("Could not send delivery email: " + emailEx.getMessage());
                    }
                }

                Server.sendResponse(exchange, 200, "{\"message\":\"Status updated to " + escapeJson(newStatus) + "\"}");
            } else {
                Server.sendResponse(exchange, 404, "{\"error\":\"Order not found\"}");
            }

        } catch (Exception e) {
            System.out.println("Error updating status: " + e.getMessage());
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
            String numStr = json.substring(colonIndex + 1).replaceAll("[^0-9.\\-]", "");
            if (numStr.isEmpty()) return "";
            return numStr.split(",")[0].split("}")[0].trim();
        }
        return json.substring(start, end);
    }

    private void ensureOrderItemsTable(Connection conn) {
        try {
            String createSql = "CREATE TABLE IF NOT EXISTS order_items (" +
                "id INT AUTO_INCREMENT PRIMARY KEY," +
                "order_id INT NOT NULL," +
                "food_id INT NOT NULL," +
                "item_code VARCHAR(32) UNIQUE," +
                "quantity INT NOT NULL DEFAULT 1," +
                "price DECIMAL(10,2) NOT NULL," +
                "FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE," +
                "FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE CASCADE" +
                ")";
            conn.prepareStatement(createSql).execute();
            ensureOrderItemCodeColumn(conn);
        } catch (SQLException e) {
            System.out.println("Could not ensure order_items table: " + e.getMessage());
        }
    }

    private void ensureOrderItemCodeColumn(Connection conn) {
        try {
            DatabaseMetaData meta = conn.getMetaData();
            if (!hasColumn(meta, "order_items", "item_code")) {
                conn.prepareStatement("ALTER TABLE order_items ADD COLUMN item_code VARCHAR(32) UNIQUE").execute();
            }
        } catch (SQLException e) {
            System.out.println("Could not ensure item_code column: " + e.getMessage());
        }
    }

    private void ensureDriverColumns(Connection conn) {
        try {
            DatabaseMetaData meta = conn.getMetaData();
            if (!hasColumn(meta, "orders", "driver_name")) {
                conn.prepareStatement("ALTER TABLE orders ADD COLUMN driver_name VARCHAR(100)").execute();
            }
            if (!hasColumn(meta, "orders", "driver_phone")) {
                conn.prepareStatement("ALTER TABLE orders ADD COLUMN driver_phone VARCHAR(20)").execute();
            }
        } catch (SQLException e) {
            System.out.println("Could not ensure driver columns: " + e.getMessage());
        }
    }

    private boolean hasColumn(DatabaseMetaData meta, String tableName, String columnName) {
        try (ResultSet columns = meta.getColumns(null, null, tableName, columnName)) {
            return columns.next();
        } catch (SQLException e) {
            return false;
        }
    }

    private DriverAssignment generateDriverAssignment(String customerName, String phone, String address) {
        String seedSource = String.valueOf(customerName) + "|" + phone + "|" + address + "|" + System.currentTimeMillis();
        int index = Math.floorMod(seedSource.hashCode(), AUTO_DRIVER_NAMES.length);
        return new DriverAssignment(
            AUTO_DRIVER_NAMES[index],
            AUTO_DRIVER_PHONES[index % AUTO_DRIVER_PHONES.length]
        );
    }

    private int insertOrder(
        Connection conn,
        String customerName,
        String customerEmail,
        String phone,
        String address,
        double total,
        DriverAssignment autoDriver
    ) throws SQLException {
        SQLException lastError = null;
        String normalizedEmail = customerEmail == null || customerEmail.trim().isEmpty() ? null : customerEmail.trim();

        OrderInsertAttempt[] attempts = new OrderInsertAttempt[] {
            new OrderInsertAttempt(
                "INSERT INTO orders (customer_name, customer_email, phone, address, total, status, driver_name, driver_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                new Object[] { customerName, normalizedEmail, phone, address, total, "Confirmed", autoDriver.name, autoDriver.phone }
            ),
            new OrderInsertAttempt(
                "INSERT INTO orders (customer_name, customer_email, phone, address, total, status) VALUES (?, ?, ?, ?, ?, ?)",
                new Object[] { customerName, normalizedEmail, phone, address, total, "Confirmed" }
            ),
            new OrderInsertAttempt(
                "INSERT INTO orders (customer_name, phone, address, total, status, driver_name, driver_phone) VALUES (?, ?, ?, ?, ?, ?, ?)",
                new Object[] { customerName, phone, address, total, "Confirmed", autoDriver.name, autoDriver.phone }
            ),
            new OrderInsertAttempt(
                "INSERT INTO orders (customer_name, phone, address, total, status) VALUES (?, ?, ?, ?, ?)",
                new Object[] { customerName, phone, address, total, "Confirmed" }
            )
        };

        for (OrderInsertAttempt attempt : attempts) {
            try (PreparedStatement stmt = conn.prepareStatement(attempt.sql, Statement.RETURN_GENERATED_KEYS)) {
                bindOrderInsertParams(stmt, attempt.params);
                int rows = stmt.executeUpdate();
                if (rows <= 0) continue;

                try (ResultSet keys = stmt.getGeneratedKeys()) {
                    if (keys.next()) {
                        return keys.getInt(1);
                    }
                }

                try (PreparedStatement fallbackStmt = conn.prepareStatement("SELECT LAST_INSERT_ID()");
                     ResultSet rs = fallbackStmt.executeQuery()) {
                    if (rs.next()) {
                        return rs.getInt(1);
                    }
                }
                throw new SQLException("Order insert succeeded but no generated key was returned.");
            } catch (SQLException e) {
                lastError = e;
                System.out.println("Order insert attempt failed: " + e.getMessage());
            }
        }

        throw lastError != null ? lastError : new SQLException("No compatible orders insert statement was found.");
    }

    private void bindOrderInsertParams(PreparedStatement stmt, Object[] params) throws SQLException {
        for (int i = 0; i < params.length; i++) {
            Object param = params[i];
            int parameterIndex = i + 1;
            if (param == null) {
                stmt.setNull(parameterIndex, Types.VARCHAR);
            } else if (param instanceof Double) {
                stmt.setDouble(parameterIndex, (Double) param);
            } else {
                stmt.setString(parameterIndex, String.valueOf(param));
            }
        }
    }

    private void insertOrderItems(Connection conn, int orderId, String body) {
        List<OrderItemPayload> items = parseOrderItems(body);
        if (items.isEmpty()) return;

        String sql = "INSERT INTO order_items (order_id, food_id, item_code, quantity, price) VALUES (?, ?, ?, ?, ?)";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            int inserted = 0;
            for (OrderItemPayload item : items) {
                if (item.foodId <= 0 || item.quantity <= 0 || item.price < 0) continue;
                String itemCode = generateUniqueItemCode(conn);
                stmt.setInt(1, orderId);
                stmt.setInt(2, item.foodId);
                stmt.setString(3, itemCode);
                stmt.setInt(4, item.quantity);
                stmt.setDouble(5, item.price);
                stmt.addBatch();
                inserted++;
            }
            if (inserted > 0) {
                stmt.executeBatch();
                System.out.println("Saved " + inserted + " item(s) for Order #" + orderId);
            }
        } catch (SQLException e) {
            System.out.println("Could not save order items for Order #" + orderId + ": " + e.getMessage());
        }
    }

    private List<OrderItemPayload> parseOrderItems(String body) {
        List<OrderItemPayload> items = new ArrayList<>();
        String itemsArray = extractJsonArray(body, "items");
        if (itemsArray.isEmpty()) return items;

        Matcher objectMatcher = Pattern.compile("\\{[^{}]*\\}").matcher(itemsArray);
        while (objectMatcher.find()) {
            String itemJson = objectMatcher.group();
            int foodId = (int) parseJsonNumber(itemJson, "id");
            int quantity = (int) parseJsonNumber(itemJson, "qty");
            if (quantity <= 0) quantity = (int) parseJsonNumber(itemJson, "quantity");
            double price = parseJsonNumber(itemJson, "price");
            items.add(new OrderItemPayload(foodId, quantity <= 0 ? 1 : quantity, price));
        }
        return items;
    }

    private String extractJsonArray(String json, String key) {
        String searchKey = "\"" + key + "\"";
        int keyIndex = json.indexOf(searchKey);
        if (keyIndex == -1) return "";
        int colonIndex = json.indexOf(":", keyIndex);
        if (colonIndex == -1) return "";
        int start = json.indexOf("[", colonIndex);
        if (start == -1) return "";

        int depth = 0;
        for (int i = start; i < json.length(); i++) {
            char ch = json.charAt(i);
            if (ch == '[') depth++;
            if (ch == ']') {
                depth--;
                if (depth == 0) return json.substring(start, i + 1);
            }
        }
        return "";
    }

    private double parseJsonNumber(String json, String key) {
        String searchKey = "\"" + key + "\"";
        int keyIndex = json.indexOf(searchKey);
        if (keyIndex == -1) return 0.0;
        int colonIndex = json.indexOf(":", keyIndex);
        if (colonIndex == -1) return 0.0;
        String rest = json.substring(colonIndex + 1).trim();
        StringBuilder num = new StringBuilder();
        for (char c : rest.toCharArray()) {
            if (Character.isDigit(c) || c == '.' || c == '-') {
                num.append(c);
            } else if (num.length() > 0) {
                break;
            }
        }
        try {
            return Double.parseDouble(num.toString());
        } catch (Exception e) {
            return 0.0;
        }
    }

    private String getOrderItemsJson(Connection conn, int orderId) {
        String sql = "SELECT oi.food_id, oi.item_code, oi.quantity, oi.price, f.name, f.emoji " +
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
                    .append("\"item_code\":\"").append(escapeJson(rs.getString("item_code"))).append("\",")
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

    private String generateUniqueItemCode(Connection conn) {
        for (int attempt = 0; attempt < 10; attempt++) {
            String candidate = "QB-" + randomCodePart(6) + "-" + randomCodePart(6);
            if (isItemCodeAvailable(conn, candidate)) return candidate;
        }
        return "QB-" + System.currentTimeMillis();
    }

    private boolean isItemCodeAvailable(Connection conn, String itemCode) {
        String sql = "SELECT id FROM order_items WHERE item_code = ?";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, itemCode);
            ResultSet rs = stmt.executeQuery();
            return !rs.next();
        } catch (SQLException e) {
            return false;
        }
    }

    private String randomCodePart(int length) {
        final String alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        StringBuilder code = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            code.append(alphabet.charAt(CODE_RANDOM.nextInt(alphabet.length())));
        }
        return code.toString();
    }

    private static class OrderItemPayload {
        final int foodId;
        final int quantity;
        final double price;

        OrderItemPayload(int foodId, int quantity, double price) {
            this.foodId = foodId;
            this.quantity = quantity;
            this.price = price;
        }
    }

    private static class OrderInsertAttempt {
        final String sql;
        final Object[] params;

        OrderInsertAttempt(String sql, Object[] params) {
            this.sql = sql;
            this.params = params;
        }
    }

    private static class DriverAssignment {
        final String name;
        final String phone;

        DriverAssignment(String name, String phone) {
            this.name = name;
            this.phone = phone;
        }
    }
}
