package com.ayushcodex.stayease.services.impl;

import com.ayushcodex.stayease.dto.RoomDto;
import com.ayushcodex.stayease.entity.Hotel;
import com.ayushcodex.stayease.entity.Room;
import com.ayushcodex.stayease.entity.User;
import com.ayushcodex.stayease.exception.ResourceNotFoundException;
import com.ayushcodex.stayease.exception.UnAuthorizedException;
import com.ayushcodex.stayease.repositories.HotelRepository;
import com.ayushcodex.stayease.repositories.RoomRepository;
import com.ayushcodex.stayease.services.InventoryService;
import com.ayushcodex.stayease.services.RoomService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static com.ayushcodex.stayease.util.AppUtils.getCurrentUser;

@Service
@Slf4j
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final ModelMapper modelMapper;
    private final HotelRepository hotelRepository;
    private final InventoryService inventoryService;

    @Override
    public RoomDto createNewRoom(Long hotelId,RoomDto roomDto) {
        log.info("Creating room with hotel id: {}", hotelId);

        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel with id "+hotelId+" not found. Please check the hotel details before creating room"));

        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if(!user.equals(hotel.getOwner())){
            throw new UnAuthorizedException("User does not own this hotel with id: "+hotelId);
        }

        Room room = modelMapper.map(roomDto,Room.class);
        room.setHotel(hotel);
        room = roomRepository.save(room);

        if(hotel.getActive()){
            inventoryService.initializeRoomForAYear(room);
        }

        log.info("Created new room with id: {} for hotel with id {}", room.getId(),hotelId);
        return modelMapper.map(room,RoomDto.class);
    }

    @Override
    public List<RoomDto> getAllRoomsInHotel(Long hotelId) {
        log.info("Getting all rooms with hotel id: {}",hotelId);
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel with id "+hotelId+" not found. Please check the hotel details before creating room"));


        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if(!user.equals(hotel.getOwner())){
            throw new UnAuthorizedException("User does not own this hotel with id: "+hotelId);
        }

        log.info("Rooms fetched total count: {}",hotel.getRooms().size());
        return hotel.getRooms()
                .stream()
                .map(room -> modelMapper.map(room, RoomDto.class))
                .collect( Collectors.toList());
    }

    @Override
    public RoomDto getRoomById(Long roomId) {

        log.info("Getting the room with roomId: {}",roomId);
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room with id "+roomId+" not found"));
        return modelMapper.map(room, RoomDto.class);
    }

    @Override
    @Transactional
    public void deleteRoomById(Long roomId) {
        log.info("Deleting room with id: {}",roomId);

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room with id "+roomId+" not found"));

        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if(!user.equals(room.getHotel().getOwner())){
            throw new UnAuthorizedException("User does not own this room with id: "+roomId);
        }
        inventoryService.deleteAllInventories(room);
        roomRepository.deleteById(roomId);

        log.info("Room with id: "+roomId+" deleted successfully");
    }

    @Override
    public RoomDto updateRoomById(Long hotelId, Long roomId, RoomDto roomDto) {
        log.info("Getting all rooms with hotel id: {}",hotelId);
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel with id "+hotelId+" not found. Please check the hotel details before creating room"));


        User user = getCurrentUser();
        if(!user.equals(hotel.getOwner())){
            throw new UnAuthorizedException("User does not own this hotel with id: "+hotelId);
        }

        Room room = roomRepository.findById(roomId).orElseThrow(
                () -> new ResourceNotFoundException("Room not found with id: "+roomId));

        modelMapper.map(roomDto,room);
        room.setId(roomId);
        roomRepository.save(room);

        //todo: if price or inventory is updated, than update the inventory for this room

        return modelMapper.map(room, RoomDto.class);
    }
}
