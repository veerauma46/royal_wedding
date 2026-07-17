package com.exa.Royal.service;

import com.exa.Royal.dto.AdminStatisticsDto;
import com.exa.Royal.dto.BookingDto;
import com.exa.Royal.entity.Booking;
import com.exa.Royal.entity.User;
import com.exa.Royal.entity.Venue;
import com.exa.Royal.entity.Vendor;
import com.exa.Royal.entity.WeddingPackage;
import com.exa.Royal.exception.ResourceNotFoundException;
import com.exa.Royal.repository.BookingRepository;
import com.exa.Royal.repository.UserRepository;
import com.exa.Royal.repository.VenueRepository;
import com.exa.Royal.repository.VendorRepository;
import com.exa.Royal.repository.WeddingPackageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private WeddingPackageRepository packageRepository;

    public Booking createBooking(BookingDto dto, User user) {
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setBookingDate(dto.getBookingDate() != null ? dto.getBookingDate() : LocalDate.now().plusMonths(3));
        booking.setGuests(dto.getGuests() != null ? dto.getGuests() : 100);
        booking.setSpecialRequirements(dto.getSpecialRequirements());
        booking.setBudget(dto.getBudget() != null ? dto.getBudget() : 0.0);
        booking.setWeddingType(dto.getWeddingType() != null ? dto.getWeddingType() : "Traditional");
        booking.setPackageName(dto.getPackageName());

        if (dto.getVenueId() != null) {
            Venue venue = venueRepository.findById(dto.getVenueId()).orElse(null);
            booking.setVenue(venue);
        }

        if (dto.getServiceId() != null) {
            Vendor service = vendorRepository.findById(dto.getServiceId()).orElse(null);
            booking.setService(service);
        }

        // Calculate booking amount using Stream API values
        double totalPrice = calculateBookingAmount(booking);
        booking.setTotalPrice(totalPrice);
        booking.setStatus("PENDING");

        return bookingRepository.save(booking);
    }

    public List<Booking> getBookingsByUser(User user) {
        return bookingRepository.findByUser(user);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
    }

    public Booking updateBookingStatus(Long id, String status) {
        Booking booking = getBookingById(id);
        booking.setStatus(status.toUpperCase());
        return bookingRepository.save(booking);
    }

    public void deleteBooking(Long id) {
        if (!bookingRepository.existsById(id)) {
            throw new ResourceNotFoundException("Booking not found with id: " + id);
        }
        bookingRepository.deleteById(id);
    }

    public List<Booking> searchBookingsByCustomerName(String customerName) {
        return bookingRepository.findAll().stream()
                .filter(b -> b.getUser().getFullName().toLowerCase().contains(customerName.toLowerCase()))
                .collect(Collectors.toList());
    }

    // Java Stream API integration
    public double calculateBookingAmount(Booking booking) {
        List<Double> costs = new ArrayList<>();
        
        // Fetch package price
        if (booking.getPackageName() != null && !booking.getPackageName().isEmpty()) {
            packageRepository.findByName(booking.getPackageName())
                    .ifPresent(p -> costs.add(p.getPrice()));
        }
        // Fetch venue price
        if (booking.getVenue() != null) {
            costs.add(booking.getVenue().getPrice());
        }
        // Fetch service price
        if (booking.getService() != null) {
            costs.add(booking.getService().getPrice());
        }

        // Compute sum using double stream mapToDouble
        return costs.stream().mapToDouble(Double::doubleValue).sum();
    }

    public long countTotalBookings() {
        return bookingRepository.findAll().stream().count();
    }

    public List<Booking> displayLatestBookings(int limit) {
        return bookingRepository.findAll().stream()
                .sorted(Comparator.comparing(Booking::getBookingDate).reversed())
                .limit(limit)
                .collect(Collectors.toList());
    }

    public String findMostBookedPackage() {
        return bookingRepository.findAll().stream()
                .map(Booking::getPackageName)
                .filter(Objects::nonNull)
                .filter(name -> !name.isEmpty())
                .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("None");
    }

    public Map<String, List<Booking>> groupBookingsByVenue() {
        return bookingRepository.findAll().stream()
                .filter(b -> b.getVenue() != null)
                .collect(Collectors.groupingBy(b -> b.getVenue().getName()));
    }

    // Comprehensive dashboard reports
    public AdminStatisticsDto getStatistics() {
        List<Booking> allBookings = bookingRepository.findAll();
        
        double totalRevenue = allBookings.stream()
                .filter(b -> !"CANCELLED".equalsIgnoreCase(b.getStatus()))
                .mapToDouble(Booking::getTotalPrice)
                .sum();

        // Calculate simulated review ratings average using streams
        double averageReviewRating = Stream.of(5, 5, 4, 5, 5, 4, 5)
                .mapToInt(Integer::intValue)
                .average()
                .orElse(5.0);

        Map<String, Long> bookingsByPackage = allBookings.stream()
                .map(Booking::getPackageName)
                .filter(Objects::nonNull)
                .filter(name -> !name.isEmpty())
                .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));

        // Ensure default packages exist in the map if they have 0 bookings
        for (String pkg : Arrays.asList("Silver Package", "Gold Package", "Platinum Package", "Royal Package")) {
            bookingsByPackage.putIfAbsent(pkg, 0L);
        }

        long availableVenues = venueRepository.findAll().stream()
                .filter(Venue::getIsAvailable)
                .count();

        AdminStatisticsDto stats = new AdminStatisticsDto();
        stats.setTotalRevenue(totalRevenue);
        stats.setAverageReviewRating(averageReviewRating);
        stats.setBookingsByPackage(bookingsByPackage);
        stats.setAvailableVenuesCount(availableVenues);
        stats.setTotalUsersCount(userRepository.findAll().stream().count());
        stats.setTotalBookingsCount((long) allBookings.size());
        stats.setTotalVenuesCount(venueRepository.findAll().stream().count());
        stats.setTotalVendorsCount(vendorRepository.findAll().stream().count());
        stats.setLatestBookings(displayLatestBookings(5));

        return stats;
    }
}
