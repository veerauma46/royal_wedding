package com.exa.Royal.controller;

import com.exa.Royal.dto.UserDto;
import com.exa.Royal.entity.User;
import com.exa.Royal.exception.UnauthorizedException;
import com.exa.Royal.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(@RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(userService.getProfile(token));
    }

    @PutMapping("/update")
    public ResponseEntity<User> updateProfile(@RequestHeader("Authorization") String token, @RequestBody UserDto dto) {
        return ResponseEntity.ok(userService.updateProfile(token, dto));
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers(@RequestHeader("Authorization") String token) {
        User admin = userService.getUserByToken(token);
        if (!"ADMIN".equalsIgnoreCase(admin.getRole())) {
            throw new UnauthorizedException("Access denied. Admin role required.");
        }
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@RequestHeader("Authorization") String token, @PathVariable Long id) {
        User admin = userService.getUserByToken(token);
        if (!"ADMIN".equalsIgnoreCase(admin.getRole())) {
            throw new UnauthorizedException("Access denied. Admin role required.");
        }
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }
}
