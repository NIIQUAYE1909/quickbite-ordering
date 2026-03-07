// =============================================
// QuickBite - Food Ordering System
// EmailService.java
// Sends email notifications using Java's built-in javax.mail (JavaMail)
// Uses Gmail SMTP with App Password (no extra library needed beyond mail.jar)
//
// HOW TO SET UP:
//   1. Go to your Gmail account → Security → 2-Step Verification → App Passwords
//   2. Create an App Password for "Mail" on "Windows Computer"
//   3. Put that 16-char password in config.properties as: email.password=xxxx xxxx xxxx xxxx
//   4. Set email.from=your-gmail@gmail.com in config.properties
//
// NOTE: If you don't have JavaMail, the email will be skipped gracefully
//       and the order will still be marked Delivered.
// =============================================

import java.util.Properties;

public class EmailService {

    // =============================================
    // YOUR EMAIL CREDENTIALS — hardcoded here
    // =============================================
    // Gmail address that sends the notifications
    private static final String FROM_EMAIL = "quayen010@gmail.com";

    // Gmail App Password (NOT your regular password!)
    // How to get one:
    //   1. Go to https://myaccount.google.com/security
    //   2. Enable 2-Step Verification
    //   3. Go to App Passwords → create one for "Mail"
    //   4. Paste the 16-character code below (no spaces)
    private static final String FROM_PASSWORD = "YOUR_GMAIL_APP_PASSWORD_HERE";
    // Example: private static final String FROM_PASSWORD = "abcdabcdabcdabcd";

    private static String fromEmail    = FROM_EMAIL;
    private static String fromPassword = FROM_PASSWORD;
    private static boolean configured  = !FROM_PASSWORD.equals("YOUR_GMAIL_APP_PASSWORD_HERE")
                                          && !FROM_EMAIL.isEmpty();

    static {
        if (configured) {
            System.out.println("✉️  Email service ready — sending from: " + FROM_EMAIL);
        } else {
            System.out.println("⚠️  Email not configured. Open EmailService.java and set FROM_PASSWORD.");
        }
    }

    /**
     * Send a delivery confirmation email to the customer.
     * Called when order status is set to "Delivered".
     */
    public static void sendDeliveryConfirmation(String toEmail, String customerName,
                                                 int orderId, double total,
                                                 String driverName, String address) {
        if (!configured || toEmail == null || toEmail.isEmpty()) {
            System.out.println("📧 Email skipped (not configured or no customer email for Order #" + orderId + ")");
            return;
        }

        String subject = "✅ Your QuickBite Order #" + orderId + " Has Been Delivered!";
        String body    = buildDeliveryEmailBody(customerName, orderId, total, driverName, address);

        sendEmail(toEmail, subject, body);
    }

    /**
     * Send a tracking notification email when a driver is assigned.
     */
    public static void sendDriverAssignedEmail(String toEmail, String customerName,
                                                int orderId, String driverName,
                                                String driverPhone, String address) {
        if (!configured || toEmail == null || toEmail.isEmpty()) {
            System.out.println("📧 Driver-assigned email skipped (not configured or no customer email for Order #" + orderId + ")");
            return;
        }

        String subject = "🚗 Your QuickBite Order #" + orderId + " Is On Its Way!";
        String body    = buildDriverAssignedEmailBody(customerName, orderId, driverName, driverPhone, address);

        sendEmail(toEmail, subject, body);
    }

