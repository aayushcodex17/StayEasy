package com.ayushcodex.stayease.entity;

import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Embeddable
public class HotelContactInfo {

    private String address;
    private Long phoneNumber;
    private String email;
    private String location;

}
