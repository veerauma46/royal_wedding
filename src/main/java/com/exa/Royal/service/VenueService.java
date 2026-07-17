package com.exa.Royal.service;

import com.exa.Royal.entity.Venue;
import com.exa.Royal.exception.ResourceNotFoundException;
import com.exa.Royal.repository.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VenueService {

    @Autowired
    private VenueRepository venueRepository;

    public List<Venue> getAllVenues() {
        return venueRepository.findAll();
    }

    public Venue getVenueById(Long id) {
        return venueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found with id: " + id));
    }

    public Venue addVenue(Venue venue) {
        return venueRepository.save(venue);
    }

    public Venue updateVenue(Long id, Venue venueDetails) {
        Venue venue = getVenueById(id);
        venue.setName(venueDetails.getName());
        venue.setLocation(venueDetails.getLocation());
        venue.setCapacity(venueDetails.getCapacity());
        venue.setPrice(venueDetails.getPrice());
        venue.setDescription(venueDetails.getDescription());
        venue.setImageUrl(venueDetails.getImageUrl());
        venue.setIsAvailable(venueDetails.getIsAvailable());
        return venueRepository.save(venue);
    }

    public void deleteVenue(Long id) {
        if (!venueRepository.existsById(id)) {
            throw new ResourceNotFoundException("Venue not found with id: " + id);
        }
        venueRepository.deleteById(id);
    }
}
