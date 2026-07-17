package com.exa.Royal.dto;

import com.exa.Royal.entity.Booking;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class AdminStatisticsDto {
    private Double totalRevenue;
    private Double averageReviewRating;
    private Map<String, Long> bookingsByPackage;
    private Long availableVenuesCount;
    private Long totalUsersCount;
    private Long totalBookingsCount;
    private Long totalVenuesCount;
    private Long totalVendorsCount;
    private List<Booking> latestBookings;
}
