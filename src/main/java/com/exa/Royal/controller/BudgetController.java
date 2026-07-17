package com.exa.Royal.controller;

import com.exa.Royal.dto.BudgetDto;
import com.exa.Royal.entity.Budget;
import com.exa.Royal.entity.User;
import com.exa.Royal.service.BudgetService;
import com.exa.Royal.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/budget")
@CrossOrigin(origins = "*")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    @Autowired
    private UserService userService;

    @GetMapping("/user")
    public ResponseEntity<Budget> getBudget(@RequestHeader("Authorization") String token) {
        User user = userService.getUserByToken(token);
        return ResponseEntity.ok(budgetService.getBudgetByUser(user));
    }

    @PostMapping("/calculate")
    public ResponseEntity<Budget> calculateAndSaveBudget(
            @RequestHeader("Authorization") String token,
            @RequestBody BudgetDto dto) {
        User user = userService.getUserByToken(token);
        return ResponseEntity.ok(budgetService.saveBudget(user, dto));
    }
}
