package com.exa.Royal.controller;

import com.exa.Royal.dto.BookingDto;
import com.exa.Royal.entity.Booking;
import com.exa.Royal.entity.User;
import com.exa.Royal.exception.UnauthorizedException;
import com.exa.Royal.service.BookingService;
import com.exa.Royal.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserService userService;

    @PostMapping("/api/bookings")
    public ResponseEntity<Booking> createBooking(
            @RequestHeader("Authorization") String token,
            @RequestBody BookingDto dto) {
        User user = userService.getUserByToken(token);
        return ResponseEntity.ok(bookingService.createBooking(dto, user));
    }

    @GetMapping("/api/bookings")
    public ResponseEntity<List<Booking>> getBookings(@RequestHeader("Authorization") String token) {
        User user = userService.getUserByToken(token);
        if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.ok(bookingService.getAllBookings());
        }
        return ResponseEntity.ok(bookingService.getBookingsByUser(user));
    }

    @PutMapping("/api/bookings/{id}/status")
    public ResponseEntity<Booking> updateStatus(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @RequestParam String status) {
        User user = userService.getUserByToken(token);
        // Admin can confirm/cancel any, users can cancel their own
        Booking booking = bookingService.getBookingById(id);
        if (!"ADMIN".equalsIgnoreCase(user.getRole()) && !booking.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("Not authorized to change this booking status");
        }
        
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, status));
    }

    @DeleteMapping("/api/bookings/{id}")
    public ResponseEntity<Void> deleteBooking(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id) {
        User user = userService.getUserByToken(token);
        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new UnauthorizedException("Access denied. Admin role required.");
        }
        bookingService.deleteBooking(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/api/admin/bookings/search")
    public ResponseEntity<List<Booking>> searchBookings(
            @RequestHeader("Authorization") String token,
            @RequestParam String customerName) {
        User user = userService.getUserByToken(token);
        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new UnauthorizedException("Access denied. Admin role required.");
        }
        return ResponseEntity.ok(bookingService.searchBookingsByCustomerName(customerName));
    }
}
