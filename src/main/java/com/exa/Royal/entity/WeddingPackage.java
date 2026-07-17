package com.exa.Royal.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "wedding_packages")
public class WeddingPackage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Double price;

    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String features; // Comma-separated list of package features
}