    // ---- CORE SEND METHOD ----
    private static void sendEmail(String toEmail, String subject, String htmlBody) {
        // Use reflection to call JavaMail so the app doesn't crash if mail.jar is missing
        try {
            Class<?> sessionClass    = Class.forName("javax.mail.Session");
            Class<?> messageClass    = Class.forName("javax.mail.internet.MimeMessage");
            Class<?> transportClass  = Class.forName("javax.mail.Transport");
            Class<?> recipientType   = Class.forName("javax.mail.Message$RecipientType");
            Class<?> internetAddress = Class.forName("javax.mail.internet.InternetAddress");

            Properties mailProps = new Properties();
            mailProps.put("mail.smtp.auth",            "true");
            mailProps.put("mail.smtp.starttls.enable", "true");
            mailProps.put("mail.smtp.host",            "smtp.gmail.com");
            mailProps.put("mail.smtp.port",            "587");
            mailProps.put("mail.smtp.ssl.trust",       "smtp.gmail.com");

            // Create authenticator via anonymous class
            final String user = fromEmail;
            final String pass = fromPassword;

            // Build session with authenticator
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

            // Set From
            Object fromAddr = internetAddress.getConstructor(String.class).newInstance(fromEmail);
            messageClass.getMethod("setFrom", Class.forName("javax.mail.Address")).invoke(message, fromAddr);

            // Set To
            Object toAddr = internetAddress.getConstructor(String.class).newInstance(toEmail);
            Object toType = recipientType.getField("TO").get(null);
            messageClass.getMethod("setRecipient",
                    Class.forName("javax.mail.Message$RecipientType"),
                    Class.forName("javax.mail.Address")).invoke(message, toType, toAddr);

            // Set Subject
            messageClass.getMethod("setSubject", String.class).invoke(message, subject);

            // Set HTML content
            messageClass.getMethod("setContent", Object.class, String.class)
                        .invoke(message, htmlBody, "text/html; charset=utf-8");

            // Send
            transportClass.getMethod("send", Class.forName("javax.mail.Message"))
                          .invoke(null, message);

            System.out.println("✅ Email sent to: " + toEmail + " | Subject: " + subject);

        } catch (ClassNotFoundException e) {
            // JavaMail not available — print instructions
            System.out.println("📧 JavaMail not found. To enable emails:");
            System.out.println("   1. Download mail.jar from https://javaee.github.io/javamail/");
            System.out.println("   2. Place it in FRONTEND/BACKEND/lib/");
            System.out.println("   3. Add it to your compile/run classpath");
            System.out.println("   Email that would have been sent to: " + toEmail);
            System.out.println("   Subject: " + subject);
        } catch (Exception e) {
            System.out.println("❌ Failed to send email to " + toEmail + ": " + e.getMessage());
        }
    }

    // ---- EMAIL TEMPLATES ----
    private static String buildDeliveryEmailBody(String customerName, int orderId,
                                                   double total, String driverName, String address) {
        return "<!DOCTYPE html><html><head><meta charset='UTF-8'/></head><body style='font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px;'>"
            + "<div style='max-width:600px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);'>"
            + "<div style='background:linear-gradient(135deg,#ff6b35,#f7c59f);padding:30px;text-align:center;'>"
            + "<h1 style='color:white;margin:0;font-size:2rem;'>🎉 Delivered!</h1>"
            + "<p style='color:rgba(255,255,255,0.9);margin:8px 0 0;'>Your QuickBite order has arrived!</p>"
            + "</div>"
            + "<div style='padding:30px;'>"
            + "<p style='font-size:1.1rem;color:#333;'>Hi <strong>" + escapeHtml(customerName) + "</strong>,</p>"
            + "<p style='color:#555;'>Great news! Your order has been successfully delivered. We hope you enjoy your meal! 🍽️</p>"
            + "<div style='background:#f9f9f9;border-radius:12px;padding:20px;margin:20px 0;border-left:4px solid #ff6b35;'>"
            + "<h3 style='margin:0 0 12px;color:#333;'>📦 Order Summary</h3>"
            + "<table style='width:100%;border-collapse:collapse;'>"
            + "<tr><td style='padding:6px 0;color:#666;'>Order ID</td><td style='padding:6px 0;font-weight:bold;color:#333;'>#" + orderId + "</td></tr>"
            + "<tr><td style='padding:6px 0;color:#666;'>Total Paid</td><td style='padding:6px 0;font-weight:bold;color:#ff6b35;'>GH₵ " + String.format("%.2f", total) + "</td></tr>"
            + "<tr><td style='padding:6px 0;color:#666;'>Delivered To</td><td style='padding:6px 0;font-weight:bold;color:#333;'>" + escapeHtml(address) + "</td></tr>"
            + (driverName != null && !driverName.isEmpty() ? "<tr><td style='padding:6px 0;color:#666;'>Driver</td><td style='padding:6px 0;font-weight:bold;color:#333;'>🚗 " + escapeHtml(driverName) + "</td></tr>" : "")
            + "</table>"
            + "</div>"
            + "<p style='color:#555;'>Thank you for choosing <strong>QuickBite</strong>! We'd love to hear your feedback.</p>"
            + "<div style='text-align:center;margin:24px 0;'>"
            + "<a href='#' style='background:linear-gradient(135deg,#ff6b35,#f7c59f);color:white;padding:12px 28px;border-radius:25px;text-decoration:none;font-weight:bold;font-size:1rem;'>⭐ Rate Your Order</a>"
            + "</div>"
            + "<hr style='border:none;border-top:1px solid #eee;margin:20px 0;'/>"
            + "<p style='color:#999;font-size:0.8rem;text-align:center;'>QuickBite · Sekondi-Takoradi, Western Region, Ghana 🇬🇭<br/>📞 +233 50 95 11 074 · ✉️ quayen010@gmail.com</p>"
            + "</div></div></body></html>";
    }

