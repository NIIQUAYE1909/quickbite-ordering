import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;

public class AdminRoutes implements HttpHandler {

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

        if (method.equalsIgnoreCase("POST") && path.endsWith("/login")) {
            login(exchange);
            return;
        }

        if (method.equalsIgnoreCase("POST") && path.endsWith("/logout")) {
            logout(exchange);
            return;
        }

        if (method.equalsIgnoreCase("GET") && path.endsWith("/session")) {
            session(exchange);
            return;
        }

        Server.sendResponse(exchange, 404, "{\"error\":\"Not found\"}");
    }

    private void login(HttpExchange exchange) throws IOException {
        try {
            String body = Server.readRequestBody(exchange);
            String username = extractJsonValue(body, "username").trim().toLowerCase();
            String password = extractJsonValue(body, "password");

            if (username.equals(Server.getAdminUsername()) && password.equals(Server.getAdminPassword())) {
                String token = Server.issueAdminToken();
                Server.sendResponse(exchange, 200, "{"
                    + "\"message\":\"Admin login successful.\","
                    + "\"token\":\"" + escapeJson(token) + "\""
                    + "}");
                return;
            }

            Server.sendResponse(exchange, 401, "{\"error\":\"Invalid admin credentials.\"}");
        } catch (Exception e) {
            System.out.println("Error during admin login: " + e.getMessage());
            Server.sendResponse(exchange, 500, "{\"error\":\"Unable to log in right now.\"}");
        }
    }

    private void logout(HttpExchange exchange) throws IOException {
        try {
            if (!Server.isAuthorizedAdmin(exchange)) {
                Server.sendResponse(exchange, 401, "{\"error\":\"Admin session already expired.\"}");
                return;
            }

            Server.clearAdminToken();
            Server.sendResponse(exchange, 200, "{\"message\":\"Admin logged out.\"}");
        } catch (Exception e) {
            System.out.println("Error during admin logout: " + e.getMessage());
            Server.sendResponse(exchange, 500, "{\"error\":\"Unable to log out right now.\"}");
        }
    }

    private void session(HttpExchange exchange) throws IOException {
        try {
            if (!Server.isAuthorizedAdmin(exchange)) {
                Server.sendResponse(exchange, 401, "{\"error\":\"Admin session expired.\"}");
                return;
            }

            Server.sendResponse(exchange, 200, "{\"valid\":true}");
        } catch (Exception e) {
            System.out.println("Error checking admin session: " + e.getMessage());
            Server.sendResponse(exchange, 500, "{\"error\":\"Unable to verify admin session.\"}");
        }
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
        if (start == 0 || end == -1) return "";
        return json.substring(start, end);
    }

    private String escapeJson(String value) {
        if (value == null) return "";
        return value.replace("\\", "\\\\")
                    .replace("\"", "\\\"");
    }
}
