package com.exa.Royal.repository;

import com.exa.Royal.entity.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VendorRepository extends JpaRepository<Vendor, Long> {
    List<Vendor> findByCategory(String category);
}
