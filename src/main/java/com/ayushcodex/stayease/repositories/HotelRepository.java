package com.ayushcodex.stayease.repositories;

import com.ayushcodex.stayease.entity.Hotel;
import com.ayushcodex.stayease.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelRepository extends JpaRepository<Hotel,Long> {
    List<Hotel> findByOwner(User user);
}
