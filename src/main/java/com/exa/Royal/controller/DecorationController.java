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
@RequestMapping("/api/decorations")
@CrossOrigin(origins = "*")
public class DecorationController {

    @Autowired
    private VendorService vendorService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<Vendor>> viewDecoration() {
        return ResponseEntity.ok(vendorService.getVendorsByCategory("DECORATION"));
    }

    @PostMapping
    public ResponseEntity<Vendor> addDecoration(
            @RequestHeader("Authorization") String token,
            @RequestBody Vendor vendor) {
        validateAdmin(token);
        return ResponseEntity.ok(vendorService.addVendor(vendor, "DECORATION"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vendor> updateDecoration(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @RequestBody Vendor vendor) {
        validateAdmin(token);
        return ResponseEntity.ok(vendorService.updateVendor(id, vendor, "DECORATION"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDecoration(
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
