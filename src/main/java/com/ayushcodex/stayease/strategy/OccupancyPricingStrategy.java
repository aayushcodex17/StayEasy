package com.ayushcodex.stayease.strategy;

import com.ayushcodex.stayease.entity.Inventory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@RequiredArgsConstructor
public class OccupancyPricingStrategy implements PricingStrategy{

    private final PricingStrategy wrapped;

    @Override
    public BigDecimal calculatePrice(Inventory inventory) {
        BigDecimal price= wrapped.calculatePrice(inventory);
        double occupancyRate = (double) inventory.getBookedCount()/ inventory.getTotalCount();

        //if the occupancy is greated than 80% than we will surge the price by 1.2X
        if(occupancyRate > 0.8){
            price = price.multiply(BigDecimal.valueOf(1.2));
        }
        return price;
    }
}
