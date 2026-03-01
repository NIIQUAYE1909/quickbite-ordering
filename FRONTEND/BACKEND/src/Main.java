// =============================================
// QuickBite - Food Ordering System
// Main.java — Entry point for the backend
// =============================================

public class Main {
    public static void main(String[] args) {
        System.out.println("========================================");
        System.out.println("  🍽️ QuickBite Food Ordering System");
        System.out.println("========================================");
        
        // Step 1: Connect to database
        System.out.println("\n📦 Connecting to database...");
        DatabaseConnection db = new DatabaseConnection();
        db.connect();
        
        // Check if database connection was successful
        if (DatabaseConnection.getConnection() == null) {
            System.out.println("❌ Failed to connect to database. Exiting...");
            System.exit(1);
        }
        
        // Step 2: Start the HTTP server
        System.out.println("\n🚀 Starting server...");
        Server server = new Server();
        server.start();
        
        System.out.println("\n✅ System ready! Open http://localhost:8080/api/health");
    }
}
