package com.kissan.store.service;

import com.kissan.store.model.Farmer;
import com.kissan.store.model.KhataTransaction;
import com.kissan.store.model.Product;
import com.kissan.store.repository.FarmerRepository;
import com.kissan.store.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private FarmerRepository farmerRepository;

    @Override
    public void run(String... args) {
        seedProducts();
        seedFarmers();
    }

    private void seedProducts() {
        if (productRepository.count() > 0) return;

        List<Product> products = new ArrayList<>();

        // Syngenta
        products.add(new Product("syn_01", "Incipio Insecticide", "Syngenta India", "insecticide", "Sugarcane, Paddy, Cotton", "Early Shoot Borer, Stem Borer", "60 ml / acre", "60ml, 100ml, 250ml", 850.0, "🛡️", null, true, true));
        products.add(new Product("syn_02", "Isabion Bio-Stimulant", "Syngenta India", "bio", "Sugarcane, Wheat, Vegetables", "Vigorous vegetative growth & tillering", "2 ml / Litre water", "250ml, 500ml, 1L", 1000.0, "🌿", null, true, true));
        products.add(new Product("syn_03", "Amistar Top Fungicide", "Syngenta India", "fungicide", "Tomato, Chilli, Paddy", "Blast, Sheath Blight, Powdery Mildew", "1 ml / Litre water", "100ml, 200ml, 500ml", 1250.0, "🔬", null, true, true));

        // DuPont / Corteva
        products.add(new Product("dup_01", "Coragen Insecticide", "DuPont / Corteva", "insecticide", "Sugarcane, Paddy, Vegetables", "Top Borer, Root Borer, Fruit Borer", "60 ml / acre", "30ml, 60ml, 150ml", 950.0, "🛡️", null, true, true));
        products.add(new Product("dup_02", "Kocide 3000 Fungicide", "DuPont / Corteva", "fungicide", "Paddy, Citrus, Vegetables", "Bacterial Leaf Blight, Canker, Die Back", "2 gm / Litre water", "250g, 500g, 1kg", 780.0, "🔬", null, true, true));

        // Coromandel Gromor
        products.add(new Product("cor_01", "Gromor 10:26:26 NPK Fertilizer", "Coromandel International", "fertilizer", "Sugarcane, Wheat, Potato", "Balanced Root & Stalk Nutrition", "50 kg / acre", "50 kg Bag", 1470.0, "🌱", null, true, true));
        products.add(new Product("cor_02", "Benfil Fungicide (Carbendazim 50% WP)", "Coromandel Agrico", "fungicide", "Sugarcane, Wheat, Vegetables", "Red Rot, Smut, Seed-borne diseases", "2 gm / Litre water", "100g, 250g, 500g", 450.0, "🔬", null, true, true));

        // Agrico Organics
        products.add(new Product("agr_01", "Agrico Humic King (12% Humic)", "Agrico Organics Limited", "bio", "Sugarcane, Wheat, Mustard", "Soil Conditioning & White Root Development", "1 Litre / acre", "500ml, 1L, 5L", 550.0, "🧪", null, true, true));
        products.add(new Product("agr_02", "Agrico Super Zinc (12% Chelated)", "Agrico Organics Limited", "fertilizer", "Paddy, Wheat, Sugarcane", "Khaira Disease Prevention", "1 gm / Litre water", "250g, 500g, 1kg", 380.0, "🌱", null, true, true));

        // Triveni Fertilizers
        products.add(new Product("tri_01", "Triveni Shaktiman Zinc Sulphate (33%)", "Triveni Fertilizers", "fertilizer", "Sugarcane, Wheat, Mustard", "Zinc & Sulphur Deficiency Correction", "5 kg / acre (Basal)", "5 kg, 10 kg, 25 kg", 480.0, "🌱", null, true, true));

        // Safex Chemicals
        products.add(new Product("saf_01", "Safex Safe-Mida (Imidacloprid 17.8% SL)", "Safex Chemicals", "insecticide", "Sugarcane, Cotton, Chilli", "Aphids, Jassids, Whitefly, Termites", "0.5 ml / Litre water", "100ml, 250ml, 500ml, 1L", 420.0, "🛡️", null, true, true));

        // Samradhi Crop Chemicals
        products.add(new Product("sam_01", "Samradhi Sam-Thio (Thiamethoxam 25% WG)", "Samradhi Crop Chemicals", "insecticide", "Sugarcane, Paddy, Mustard", "Stem Borer, Leaf Hopper, Aphid", "80 gm / acre in 200L water", "100g, 250g, 500g", 490.0, "🛡️", null, true, true));

        // Seeds
        products.add(new Product("seed_01", "Certified Hybrid Wheat Seeds (Super 303)", "KISSAN Certified Seed", "seed", "Wheat", "High Tillering & Rust Resistance", "40 kg / acre", "40 kg Bag", 1600.0, "🌾", null, true, true));

        productRepository.saveAll(products);
    }

    private void seedFarmers() {
        if (farmerRepository.count() > 0) return;

        Farmer f1 = new Farmer("KIS-1001", "Chaudhary Ramesh Kumar", "9897123456", "1122", "1122", "Village Behra Sadat", "15 Bigha", "Sugarcane, Wheat, Mustard", "2025-11-10", "Regular customer for sugarcane borer spray.");
        KhataTransaction tx1 = new KhataTransaction("tx_101", "2026-08-15", "purchase", "Incipio (100ml) + Isabion (500ml)", "2 Packs", 1850.0, 1850.0, 0.0, "Sugarcane early shoot borer spray", f1);
        f1.getKhata().add(tx1);

        Farmer f2 = new Farmer("KIS-1002", "Sardar Gurpreet Singh", "9760987654", "3344", "3344", "Post Morna, Jansath", "25 Bigha", "Wheat, Paddy, Sugarcane", "2026-01-15", "Certified wheat seed advance booking.");
        KhataTransaction tx2 = new KhataTransaction("tx_102", "2026-08-18", "purchase", "Hybrid Wheat Seeds (Super 303 - 40kg)", "3 Bags", 4800.0, 4800.0, 0.0, "Advance booking for Rabi season", f2);
        f2.getKhata().add(tx2);

        Farmer f3 = new Farmer("KIS-1003", "Virendra Singh Tyagi", "9837554433", "5566", "5566", "Behra Sadat", "10 Bigha", "Sugarcane, Tomato, Chilli", "2026-03-20", "Tomato fruit rot & sugarcane fertilizer.");
        KhataTransaction tx3 = new KhataTransaction("tx_103", "2026-08-20", "purchase", "Kavach Flo (500ml) + Simodis (100ml)", "2 Packs", 2100.0, 2100.0, 0.0, "Tomato early/late blight spray", f3);
        f3.getKhata().add(tx3);

        farmerRepository.saveAll(List.of(f1, f2, f3));
    }
}
