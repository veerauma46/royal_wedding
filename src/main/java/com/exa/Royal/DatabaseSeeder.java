package com.exa.Royal;

import com.exa.Royal.entity.*;
import com.exa.Royal.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WeddingPackageRepository packageRepository;

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private VendorRepository vendorRepository;

    @Override
    public void run(String... args) throws Exception {
        // Seed Users
        if (userRepository.count() == 0) {
            User admin = new User();
            admin.setFullName("Royal Admin");
            admin.setEmail("admin@royal.com");
            admin.setMobileNumber("9876543210");
            admin.setAddress("Palace Headquarters");
            admin.setPassword("admin123");
            admin.setRole("ADMIN");
            userRepository.save(admin);

            User user = new User();
            user.setFullName("Uma Shankar");
            user.setEmail("uma@gmail.com");
            user.setMobileNumber("9876543211");
            user.setAddress("Hyderabad");
            user.setPassword("password");
            user.setBrideName("Mowlika");
            user.setGroomName("Srikanth");
            user.setWeddingDate(LocalDate.now().plusMonths(4));
            user.setWeddingType("Traditional");
            user.setBudget(15000.0);
            user.setRole("USER");
            userRepository.save(user);

            System.out.println("--> Seeded default users: admin@royal.com / admin123 and uma@gmail.com / password");
        }

        // Seed Wedding Packages
        if (packageRepository.count() == 0) {
            WeddingPackage silver = new WeddingPackage();
            silver.setName("Silver Package");
            silver.setPrice(5000.0);
            silver.setDescription("Perfect essential package designed to orchestrate cozy, elegant weddings with basic planners and consultation.");
            silver.setFeatures("Consultation & Timeline, Mandap Setup, Standard Seating, Photography & Albums");
            silver.setImageUrl("https://images.unsplash.com/photo-1519225495810-7517c300ea87?q=80&w=600");
            packageRepository.save(silver);

            WeddingPackage gold = new WeddingPackage();
            gold.setName("Gold Package");
            gold.setPrice(10000.0);
            gold.setDescription("A premium bespoke plan featuring exquisite floral decor, gourmet buffet planning, and drone candid captures.");
            gold.setFeatures("Comprehensive Planning, Premium Floral Mandap, Luxury Draped Seating, Drone Capture, 2-Tier Wedding Cake");
            gold.setImageUrl("https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600");
            packageRepository.save(gold);

            WeddingPackage platinum = new WeddingPackage();
            platinum.setName("Platinum Package");
            platinum.setPrice(15000.0);
            platinum.setDescription("High-end heritage estate setup combining royal ambiance, designer bridal makeup styling, and cinematic captures.");
            platinum.setFeatures("Palace Entry Fees, VIP Catering, Celebrity Makeup trials, Cinematic Film, Luxury Light Displays, 3-Tier Cake");
            platinum.setImageUrl("images/couple.jpg");
            packageRepository.save(platinum);

            WeddingPackage royal = new WeddingPackage();
            royal.setName("Royal Package");
            royal.setPrice(25000.0);
            royal.setDescription("The ultimate fairytale fantasy. VIP concierge coordination, gourmet multiregional banquets, and live orchestra entertainment.");
            royal.setFeatures("All-Inclusive Concierge, Custom Floral Theme, Gourmet Banquets, Live Symphony Orchestra, Premium Box Album");
            royal.setImageUrl("https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=600");
            packageRepository.save(royal);

        }

        // Ensure Platinum Package image is updated if database was already seeded
        packageRepository.findByName("Platinum Package").ifPresent(p -> {
            if (!"images/couple.jpg".equals(p.getImageUrl())) {
                p.setImageUrl("images/couple.jpg");
                packageRepository.save(p);
                System.out.println("--> Updated existing Platinum Package image to couple.jpg");
            }
        });

        // Seed Venues
        if (venueRepository.count() == 0) {
            Venue palace = new Venue();
            palace.setName("The Grand Royal Palace");
            palace.setLocation("Jaipur, Rajasthan");
            palace.setCapacity(800);
            palace.setPrice(12000.0);
            palace.setDescription("A majestic heritage palace featuring intricate Mughal courtyards, sprawling royal lawns, and stunning architecture.");
            palace.setImageUrl("https://images.unsplash.com/photo-1585909693685-7f5859e39b1a?q=80&w=600");
            palace.setIsAvailable(true);
            venueRepository.save(palace);

            Venue gardens = new Venue();
            gardens.setName("Gold Leaf Banquet & Gardens");
            gardens.setLocation("Udaipur, Rajasthan");
            gardens.setCapacity(500);
            gardens.setPrice(9500.0);
            gardens.setDescription("A serene lakeside luxury garden venue with dynamic lighting, pool deck, and glass banquet hall.");
            gardens.setImageUrl("https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=600");
            gardens.setIsAvailable(true);
            venueRepository.save(gardens);

            System.out.println("--> Seeded default venues.");
        }

        // Seed Vendor items
        if (vendorRepository.count() == 0) {
            // Photography
            Photography photo = new Photography();
            photo.setName("Royal Clicks Studio");
            photo.setPrice(2500.0);
            photo.setDescription("Award-winning cinematic photographers specializing in candid storytelling and heritage wedding photography.");
            photo.setImageUrl("https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=600");
            vendorRepository.save(photo);

            // Catering
            Catering catering = new Catering();
            catering.setName("Gourmet Royal Catering");
            catering.setPrice(4500.0);
            catering.setDescription("Curated luxury dining experience featuring multi-cuisine buffets, signature drinks, and live stations.");
            catering.setImageUrl("https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=600");
            vendorRepository.save(catering);

            // Decoration
            Decoration decor = new Decoration();
            decor.setName("Golden Petals Decorators");
            decor.setPrice(5000.0);
            decor.setDescription("Intricate floral design, custom themes, premium stage draping, and dramatic chandelier lighting.");
            decor.setImageUrl("https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=600");
            vendorRepository.save(decor);

            // Other Vendor (Makeup)
            Vendor makeup = new Vendor();
            makeup.setName("Opulent Makeup Artistry");
            makeup.setPrice(1200.0);
            makeup.setDescription("Luxury bridal makeup, hair styling, draping, and customized trials by elite artists.");
            makeup.setImageUrl("https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=600");
            // Set discriminator by saving concrete subtype or standard vendor if mapped to default GENERAL
            vendorRepository.save(makeup);

            // Other Vendor (Music)
            Vendor music = new Vendor();
            music.setName("Royal Symphony Band");
            music.setPrice(3500.0);
            music.setDescription("Elite live classical instrumental band, saxophonists, violin groups, and celebrity DJ line-up.");
            music.setImageUrl("https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=600");
            vendorRepository.save(music);

            System.out.println("--> Seeded default service vendors.");
        }
    }
}
