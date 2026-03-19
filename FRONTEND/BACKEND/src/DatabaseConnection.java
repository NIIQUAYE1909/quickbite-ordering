// =============================================
// QuickBite - Food Ordering System
// DatabaseConnection.java
// This file handles connecting Java to MySQL (XAMPP)
// Think of this as the "bridge" between your code and database
// =============================================



import java.io.FileInputStream;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

public class DatabaseConnection {

    // This 'connection' object is what we use to talk to MySQL
    private static Connection connection = null;

    // ---- CONNECT TO DATABASE ----
    public void connect() {
        try {
            // First try to load from config.properties file
            Properties props = loadConfig();
            
            // Then check for environment variables (for production deployment)
            String url = System.getProperty("db.url") != null ? System.getProperty("db.url") : props.getProperty("db.url");
            String user = System.getProperty("db.user") != null ? System.getProperty("db.user") : props.getProperty("db.user");
            String password = System.getProperty("db.password") != null ? System.getProperty("db.password") : props.getProperty("db.password");
            
            // Fallback to environment variables (Render uses these)
            if (url == null || url.isEmpty()) {
                url = System.getenv("db.url") != null ? System.getenv("db.url") : System.getenv("DB_URL");
                user = System.getenv("db.user") != null ? System.getenv("db.user") : System.getenv("DB_USER");
                password = System.getenv("db.password") != null ? System.getenv("db.password") : System.getenv("DB_PASSWORD");
                // Allow empty passwords if DB_PASSWORD is not set or empty (useful for local dev)
                if (password == null) password = "";
                
                // Extra fallback for providers like Railway that set DATABASE_URL
                if (System.getenv("DATABASE_URL") != null && url == null) {
                    url = System.getenv("DATABASE_URL");
                }
            }

            // Load the MySQL JDBC driver
            Class.forName("com.mysql.cj.jdbc.Driver");

            // Establish the connection
            connection = DriverManager.getConnection(url, user, password);

            System.out.println("✅ Database connected successfully!");

        } catch (ClassNotFoundException e) {
            System.out.println("❌ MySQL Driver not found. Make sure mysql-connector.jar is in /lib folder.");
            e.printStackTrace();
        } catch (SQLException e) {
            System.out.println("❌ Database connection failed. Is XAMPP running?");
            e.printStackTrace();
        }
    }

    // ---- GET THE CONNECTION (used by route files) ----
    // Other classes call this to get the connection and run queries
    public static Connection getConnection() {
        return connection;
    }

    // ---- LOAD CONFIG FILE ----
    // Reads the config.properties file to get DB credentials
    private Properties loadConfig() {
        Properties props = new Properties();
        try {
            // Try multiple paths for config.properties
            String[] paths = {
                "config.properties",
                "BACKEND/config.properties",
                "FRONTEND/BACKEND/config.properties"
            };
            
            FileInputStream fis = null;
            for (String path : paths) {
                try {
                    fis = new FileInputStream(path);
                    System.out.println("✅ Found config.properties at: " + path);
                    break;
                } catch (IOException e) {
                    // Try next path
                }
            }
            
            if (fis == null) {
                // Try loading from classpath
                ClassLoader classLoader = getClass().getClassLoader();
                if (classLoader.getResourceAsStream("config.properties") != null) {
                    props.load(classLoader.getResourceAsStream("config.properties"));
                    System.out.println("✅ Loaded config.properties from classpath");
                    return props;
                }
                System.out.println("❌ Could not find config.properties in any location");
                return props;
            }
            
            props.load(fis);
            fis.close();
        } catch (IOException e) {
            System.out.println("❌ Could not load config.properties file.");
            e.printStackTrace();
        }
        return props;
    }
}