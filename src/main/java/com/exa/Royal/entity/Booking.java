package com.exa.Royal.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate bookingDate;

    private Integer guests = 0;

    @Column(columnDefinition = "TEXT")
    private String specialRequirements;

    private Double budget = 0.0;

    private String weddingType = "Traditional";

    private String packageName;

    @ManyToOne
    @JoinColumn(name = "venue_id")
    private Venue venue;

    @ManyToOne
    @JoinColumn(name = "service_id")
    private Vendor service;

    @Column(nullable = false)
    private Double totalPrice = 0.0;

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, CONFIRMED, CANCELLED
}
