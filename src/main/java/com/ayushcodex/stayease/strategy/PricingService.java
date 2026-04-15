package com.ayushcodex.stayease.strategy;

import com.ayushcodex.stayease.entity.Inventory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class PricingService {

    public BigDecimal calculateDynamicPricing(Inventory inventory){

        PricingStrategy pricingStrategy = new BasePricingStrategy();

        // apply the additional strategies
        pricingStrategy = new SurgePriceStrategy(pricingStrategy);
        pricingStrategy =  new OccupancyPricingStrategy(pricingStrategy);
        pricingStrategy =  new UrgencyPricingStrategy(pricingStrategy);
        pricingStrategy = new HolidayPricingStrategy(pricingStrategy);

        return pricingStrategy.calculatePrice(inventory);
    }
// Return the sum of price of the list of inventories
    public BigDecimal calculateTotalPrice(List<Inventory> inventoryList){

        return inventoryList.stream()
                .map(this::calculateDynamicPricing)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
