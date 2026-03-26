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
            Properties props = loadConfig();
            String url = firstNonEmpty(
                System.getenv("DB_URL"),
                System.getenv("DATABASE_URL"),
                System.getenv("db.url"),
                System.getProperty("db.url"),
                props.getProperty("db.url")
            );
            String user = firstNonEmpty(
                System.getenv("DB_USER"),
                System.getenv("db.user"),
                System.getProperty("db.user"),
                props.getProperty("db.user")
            );
            String password = firstNonEmpty(
                System.getenv("DB_PASSWORD"),
                System.getenv("db.password"),
                System.getProperty("db.password"),
                props.getProperty("db.password"),
                ""
            );

            if (url == null || user == null) {
                System.out.println("❌ Database settings are missing. Set DB_URL, DB_USER, and DB_PASSWORD for production.");
                return;
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

    private String firstNonEmpty(String... values) {
        for (String value : values) {
            if (value != null && !value.trim().isEmpty()) {
                return value.trim();
            }
        }
        return null;
    }

    // ---- LOAD CONFIG FILE ----
    // Reads the config.properties file to get DB credentials
    private Properties loadConfig() {
        Properties props = new Properties();
        try {
            // Try multiple paths for config.properties
            String[] paths = {
                "config.properties"
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
                System.out.println("⚠️  config.properties not found. Falling back to environment variables.");
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
