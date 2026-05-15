package com.ayushcodex.stayease.dto;

import com.ayushcodex.stayease.entity.HotelContactInfo;
import lombok.Data;
import java.util.List;

@Data
public class HotelDto {

    private Long id;
    private String name;
    private String city;
    private String[] photos;
    private String[] amenities;
    private HotelContactInfo contactInfo;
    private Boolean active;
}
