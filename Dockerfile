# ==============================================================================
# Multi-stage Dockerfile for M/S KISSAN Pesticides & Seed Store Application
# Java 21 + Spring Boot 3 + Embedded Web UI & Persistent H2 Database
# Optimized for Cloud Deployment (Render / Railway / Docker)
# ==============================================================================

# Build Stage
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and resources
COPY src ./src
COPY *.html *.js *.css ./src/main/resources/static/
COPY assets ./src/main/resources/static/assets/

# Package the application jar
RUN mvn clean package -DskipTests -B

# Runtime Stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create writable data directory for H2 persistent database
RUN mkdir -p /app/data && chmod -R 777 /app/data

# Copy executable jar from build stage
COPY --from=build /app/target/kissan-pesticides-seed-store-1.0.0.jar app.jar

# Expose default port
EXPOSE 8080

# Memory optimized for 512MB free tier containers
ENV PORT=8080 \
    JAVA_OPTS="-Xms128m -Xmx384m -XX:+UseG1GC -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -Dserver.port=${PORT:-8080} -jar app.jar"]
