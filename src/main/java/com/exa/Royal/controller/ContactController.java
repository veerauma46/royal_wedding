package com.exa.Royal.controller;

import com.exa.Royal.dto.AdminStatisticsDto;
import com.exa.Royal.entity.User;
import com.exa.Royal.exception.UnauthorizedException;
import com.exa.Royal.service.BookingService;
import com.exa.Royal.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@CrossOrigin(origins = "*")
public class ContactController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserService userService;

    @PostMapping("/api/contact")
    public ResponseEntity<Map<String, String>> processContact(@RequestBody Map<String, String> contactForm) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Thank you! Our Royal Wedding Concierge will reach out to you within 24 hours.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/reviews")
    public ResponseEntity<List<Map<String, Object>>> getReviews() {
        List<Map<String, Object>> reviews = new ArrayList<>();
        
        reviews.add(createReview(1, "Srikanth & Mowlika", 5, 
                "Royal Wedding Planner made our special day absolutely magical! Every detail from the floral entrance to the palace lighting was perfect.", 
                "https://images.unsplash.com/photo-1621574539437-4b7cb63120b8?q=80&w=300"));
        reviews.add(createReview(2, "David & Grace", 5, 
                "Prisinte orchestration and gourmet catering that our guests are still talking about. Highly recommend their bespoke planning services!", 
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300"));
        reviews.add(createReview(3, "Omar & Fatima", 5, 
                "A true royal experience. The decoration was majestic and the team was incredibly cooperative and professional throughout the event.", 
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300"));
                
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/api/gallery/images")
    public ResponseEntity<List<Map<String, Object>>> getGallery() {
        List<Map<String, Object>> images = new ArrayList<>();
        
        images.add(createImage(1, "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=600", "hindu", "Vibrant Traditional Mandap Garland Exchange"));
        images.add(createImage(2, "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600", "hindu", "Bride & Groom Walking Around Sacred Fire"));
        images.add(createImage(3, "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=600", "christian", "Walking Down the Aisle at St. Marys Cathedral"));
        images.add(createImage(4, "https://images.unsplash.com/photo-1519225495810-7517c300ea87?q=80&w=600", "christian", "Elegant Glass Banquet Table Setup"));
        images.add(createImage(5, "https://images.unsplash.com/photo-1507504038482-7621c330dfef?q=80&w=600", "muslim", "Royal Nikah Ceremony Draped Canopy details"));
        images.add(createImage(6, "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=600", "catering", "Premium Multicuisine Catering Platter Setup"));
        images.add(createImage(7, "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=600", "decoration", "Rose Gold Theme Entrance Arches"));
        images.add(createImage(8, "https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=600", "photography", "Candid Portrait in Palace Corridor"));
        
        return ResponseEntity.ok(images);
    }

    @GetMapping("/api/admin/statistics")
    public ResponseEntity<AdminStatisticsDto> getStatistics(@RequestHeader("Authorization") String token) {
        User user = userService.getUserByToken(token);
        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new UnauthorizedException("Access denied. Admin role required.");
        }
        return ResponseEntity.ok(bookingService.getStatistics());
    }

    private Map<String, Object> createReview(int id, String coupleName, int rating, String comment, String coupleImageUrl) {
        Map<String, Object> review = new HashMap<>();
        review.put("id", id);
        review.put("coupleName", coupleName);
        review.put("rating", rating);
        review.put("comment", comment);
        review.put("coupleImageUrl", coupleImageUrl);
        return review;
    }

    private Map<String, Object> createImage(int id, String imageUrl, String albumName, String caption) {
        Map<String, Object> img = new HashMap<>();
        img.put("id", id);
        img.put("imageUrl", imageUrl);
        img.put("albumName", albumName);
        img.put("caption", caption);
        return img;
    }
}
