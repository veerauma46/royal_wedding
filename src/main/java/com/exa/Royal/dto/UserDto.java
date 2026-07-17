package com.exa.Royal.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class UserDto {
    private String fullName;
    private String email;
    private String phoneNumber;
    private String password;
    private String brideName;
    private String groomName;
    private LocalDate weddingDate;
    private String weddingType;
    private Double budget;
    private String address;
}
