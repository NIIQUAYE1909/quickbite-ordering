// =============================================
// QuickBite - Food Ordering System
// EmailService.java
// Sends email notifications using Java's built-in javax.mail (JavaMail)
// Uses Gmail SMTP with App Password (no extra library needed beyond mail.jar)
// =============================================

import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;

public class EmailService {

    private static final String DEFAULT_FROM_EMAIL = "quayen010@gmail.com";
    private static final String PLACEHOLDER_PASSWORD = "YOUR_GMAIL_APP_PASSWORD_HERE";

    private static String fromEmail = DEFAULT_FROM_EMAIL;
    private static String fromPassword = PLACEHOLDER_PASSWORD;
    private static boolean configured = false;

    static {
        Properties props = loadConfig();
        fromEmail = firstNonEmpty(
            System.getenv("EMAIL_FROM"),
            System.getProperty("email.from"),
            props.getProperty("email.from"),
            DEFAULT_FROM_EMAIL
        );
        fromPassword = firstNonEmpty(
            System.getenv("EMAIL_PASSWORD"),
            System.getProperty("email.password"),
            props.getProperty("email.password"),
            PLACEHOLDER_PASSWORD
        );
        configured = fromEmail != null
            && !fromEmail.isEmpty()
            && fromPassword != null
            && !fromPassword.isEmpty()
            && !PLACEHOLDER_PASSWORD.equals(fromPassword);

        if (configured) {
            System.out.println("Email service ready. Sending from: " + fromEmail);
        } else {
            System.out.println("Email not configured. Set EMAIL_FROM and EMAIL_PASSWORD to enable notifications.");
        }
    }

    public static void sendDeliveryConfirmation(String toEmail, String customerName,
                                                 int orderId, double total,
                                                 String driverName, String address) {
        if (!configured || toEmail == null || toEmail.isEmpty()) {
            System.out.println("Email skipped (not configured or no customer email for Order #" + orderId + ")");
            return;
        }

        String subject = "Your QuickBite Order #" + orderId + " Has Been Delivered!";
        String body = buildDeliveryEmailBody(customerName, orderId, total, driverName, address);

        sendEmail(toEmail, subject, body);
    }

    public static void sendDriverAssignedEmail(String toEmail, String customerName,
                                                int orderId, String driverName,
                                                String driverPhone, String address) {
        if (!configured || toEmail == null || toEmail.isEmpty()) {
            System.out.println("Driver-assigned email skipped (not configured or no customer email for Order #" + orderId + ")");
            return;
        }

        String subject = "Your QuickBite Order #" + orderId + " Is On Its Way!";
        String body = buildDriverAssignedEmailBody(customerName, orderId, driverName, driverPhone, address);

        sendEmail(toEmail, subject, body);
    }

    public static void sendComplaintAlert(String adminEmail, String customerName,
                                           String customerEmail, int complaintId,
                                           int orderId, int foodId, String foodName,
                                           String itemCode, String message) {
        String toEmail = firstNonEmpty(
            adminEmail,
            System.getenv("ADMIN_EMAIL"),
            System.getProperty("admin.email"),
            fromEmail
        );

        if (!configured || toEmail == null || toEmail.isEmpty()) {
            System.out.println("Complaint alert email skipped (not configured or no admin email for Complaint #" + complaintId + ")");
            return;
        }

        String subject = "New QuickBite Complaint #" + complaintId + " for " + foodName;
        String body = buildComplaintAlertEmailBody(customerName, customerEmail, complaintId, orderId, foodId, foodName, itemCode, message);
        sendEmail(toEmail, subject, body);
    }

