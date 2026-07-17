package com.exa.Royal.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class BookingDto {
    private LocalDate bookingDate;
    private Integer guests;
    private String specialRequirements;
    private Double budget;
    private String weddingType;
    private String packageName;
    private Long venueId;
    private Long serviceId;
}
