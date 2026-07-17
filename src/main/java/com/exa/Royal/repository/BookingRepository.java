package com.exa.Royal.repository;

import com.exa.Royal.entity.Booking;
import com.exa.Royal.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUser(User user);
    List<Booking> findByOrderByBookingDateDesc();
}
