package com.ayushcodex.stayease.strategy;

import com.ayushcodex.stayease.entity.Inventory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

@RequiredArgsConstructor
public class UrgencyPricingStrategy implements PricingStrategy{

    private final PricingStrategy wrapped;

    @Override
    public BigDecimal calculatePrice(Inventory inventory) {

        BigDecimal price = wrapped.calculatePrice(inventory);

        LocalDate today = LocalDate.now();

        if( !inventory.getInventoryDate().isBefore(today) && inventory.getInventoryDate().isBefore(today.plusDays(7))){
            price = price.multiply(BigDecimal.valueOf(1.15));
        }
        return price;
    }
}
