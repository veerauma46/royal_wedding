package com.exa.Royal.controller;

import com.exa.Royal.entity.User;
import com.exa.Royal.entity.Vendor;
import com.exa.Royal.exception.UnauthorizedException;
import com.exa.Royal.service.UserService;
import com.exa.Royal.service.VendorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class VendorController {

    @Autowired
    private VendorService vendorService;

    @Autowired
    private UserService userService;

    @GetMapping("/api/vendors")
    public ResponseEntity<List<Vendor>> getAllVendors() {
        return ResponseEntity.ok(vendorService.getAllVendors());
    }

    @GetMapping("/api/bookings/services")
    public ResponseEntity<List<Vendor>> getServicesCatalog() {
        return ResponseEntity.ok(vendorService.getAllVendors());
    }

    @PostMapping("/api/vendors")
    public ResponseEntity<Vendor> addVendor(
            @RequestHeader("Authorization") String token,
            @RequestBody Vendor vendor) {
        validateAdmin(token);
        String category = vendor.getCategory() != null ? vendor.getCategory() : "GENERAL";
        return ResponseEntity.ok(vendorService.addVendor(vendor, category));
    }

    @PutMapping("/api/vendors/{id}")
    public ResponseEntity<Vendor> updateVendor(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @RequestBody Vendor vendor) {
        validateAdmin(token);
        String category = vendor.getCategory() != null ? vendor.getCategory() : "GENERAL";
        return ResponseEntity.ok(vendorService.updateVendor(id, vendor, category));
    }

    @DeleteMapping("/api/vendors/{id}")
    public ResponseEntity<Void> deleteVendor(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id) {
        validateAdmin(token);
        vendorService.deleteVendor(id);
        return ResponseEntity.ok().build();
    }

    private void validateAdmin(String token) {
        User user = userService.getUserByToken(token);
        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new UnauthorizedException("Access denied. Admin role required.");
        }
    }
}
