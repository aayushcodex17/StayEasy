package com.ayushcodex.stayease.entity;

import com.ayushcodex.stayease.entity.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

//@Entity
//@Getter
//@Setter
public class Payment {

//    @Id
//    @GeneratedValue(strategy = GenerationType.SEQUENCE)
//    private Long id;
//
//    @Column(unique = true,nullable = false)
//    String transactionId;
//
//    @Enumerated(EnumType.STRING)
//    @Column(nullable = false)
//    private PaymentStatus paymentStatus;
//
//    @Column(nullable = false,precision = 10,scale = 2)
//    private BigDecimal amount;
//
//    @OneToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "booking_id")
//    private Booking booking;
//
//    @CreationTimestamp
//    private LocalDateTime createdAt;
//
//    @UpdateTimestamp
//    private LocalDateTime updatedAt;


}
