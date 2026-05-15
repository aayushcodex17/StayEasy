package com.ayushcodex.stayease.services.impl;

import com.ayushcodex.stayease.dto.HotelPriceDto;
import com.ayushcodex.stayease.entity.Hotel;
import com.ayushcodex.stayease.entity.HotelMinPrice;
import com.ayushcodex.stayease.entity.Inventory;
import com.ayushcodex.stayease.repositories.HotelMinPriceRepository;
import com.ayushcodex.stayease.repositories.HotelRepository;
import com.ayushcodex.stayease.repositories.InventoryRepository;
import com.ayushcodex.stayease.strategy.PricingService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class PricingUpdateService {

    //Scheduler to update the inventory and HotelMinPrice tables every hour

    private final HotelRepository hotelRepository;
    private final InventoryRepository inventoryRepository;
    private final HotelMinPriceRepository hotelMinPriceRepository;
    private final PricingService pricingService;

    @Scheduled(cron = "* 30 * * * *")
    @Transactional
    public void updatePrices(){

        int page = 0;
        int batchSize = 100;

        while(true){
            Page<Hotel> hotelPage = hotelRepository.findAll(PageRequest.of(page,batchSize));
            if(hotelPage.isEmpty()){
                break;
            }
            hotelPage.getContent().forEach(this::updateHotelPrices);
            page++;
        }

    }

    private void updateHotelPrices(Hotel hotel){

        log.info("Updating hotel prices though cron jobs for the hotel id : {} , Hotel Name: {}",hotel.getId(),hotel.getName());

        LocalDate startDate = LocalDate.now();
        LocalDate endDate = LocalDate.now().plusYears(1);

        List<Inventory> inventoryList = inventoryRepository.findByHotelAndInventoryDateBetween(hotel,startDate,endDate);

        updateInventoryPrices(inventoryList);

        updateHotelMinPrice(hotel,inventoryList,startDate,endDate);
    }

    private void updateHotelMinPrice(Hotel hotel, List<Inventory> inventoryList, LocalDate startDate, LocalDate endDate) {

        //compute minimum price per day for hotel

        Map<LocalDate, BigDecimal> dailyMinPrices = inventoryList.stream()
                .collect(Collectors.groupingBy(
                        Inventory::getInventoryDate,
                        Collectors.mapping(Inventory::getPrice,Collectors.minBy(Comparator.naturalOrder()))
                ))
                .entrySet()
                .stream()
                .collect(Collectors.toMap(Map.Entry::getKey,e -> e.getValue().orElse(BigDecimal.ZERO)));

        //Prepare HotelMinPrice entities in bulk
        List<HotelMinPrice> hotelPrices = new ArrayList<>();
        dailyMinPrices.forEach((date,price) -> {
            HotelMinPrice hotelMinPrice = hotelMinPriceRepository.findByHotelAndDate(hotel,date)
                    .orElse(new HotelMinPrice(hotel,price));
            hotelMinPrice.setPrice(price);
            hotelMinPrice.setDate(date);
            hotelPrices.add(hotelMinPrice);
        });

        //Save all the HotelPrices entries in bulk
        hotelMinPriceRepository.saveAll(hotelPrices);



    }


    private void updateInventoryPrices(List<Inventory> inventoryList){

        inventoryList.forEach( inventory -> {
            BigDecimal dynamicPrice = pricingService.calculateDynamicPricing(inventory);
            inventory.setPrice(dynamicPrice);
        });
        inventoryRepository.saveAll(inventoryList);
    }


}
