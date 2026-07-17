package com.exa.Royal.controller;

import com.exa.Royal.entity.User;
import com.exa.Royal.entity.Venue;
import com.exa.Royal.exception.UnauthorizedException;
import com.exa.Royal.service.UserService;
import com.exa.Royal.service.VenueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/venues")
@CrossOrigin(origins = "*")
public class VenueController {

    @Autowired
    private VenueService venueService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<Venue>> getAllVenues() {
        return ResponseEntity.ok(venueService.getAllVenues());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Venue> getVenueById(@PathVariable Long id) {
        return ResponseEntity.ok(venueService.getVenueById(id));
    }

    @PostMapping
    public ResponseEntity<Venue> addVenue(
            @RequestHeader("Authorization") String token,
            @RequestBody Venue venue) {
        validateAdmin(token);
        return ResponseEntity.ok(venueService.addVenue(venue));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Venue> updateVenue(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @RequestBody Venue venue) {
        validateAdmin(token);
        return ResponseEntity.ok(venueService.updateVenue(id, venue));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVenue(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id) {
        validateAdmin(token);
        venueService.deleteVenue(id);
        return ResponseEntity.ok().build();
    }

    private void validateAdmin(String token) {
        User user = userService.getUserByToken(token);
        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new UnauthorizedException("Access denied. Admin role required.");
        }
    }
}
