# ==============================================================================
# Multi-stage Production Dockerfile for Spring Boot 3.2 (Java 17)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build the Application
# ------------------------------------------------------------------------------
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder

WORKDIR /build

# Copy pom.xml first to leverage Docker layer caching for dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and compile production JAR
COPY src ./src
RUN mvn clean package -DskipTests

# ------------------------------------------------------------------------------
# Stage 2: Lightweight Production Runtime
# ------------------------------------------------------------------------------
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Create a non-root system user and group for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Prepare persistent uploads directory
RUN mkdir -p /app/uploads/resumes && chown -R appuser:appgroup /app

# Copy the generated Spring Boot executable JAR from the builder stage
COPY --from=builder --chown=appuser:appgroup /build/target/*.jar app.jar

# Switch to non-root user
USER appuser

# Default port documentation (Render overrides this dynamically via $PORT)
EXPOSE 8080

# Production JVM tuning for container environments
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

# Launch Spring Boot (picks up Render's $PORT automatically via application.yml)
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
