package com.ayushcodex.stayease.strategy;

import com.ayushcodex.stayease.entity.Inventory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

public class BasePricingStrategy implements PricingStrategy{

    /*
    * this will return the base price od the room of a particular Inventory
    * */

    @Override
    public BigDecimal calculatePrice(Inventory inventory) {
        return inventory.getRoom().getBasePrice();
    }
}
