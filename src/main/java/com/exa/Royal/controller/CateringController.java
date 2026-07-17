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
@RequestMapping("/api/catering")
@CrossOrigin(origins = "*")
public class CateringController {

    @Autowired
    private VendorService vendorService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<Vendor>> viewMenu() {
        return ResponseEntity.ok(vendorService.getVendorsByCategory("CATERING"));
    }

    @PostMapping
    public ResponseEntity<Vendor> addMenu(
            @RequestHeader("Authorization") String token,
            @RequestBody Vendor vendor) {
        validateAdmin(token);
        return ResponseEntity.ok(vendorService.addVendor(vendor, "CATERING"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vendor> updateMenu(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @RequestBody Vendor vendor) {
        validateAdmin(token);
        return ResponseEntity.ok(vendorService.updateVendor(id, vendor, "CATERING"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMenu(
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
