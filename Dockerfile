# ==============================================================================
# Multi-stage Dockerfile for M/S KISSAN Pesticides & Seed Store Application
# Java 21 + Spring Boot 3 + Embedded Web UI & H2 Database
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

# Set non-root user for security
RUN addgroup -S kissangroup && adduser -S kissanuser -G kissangroup

# Copy executable jar from build stage
COPY --from=build /app/target/kissan-pesticides-seed-store-1.0.0.jar app.jar

# Expose default Spring Boot application port
EXPOSE 8080

# Environment variables
ENV PORT=8080 \
    JAVA_OPTS="-Xms256m -Xmx512m"

USER kissanuser

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT} -jar app.jar"]
