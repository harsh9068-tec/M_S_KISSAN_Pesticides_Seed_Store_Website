@echo off
title M/S KISSAN Pesticides and Seed Store - Java Server
color 0A
echo ============================================================================
echo   M/S KISSAN PESTICIDES AND SEED STORE - JAVA FULL STACK APPLICATION
echo ============================================================================
echo Starting Spring Boot Server on http://localhost:8080 ...
echo.

java -jar target\kissan-pesticides-seed-store-1.0.0.jar

if errorlevel 1 (
    echo.
    echo Rebuilding application with Maven...
    call mvn clean package -DskipTests
    java -jar target\kissan-pesticides-seed-store-1.0.0.jar
)

pause
