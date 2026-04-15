package com.ayushcodex.stayease.strategy;

import com.ayushcodex.stayease.entity.Inventory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@RequiredArgsConstructor
public class SurgePriceStrategy  implements  PricingStrategy{

    private final PricingStrategy wrappedPrice;

    @Override
    public BigDecimal calculatePrice(Inventory inventory) {
        return wrappedPrice.calculatePrice(inventory).multiply(inventory.getSurgeFactor());
    }
}
