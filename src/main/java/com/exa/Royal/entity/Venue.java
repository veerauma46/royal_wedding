package com.exa.Royal.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "venues")
public class Venue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String location;
    private Integer capacity;

    @Column(nullable = false)
    private Double price;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String imageUrl;

    private Boolean isAvailable = true;
}
