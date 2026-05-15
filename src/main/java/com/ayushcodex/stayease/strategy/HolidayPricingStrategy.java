package com.ayushcodex.stayease.strategy;

import com.ayushcodex.stayease.entity.Inventory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
public class HolidayPricingStrategy implements PricingStrategy{

    private final PricingStrategy wrapped;

    @Override
    public BigDecimal calculatePrice(Inventory inventory) {
        BigDecimal price = wrapped.calculatePrice(inventory);

        List<LocalDate> holidays = new ArrayList<>();
        holidays.add(LocalDate.of(2025,8,15));
        holidays.add(LocalDate.of(2025,10,20));
        holidays.add(LocalDate.of(2025,10,28));
        holidays.add(LocalDate.of(2025,12,30));
        holidays.add(LocalDate.of(2025,12,31));
        holidays.add(LocalDate.of(2026,1,1));
        holidays.add(LocalDate.of(2026,3,8));

        //call an api or check with local data

        if(holidays.contains(inventory.getInventoryDate())){
            price = price.multiply(BigDecimal.valueOf(1.5));
        }

        return price;
    }
}
