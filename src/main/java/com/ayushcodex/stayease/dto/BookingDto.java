package com.ayushcodex.stayease.dto;

import com.ayushcodex.stayease.entity.*;
import com.ayushcodex.stayease.entity.enums.BookingStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookingDto {

    private Long id;
    private Integer roomsCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String status;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private BookingStatus bookingStatus;
    private Set<Guest> guests;
    private BigDecimal amount;
}
