package com.exa.Royal.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "vendors")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "category", discriminatorType = DiscriminatorType.STRING)
public class Vendor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Double price;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String imageUrl;

    @Column(name = "category", insertable = false, updatable = false)
    private String category;
}