    private static void sendEmail(String toEmail, String subject, String htmlBody) {
        try {
            Class<?> sessionClass = Class.forName("javax.mail.Session");
            Class<?> messageClass = Class.forName("javax.mail.internet.MimeMessage");
            Class<?> transportClass = Class.forName("javax.mail.Transport");
            Class<?> recipientType = Class.forName("javax.mail.Message$RecipientType");
            Class<?> internetAddress = Class.forName("javax.mail.internet.InternetAddress");

            Properties mailProps = new Properties();
            mailProps.put("mail.smtp.auth", "true");
            mailProps.put("mail.smtp.starttls.enable", "true");
            mailProps.put("mail.smtp.host", "smtp.gmail.com");
            mailProps.put("mail.smtp.port", "587");
            mailProps.put("mail.smtp.ssl.trust", "smtp.gmail.com");

            final String user = fromEmail;
            final String pass = fromPassword;

            Object authenticator = java.lang.reflect.Proxy.newProxyInstance(
                EmailService.class.getClassLoader(),
                new Class[]{ Class.forName("javax.mail.Authenticator") },
                (proxy, method, args) -> {
                    if (method.getName().equals("getPasswordAuthentication")) {
                        return Class.forName("javax.mail.PasswordAuthentication")
                                    .getConstructor(String.class, String.class)
                                    .newInstance(user, pass);
                    }
                    return null;
                }
            );

            Object session = sessionClass.getMethod("getInstance", Properties.class,
                    Class.forName("javax.mail.Authenticator")).invoke(null, mailProps, authenticator);

            Object message = messageClass.getConstructor(sessionClass).newInstance(session);

            Object fromAddr = internetAddress.getConstructor(String.class).newInstance(fromEmail);
            messageClass.getMethod("setFrom", Class.forName("javax.mail.Address")).invoke(message, fromAddr);

            Object toAddr = internetAddress.getConstructor(String.class).newInstance(toEmail);
            Object toType = recipientType.getField("TO").get(null);
            messageClass.getMethod("setRecipient",
                    Class.forName("javax.mail.Message$RecipientType"),
                    Class.forName("javax.mail.Address")).invoke(message, toType, toAddr);

            messageClass.getMethod("setSubject", String.class).invoke(message, subject);
            messageClass.getMethod("setContent", Object.class, String.class)
                        .invoke(message, htmlBody, "text/html; charset=utf-8");

            transportClass.getMethod("send", Class.forName("javax.mail.Message"))
                          .invoke(null, message);

            System.out.println("Email sent to: " + toEmail + " | Subject: " + subject);

        } catch (ClassNotFoundException e) {
            System.out.println("JavaMail not found. Add mail.jar to enable emails.");
            System.out.println("Email that would have been sent to: " + toEmail);
            System.out.println("Subject: " + subject);
        } catch (Exception e) {
            System.out.println("Failed to send email to " + toEmail + ": " + e.getMessage());
        }
    }

    private static String buildDeliveryEmailBody(String customerName, int orderId,
                                                   double total, String driverName, String address) {
        return "<!DOCTYPE html><html><head><meta charset='UTF-8'/></head><body style='font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px;'>"
            + "<div style='max-width:600px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);'>"
            + "<div style='background:linear-gradient(135deg,#ff6b35,#f7c59f);padding:30px;text-align:center;'>"
            + "<h1 style='color:white;margin:0;font-size:2rem;'>Delivered!</h1>"
            + "<p style='color:rgba(255,255,255,0.9);margin:8px 0 0;'>Your QuickBite order has arrived!</p>"
            + "</div>"
            + "<div style='padding:30px;'>"
            + "<p style='font-size:1.1rem;color:#333;'>Hi <strong>" + escapeHtml(customerName) + "</strong>,</p>"
            + "<p style='color:#555;'>Great news! Your order has been successfully delivered. We hope you enjoy your meal!</p>"
            + "<div style='background:#f9f9f9;border-radius:12px;padding:20px;margin:20px 0;border-left:4px solid #ff6b35;'>"
            + "<h3 style='margin:0 0 12px;color:#333;'>Order Summary</h3>"
            + "<table style='width:100%;border-collapse:collapse;'>"
            + "<tr><td style='padding:6px 0;color:#666;'>Order ID</td><td style='padding:6px 0;font-weight:bold;color:#333;'>#" + orderId + "</td></tr>"
            + "<tr><td style='padding:6px 0;color:#666;'>Total Paid</td><td style='padding:6px 0;font-weight:bold;color:#ff6b35;'>GHs " + String.format("%.2f", total) + "</td></tr>"
            + "<tr><td style='padding:6px 0;color:#666;'>Delivered To</td><td style='padding:6px 0;font-weight:bold;color:#333;'>" + escapeHtml(address) + "</td></tr>"
            + (driverName != null && !driverName.isEmpty() ? "<tr><td style='padding:6px 0;color:#666;'>Driver</td><td style='padding:6px 0;font-weight:bold;color:#333;'>" + escapeHtml(driverName) + "</td></tr>" : "")
            + "</table>"
            + "</div>"
            + "<p style='color:#555;'>Thank you for choosing <strong>QuickBite</strong>.</p>"
            + "</div></div></body></html>";
    }

