package com.exa.Royal.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    private String mobileNumber;
    private String address;

    @Column(nullable = false)
    private String password;

    private String brideName;
    private String groomName;
    private LocalDate weddingDate;
    private String weddingType;
    private Double budget;

    @Column(nullable = false)
    private String role = "USER"; // Default role
}
