package com.exa.Royal.repository;

import com.exa.Royal.entity.Budget;
import com.exa.Royal.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    Optional<Budget> findByUser(User user);
}
