package com.ayushcodex.stayease.strategy;

import com.ayushcodex.stayease.entity.Inventory;

import java.math.BigDecimal;

public interface PricingStrategy {

    BigDecimal calculatePrice(Inventory inventory);
}
