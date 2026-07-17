package com.exa.Royal.service;

import com.exa.Royal.dto.BudgetDto;
import com.exa.Royal.entity.Budget;
import com.exa.Royal.entity.User;
import com.exa.Royal.repository.BudgetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class BudgetService {

    @Autowired
    private BudgetRepository budgetRepository;

    public Budget getBudgetByUser(User user) {
        return budgetRepository.findByUser(user)
                .orElseGet(() -> {
                    Budget b = new Budget();
                    b.setUser(user);
                    return b;
                });
    }

    public Budget saveBudget(User user, BudgetDto dto) {
        Budget budget = budgetRepository.findByUser(user)
                .orElse(new Budget());
        
        budget.setUser(user);
        budget.setGuests(dto.getGuests() != null ? dto.getGuests() : 150);
        budget.setFoodCost(dto.getFoodCost() != null ? dto.getFoodCost() : 45.0);
        budget.setDecorationCost(dto.getDecorationCost() != null ? dto.getDecorationCost() : 2500.0);
        budget.setPhotographyCost(dto.getPhotographyCost() != null ? dto.getPhotographyCost() : 1800.0);
        budget.setVenueCost(dto.getVenueCost() != null ? dto.getVenueCost() : 5000.0);
        budget.setMusicCost(dto.getMusicCost() != null ? dto.getMusicCost() : 1200.0);

        return budgetRepository.save(budget);
    }
}
