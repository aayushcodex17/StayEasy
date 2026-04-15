package com.ayushcodex.stayease.services;

import com.ayushcodex.stayease.dto.HotelDto;
import com.ayushcodex.stayease.dto.HotelInfoDto;
import com.ayushcodex.stayease.entity.Hotel;

import java.util.List;

public interface HotelService {

    HotelDto createNewHotel(HotelDto hotelDto);

    HotelDto getHotelById(Long hotelId);

    HotelDto updateHotelById(Long hotelId,HotelDto dto);

    Boolean deleteHotelById(long id);

    void activateHotel(Long hotelId);

    HotelInfoDto getHotelInfoById(Long hotelId);

    List<HotelDto> getAllHotels();
}