    private static String buildDriverAssignedEmailBody(String customerName, int orderId,
                                                        String driverName, String driverPhone, String address) {
        return "<!DOCTYPE html><html><head><meta charset='UTF-8'/></head><body style='font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px;'>"
            + "<div style='max-width:600px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);'>"
            + "<div style='background:linear-gradient(135deg,#1a73e8,#4fc3f7);padding:30px;text-align:center;'>"
            + "<h1 style='color:white;margin:0;font-size:2rem;'>🚗 On Its Way!</h1>"
            + "<p style='color:rgba(255,255,255,0.9);margin:8px 0 0;'>Your driver is heading to you now</p>"
            + "</div>"
            + "<div style='padding:30px;'>"
            + "<p style='font-size:1.1rem;color:#333;'>Hi <strong>" + escapeHtml(customerName) + "</strong>,</p>"
            + "<p style='color:#555;'>Your QuickBite order <strong>#" + orderId + "</strong> has been picked up and is on its way to you!</p>"
            + "<div style='background:#e8f4fd;border-radius:12px;padding:20px;margin:20px 0;border-left:4px solid #1a73e8;'>"
            + "<h3 style='margin:0 0 12px;color:#333;'>🚗 Your Driver</h3>"
            + "<table style='width:100%;border-collapse:collapse;'>"
            + "<tr><td style='padding:6px 0;color:#666;'>Driver Name</td><td style='padding:6px 0;font-weight:bold;color:#333;'>" + escapeHtml(driverName) + "</td></tr>"
            + "<tr><td style='padding:6px 0;color:#666;'>Driver Phone</td><td style='padding:6px 0;font-weight:bold;color:#1a73e8;'>📱 " + escapeHtml(driverPhone) + "</td></tr>"
            + "<tr><td style='padding:6px 0;color:#666;'>Delivering To</td><td style='padding:6px 0;font-weight:bold;color:#333;'>📍 " + escapeHtml(address) + "</td></tr>"
            + "</table>"
            + "</div>"
            + "<p style='color:#555;'>You can track your order in real-time on the QuickBite website. Call your driver if needed!</p>"
            + "<hr style='border:none;border-top:1px solid #eee;margin:20px 0;'/>"
            + "<p style='color:#999;font-size:0.8rem;text-align:center;'>QuickBite · Sekondi-Takoradi, Western Region, Ghana 🇬🇭<br/>📞 +233 50 95 11 074 · ✉️ quayen010@gmail.com</p>"
            + "</div></div></body></html>";
    }

    private static String escapeHtml(String value) {
        if (value == null) return "";
        return value.replace("&", "&amp;")
                    .replace("<", "&lt;")
                    .replace(">", "&gt;")
                    .replace("\"", "&quot;");
    }
}
