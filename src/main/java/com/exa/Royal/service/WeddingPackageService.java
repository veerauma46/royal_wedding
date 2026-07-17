package com.exa.Royal.service;

import com.exa.Royal.entity.WeddingPackage;
import com.exa.Royal.exception.ResourceNotFoundException;
import com.exa.Royal.repository.WeddingPackageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WeddingPackageService {

    @Autowired
    private WeddingPackageRepository packageRepository;

    public List<WeddingPackage> getAllPackages() {
        return packageRepository.findAll();
    }

    public WeddingPackage getPackageById(Long id) {
        return packageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Package not found with id: " + id));
    }

    public WeddingPackage addPackage(WeddingPackage pkg) {
        return packageRepository.save(pkg);
    }

    public WeddingPackage updatePackage(Long id, WeddingPackage pkgDetails) {
        WeddingPackage pkg = getPackageById(id);
        pkg.setName(pkgDetails.getName());
        pkg.setDescription(pkgDetails.getDescription());
        pkg.setPrice(pkgDetails.getPrice());
        pkg.setImageUrl(pkgDetails.getImageUrl());
        pkg.setFeatures(pkgDetails.getFeatures());
        return packageRepository.save(pkg);
    }

    public void deletePackage(Long id) {
        if (!packageRepository.existsById(id)) {
            throw new ResourceNotFoundException("Package not found with id: " + id);
        }
        packageRepository.deleteById(id);
    }

    // Java Stream API implementation
    public List<WeddingPackage> searchPackages(String query) {
        return packageRepository.findAll().stream()
                .filter(p -> p.getName().toLowerCase().contains(query.toLowerCase()) || 
                             (p.getDescription() != null && p.getDescription().toLowerCase().contains(query.toLowerCase())))
                .collect(Collectors.toList());
    }

    public List<WeddingPackage> filterPackagesByPrice(Double maxPrice) {
        return packageRepository.findAll().stream()
                .filter(p -> p.getPrice() <= maxPrice)
                .collect(Collectors.toList());
    }

    public List<WeddingPackage> sortPackagesByPrice(boolean ascending) {
        return packageRepository.findAll().stream()
                .sorted((p1, p2) -> ascending ? Double.compare(p1.getPrice(), p2.getPrice()) : Double.compare(p2.getPrice(), p1.getPrice()))
                .collect(Collectors.toList());
    }

    public List<WeddingPackage> sortPackagesByName() {
        return packageRepository.findAll().stream()
                .sorted(Comparator.comparing(p -> p.getName().toLowerCase()))
                .collect(Collectors.toList());
    }
}
