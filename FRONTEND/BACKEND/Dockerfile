# =============================================
# QuickBite - Docker Configuration for Render
# =============================================

# Build stage
FROM eclipse-temurin:17-jdk-jammy AS builder
WORKDIR /app

# Copy source files and dependencies
COPY src /app/src
COPY lib /app/lib

# Create output directory
RUN mkdir -p out

# Compile the Java application
RUN javac -cp "src:lib/mysql-connector-j-9.6.0.jar" -d out src/*.java

# =============================================
# Run stage - minimal runtime
# =============================================
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy compiled classes from builder
COPY --from=builder /app/out /app/out

# Copy MySQL connector
COPY lib /app/lib

# Expose the port (Render will override PORT env var)
EXPOSE 8080

# Run the backend
# Using out/ directory for compiled classes
CMD ["java", "-cp", "out:lib/mysql-connector-j-9.6.0.jar", "Main"]
