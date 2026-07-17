package com.exa.Royal.repository;

import com.exa.Royal.entity.WeddingPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface WeddingPackageRepository extends JpaRepository<WeddingPackage, Long> {
    Optional<WeddingPackage> findByName(String name);
}
