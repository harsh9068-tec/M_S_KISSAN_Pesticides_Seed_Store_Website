package com.kissan.store;

import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class KissanStoreApplication {

    public static void main(String[] args) {
        SpringApplication.run(KissanStoreApplication.class, args);
        System.out.println("============================================================================");
        System.out.println("🌱 M/S KISSAN PESTICIDES & SEED STORE - SPRING BOOT 3 APP STARTED!");
        System.out.println("🌐 Web Application: http://localhost:8080");
        System.out.println("🤖 AI Crop Doctor:  http://localhost:8080/#ai-doctor");
        System.out.println("👨‍🌾 Farmer Portal:   http://localhost:8080/farmer-portal.html");
        System.out.println("⚙️ Admin Dashboard: http://localhost:8080/admin.html");
        System.out.println("🗄️ H2 SQL Database: http://localhost:8080/h2-console");
        System.out.println("============================================================================");
    }
}
