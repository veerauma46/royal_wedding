package com.exa.Royal.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "budgets")
public class Budget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private Integer guests = 0;
    private Double foodCost = 0.0;
    private Double decorationCost = 0.0;
    private Double photographyCost = 0.0;
    private Double venueCost = 0.0;
    private Double musicCost = 0.0;
}
