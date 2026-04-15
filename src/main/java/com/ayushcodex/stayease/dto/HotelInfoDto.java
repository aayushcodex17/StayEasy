package com.ayushcodex.stayease.dto;

import com.ayushcodex.stayease.entity.Room;
import lombok.Data;

import java.util.List;

@Data
public class HotelInfoDto {

    private HotelDto hotel;
    private List<RoomDto> rooms;

}
