package com.exa.Royal.service;

import com.exa.Royal.entity.Catering;
import com.exa.Royal.entity.Decoration;
import com.exa.Royal.entity.Photography;
import com.exa.Royal.entity.Vendor;
import com.exa.Royal.exception.ResourceNotFoundException;
import com.exa.Royal.repository.VendorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VendorService {

    @Autowired
    private VendorRepository vendorRepository;

    public List<Vendor> getAllVendors() {
        return vendorRepository.findAll();
    }

    public Vendor getVendorById(Long id) {
        return vendorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service/Vendor not found with id: " + id));
    }

    public List<Vendor> getVendorsByCategory(String category) {
        return vendorRepository.findAll().stream()
                .filter(v -> category.equalsIgnoreCase(v.getCategory()))
                .collect(Collectors.toList());
    }

    public Vendor addVendor(Vendor details, String category) {
        Vendor item;
        if ("CATERING".equalsIgnoreCase(category)) {
            item = new Catering();
        } else if ("DECORATION".equalsIgnoreCase(category)) {
            item = new Decoration();
        } else if ("PHOTOGRAPHY".equalsIgnoreCase(category)) {
            item = new Photography();
        } else {
            item = new Vendor();
        }
        
        item.setName(details.getName());
        item.setPrice(details.getPrice());
        item.setDescription(details.getDescription());
        item.setImageUrl(details.getImageUrl());
        
        return vendorRepository.save(item);
    }

    public Vendor updateVendor(Long id, Vendor details, String category) {
        Vendor item = getVendorById(id);
        item.setName(details.getName());
        item.setPrice(details.getPrice());
        item.setDescription(details.getDescription());
        item.setImageUrl(details.getImageUrl());
        return vendorRepository.save(item);
    }

    public void deleteVendor(Long id) {
        if (!vendorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Service/Vendor not found with id: " + id);
        }
        vendorRepository.deleteById(id);
    }
}