    private static String buildDriverAssignedEmailBody(String customerName, int orderId,
                                                        String driverName, String driverPhone, String address) {
        return "<!DOCTYPE html><html><head><meta charset='UTF-8'/></head><body style='font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px;'>"
            + "<div style='max-width:600px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);'>"
            + "<div style='background:linear-gradient(135deg,#1a73e8,#4fc3f7);padding:30px;text-align:center;'>"
            + "<h1 style='color:white;margin:0;font-size:2rem;'>On Its Way!</h1>"
            + "<p style='color:rgba(255,255,255,0.9);margin:8px 0 0;'>Your driver is heading to you now</p>"
            + "</div>"
            + "<div style='padding:30px;'>"
            + "<p style='font-size:1.1rem;color:#333;'>Hi <strong>" + escapeHtml(customerName) + "</strong>,</p>"
            + "<p style='color:#555;'>Your QuickBite order <strong>#" + orderId + "</strong> has been picked up and is on its way to you!</p>"
            + "<div style='background:#e8f4fd;border-radius:12px;padding:20px;margin:20px 0;border-left:4px solid #1a73e8;'>"
            + "<h3 style='margin:0 0 12px;color:#333;'>Your Driver</h3>"
            + "<table style='width:100%;border-collapse:collapse;'>"
            + "<tr><td style='padding:6px 0;color:#666;'>Driver Name</td><td style='padding:6px 0;font-weight:bold;color:#333;'>" + escapeHtml(driverName) + "</td></tr>"
            + "<tr><td style='padding:6px 0;color:#666;'>Driver Phone</td><td style='padding:6px 0;font-weight:bold;color:#1a73e8;'>" + escapeHtml(driverPhone) + "</td></tr>"
            + "<tr><td style='padding:6px 0;color:#666;'>Delivering To</td><td style='padding:6px 0;font-weight:bold;color:#333;'>" + escapeHtml(address) + "</td></tr>"
            + "</table>"
            + "</div>"
            + "<p style='color:#555;'>You can track your order in real time on the QuickBite website.</p>"
            + "</div></div></body></html>";
    }

    private static String buildComplaintAlertEmailBody(String customerName, String customerEmail,
                                                        int complaintId, int orderId, int foodId,
                                                        String foodName, String itemCode, String message) {
        return "<!DOCTYPE html><html><head><meta charset='UTF-8'/></head><body style='font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px;'>"
            + "<div style='max-width:680px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);'>"
            + "<div style='background:linear-gradient(135deg,#dc2626,#f97316);padding:30px;text-align:center;'>"
            + "<h1 style='color:white;margin:0;font-size:2rem;'>New Customer Concern</h1>"
            + "<p style='color:rgba(255,255,255,0.92);margin:8px 0 0;'>A customer just submitted a complaint.</p>"
            + "</div>"
            + "<div style='padding:30px;'>"
            + "<div style='background:#fff7ed;border-radius:12px;padding:20px;margin:0 0 20px;border-left:4px solid #ea580c;'>"
            + "<h3 style='margin:0 0 12px;color:#333;'>Complaint Details</h3>"
            + "<table style='width:100%;border-collapse:collapse;'>"
            + "<tr><td style='padding:6px 0;color:#666;'>Complaint ID</td><td style='padding:6px 0;font-weight:bold;color:#111827;'>#" + complaintId + "</td></tr>"
            + "<tr><td style='padding:6px 0;color:#666;'>Order ID</td><td style='padding:6px 0;font-weight:bold;color:#111827;'>#" + orderId + "</td></tr>"
            + "<tr><td style='padding:6px 0;color:#666;'>Food ID</td><td style='padding:6px 0;font-weight:bold;color:#111827;'>" + foodId + "</td></tr>"
            + "<tr><td style='padding:6px 0;color:#666;'>Food Item</td><td style='padding:6px 0;font-weight:bold;color:#111827;'>" + escapeHtml(foodName) + "</td></tr>"
            + "<tr><td style='padding:6px 0;color:#666;'>Reference Code</td><td style='padding:6px 0;font-weight:bold;color:#dc2626;'>" + escapeHtml(itemCode) + "</td></tr>"
            + "<tr><td style='padding:6px 0;color:#666;'>Customer</td><td style='padding:6px 0;font-weight:bold;color:#111827;'>" + escapeHtml(customerName) + "</td></tr>"
            + "<tr><td style='padding:6px 0;color:#666;'>Customer Email</td><td style='padding:6px 0;font-weight:bold;color:#111827;'>" + escapeHtml(customerEmail) + "</td></tr>"
            + "</table>"
            + "</div>"
            + "<div style='background:#f9fafb;border-radius:12px;padding:20px;border:1px solid #e5e7eb;'>"
            + "<h3 style='margin:0 0 10px;color:#333;'>Customer Message</h3>"
            + "<p style='margin:0;color:#374151;line-height:1.65;white-space:pre-wrap;'>" + escapeHtml(message) + "</p>"
            + "</div>"
            + "<p style='color:#555;margin-top:20px;'>You can review and manage this complaint from the QuickBite admin panel.</p>"
            + "</div></div></body></html>";
    }

    private static String escapeHtml(String value) {
        if (value == null) return "";
        return value.replace("&", "&amp;")
                    .replace("<", "&lt;")
                    .replace(">", "&gt;")
                    .replace("\"", "&quot;");
    }

    private static String firstNonEmpty(String... values) {
        for (String value : values) {
            if (value != null && !value.trim().isEmpty()) {
                return value.trim();
            }
        }
        return null;
    }

    private static Properties loadConfig() {
        Properties props = new Properties();
        try (FileInputStream fis = new FileInputStream("config.properties")) {
            props.load(fis);
        } catch (IOException ignored) {
            // Production deploys rely on environment variables.
        }
        return props;
    }
}
