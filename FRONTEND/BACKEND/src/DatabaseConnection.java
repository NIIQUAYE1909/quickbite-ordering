// =============================================
// QuickBite - Food Ordering System
// DatabaseConnection.java
// Handles database connectivity for local and hosted environments.
// =============================================

import java.io.FileInputStream;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

public class DatabaseConnection {

    private static Connection connection = null;
    private static String dbUrl = null;
    private static String dbUser = null;
    private static String dbPassword = "";

    public void connect() {
        try {
            Properties props = loadConfig();
            dbUrl = firstNonEmpty(
                System.getenv("DB_URL"),
                System.getenv("DATABASE_URL"),
                System.getenv("db.url"),
                System.getProperty("db.url"),
                props.getProperty("db.url")
            );
            dbUser = firstNonEmpty(
                System.getenv("DB_USER"),
                System.getenv("db.user"),
                System.getProperty("db.user"),
                props.getProperty("db.user")
            );
            dbPassword = firstNonEmpty(
                System.getenv("DB_PASSWORD"),
                System.getenv("db.password"),
                System.getProperty("db.password"),
                props.getProperty("db.password"),
                ""
            );

            if (dbUrl == null || dbUser == null) {
                System.out.println("Database settings are missing. Set DB_URL, DB_USER, and DB_PASSWORD for production.");
                return;
            }

            Class.forName("com.mysql.cj.jdbc.Driver");
            connection = openConnection();
            System.out.println("Database connected successfully.");

        } catch (ClassNotFoundException e) {
            System.out.println("MySQL Driver not found. Make sure mysql-connector.jar is in /lib folder.");
            e.printStackTrace();
        } catch (SQLException e) {
            System.out.println("Database connection failed.");
            e.printStackTrace();
        }
    }

    public static synchronized Connection getConnection() {
        try {
            if (connection == null || connection.isClosed() || !connection.isValid(2)) {
                connection = openConnection();
                System.out.println("Database connection refreshed.");
            }
        } catch (SQLException e) {
            System.out.println("Database reconnection failed: " + e.getMessage());
            connection = null;
        }
        return connection;
    }

    private static Connection openConnection() throws SQLException {
        if (dbUrl == null || dbUser == null) {
            return null;
        }
        return DriverManager.getConnection(dbUrl, dbUser, dbPassword);
    }

    private String firstNonEmpty(String... values) {
        for (String value : values) {
            if (value != null && !value.trim().isEmpty()) {
                return value.trim();
            }
        }
        return null;
    }

    private Properties loadConfig() {
        Properties props = new Properties();
        try {
            String[] paths = { "config.properties" };

            FileInputStream fis = null;
            for (String path : paths) {
                try {
                    fis = new FileInputStream(path);
                    System.out.println("Found config.properties at: " + path);
                    break;
                } catch (IOException e) {
                    // Try next path.
                }
            }

            if (fis == null) {
                ClassLoader classLoader = getClass().getClassLoader();
                if (classLoader.getResourceAsStream("config.properties") != null) {
                    props.load(classLoader.getResourceAsStream("config.properties"));
                    System.out.println("Loaded config.properties from classpath");
                    return props;
                }
                System.out.println("config.properties not found. Falling back to environment variables.");
                return props;
            }

            props.load(fis);
            fis.close();
        } catch (IOException e) {
            System.out.println("Could not load config.properties file.");
            e.printStackTrace();
        }
        return props;
    }
}
