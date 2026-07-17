package com.exa.Royal.controller;

import com.exa.Royal.entity.User;
import com.exa.Royal.entity.WeddingPackage;
import com.exa.Royal.exception.UnauthorizedException;
import com.exa.Royal.service.UserService;
import com.exa.Royal.service.WeddingPackageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/packages")
@CrossOrigin(origins = "*")
public class WeddingPackageController {

    @Autowired
    private WeddingPackageService packageService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<WeddingPackage>> getPackages(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String sort) {
        if (query != null && !query.isEmpty()) {
            return ResponseEntity.ok(packageService.searchPackages(query));
        }
        if (maxPrice != null) {
            return ResponseEntity.ok(packageService.filterPackagesByPrice(maxPrice));
        }
        if ("priceAsc".equalsIgnoreCase(sort)) {
            return ResponseEntity.ok(packageService.sortPackagesByPrice(true));
        }
        if ("priceDesc".equalsIgnoreCase(sort)) {
            return ResponseEntity.ok(packageService.sortPackagesByPrice(false));
        }
        if ("name".equalsIgnoreCase(sort)) {
            return ResponseEntity.ok(packageService.sortPackagesByName());
        }
        return ResponseEntity.ok(packageService.getAllPackages());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WeddingPackage> getPackageById(@PathVariable Long id) {
        return ResponseEntity.ok(packageService.getPackageById(id));
    }

    @PostMapping
    public ResponseEntity<WeddingPackage> addPackage(
            @RequestHeader("Authorization") String token,
            @RequestBody WeddingPackage pkg) {
        validateAdmin(token);
        return ResponseEntity.ok(packageService.addPackage(pkg));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WeddingPackage> updatePackage(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @RequestBody WeddingPackage pkg) {
        validateAdmin(token);
        return ResponseEntity.ok(packageService.updatePackage(id, pkg));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePackage(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id) {
        validateAdmin(token);
        packageService.deletePackage(id);
        return ResponseEntity.ok().build();
    }

    private void validateAdmin(String token) {
        User user = userService.getUserByToken(token);
        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new UnauthorizedException("Access denied. Admin role required.");
        }
    }
}
