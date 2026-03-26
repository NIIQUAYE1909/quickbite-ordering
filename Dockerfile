# QuickBite - Single Stage Docker for Fly.io
FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app

# Copy source files and dependencies
COPY FRONTEND/BACKEND/src /app/src
COPY FRONTEND/BACKEND/lib /app/lib

# Create output directory and compile
RUN mkdir -p out && \
    javac -cp "src:lib/mysql-connector-j-9.6.0.jar" -d out src/*.java

# Expose port
EXPOSE 8080

# Run the backend
CMD ["java", "-cp", "out:lib/mysql-connector-j-9.6.0.jar", "Main"]
