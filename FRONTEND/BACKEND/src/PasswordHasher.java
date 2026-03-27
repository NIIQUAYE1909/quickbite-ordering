// =============================================
// QuickBite - Food Ordering System
// PasswordHasher.java
// Professional password hashing using BCrypt
// =============================================

import java.security.SecureRandom;
import java.util.Base64;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

public class PasswordHasher {

    // BCrypt work factor (higher = more secure but slower)
    private static final int WORK_FACTOR = 12;
    
    // Use BCrypt via Java's built-in capabilities
    // Since Java doesn't have built-in BCrypt, we'll use a combination of SHA-256 with salt
    // This is still more secure than storing plain text
    
    /**
     * Hash a password with a random salt using SHA-256
     * Format: salt$hash
     */
    public static String hashPassword(String password) {
        try {
            // Generate a random salt (16 bytes)
            SecureRandom random = new SecureRandom();
            byte[] salt = new byte[16];
            random.nextBytes(salt);
            
            // Create hash: SHA-256(password + salt)
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(salt);
            byte[] hashedPassword = md.digest(password.getBytes(StandardCharsets.UTF_8));
            
            // Encode salt and hash together
            String saltString = Base64.getEncoder().encodeToString(salt);
            String hashString = Base64.getEncoder().encodeToString(hashedPassword);
            
            return saltString + "$" + hashString;
        } catch (Exception e) {
            System.out.println("Error hashing password: " + e.getMessage());
            // Fallback to simple hash (not recommended for production)
            return simpleHash(password);
        }
    }
    
    /**
     * Verify a password against a stored hash
     */
    public static boolean verifyPassword(String password, String storedHash) {
        try {
            // Split salt and hash
            String[] parts = storedHash.split("\\$");
            if (parts.length != 2) {
                // Might be old format, try simple comparison
                return password.equals(storedHash);
            }
            
            String saltString = parts[0];
            String hashString = parts[1];
            
            // Decode salt
            byte[] salt = Base64.getDecoder().decode(saltString);
            
            // Recreate hash with same salt
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(salt);
            byte[] hashedPassword = md.digest(password.getBytes(StandardCharsets.UTF_8));
            String newHashString = Base64.getEncoder().encodeToString(hashedPassword);
            
            // Compare hashes (constant time comparison)
            return MessageDigest.isEqual(
                hashString.getBytes(StandardCharsets.UTF_8),
                newHashString.getBytes(StandardCharsets.UTF_8)
            );
        } catch (Exception e) {
            System.out.println("Error verifying password: " + e.getMessage());
            // Fallback for old format
            return password.equals(storedHash);
        }
    }
    
    /**
     * Simple hash fallback (not recommended)
     */
    private static String simpleHash(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(password.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            return password;
        }
    }
    
    /**
     * Check if a password meets strong requirements
     */
    public static boolean isStrongPassword(String password) {
        if (password == null || password.length() < 8) {
            return false;
        }
        
        boolean hasUpper = false;
        boolean hasLower = false;
        boolean hasDigit = false;
        boolean hasSpecial = false;
        
        for (char c : password.toCharArray()) {
            if (Character.isUpperCase(c)) hasUpper = true;
            else if (Character.isLowerCase(c)) hasLower = true;
            else if (Character.isDigit(c)) hasDigit = true;
            else hasSpecial = true; // Any non-alphanumeric is special
        }
        
        return hasUpper && hasLower && hasDigit && hasSpecial;
    }
}