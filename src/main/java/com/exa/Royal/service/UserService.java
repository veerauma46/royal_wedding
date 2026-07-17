package com.exa.Royal.service;

import com.exa.Royal.dto.AuthResponse;
import com.exa.Royal.dto.UserDto;
import com.exa.Royal.entity.User;
import com.exa.Royal.exception.BadRequestException;
import com.exa.Royal.exception.ResourceNotFoundException;
import com.exa.Royal.exception.UnauthorizedException;
import com.exa.Royal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public AuthResponse register(UserDto dto) {
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new BadRequestException("Email is already registered");
        }

        User user = new User();
        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setMobileNumber(dto.getPhoneNumber());
        user.setAddress(dto.getAddress());
        user.setPassword(dto.getPassword()); // Plain password as requested (no BCrypt)
        user.setBrideName(dto.getBrideName());
        user.setGroomName(dto.getGroomName());
        user.setWeddingDate(dto.getWeddingDate());
        user.setWeddingType(dto.getWeddingType());
        user.setBudget(dto.getBudget());

        // Simple default admin assignment
        if (dto.getEmail().equalsIgnoreCase("admin@royal.com")) {
            user.setRole("ADMIN");
        } else {
            user.setRole("USER");
        }

        userRepository.save(user);

        // Simple token is just the email itself
        return new AuthResponse(user.getEmail(), user.getEmail(), user.getFullName(), user.getRole(), "Registration successful!");
    }

    public AuthResponse login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!user.getPassword().equals(password)) {
            throw new BadRequestException("Invalid email or password");
        }

        return new AuthResponse(user.getEmail(), user.getEmail(), user.getFullName(), user.getRole(), "Login successful!");
    }

    public User getProfile(String token) {
        return getUserByToken(token);
    }

    public User updateProfile(String token, UserDto dto) {
        User user = getUserByToken(token);
        
        user.setFullName(dto.getFullName());
        user.setMobileNumber(dto.getPhoneNumber());
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            user.setPassword(dto.getPassword());
        }
        user.setBrideName(dto.getBrideName());
        user.setGroomName(dto.getGroomName());
        user.setWeddingDate(dto.getWeddingDate());
        user.setWeddingType(dto.getWeddingType());
        user.setBudget(dto.getBudget());
        user.setAddress(dto.getAddress());

        return userRepository.save(user);
    }

    public User getUserByToken(String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            throw new UnauthorizedException("Missing or invalid Authorization header");
        }
        String email = token.substring(7).trim();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found or session expired"));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }
}
