package com.ayushcodex.stayease.services;

import com.ayushcodex.stayease.dto.BookingDto;
import com.ayushcodex.stayease.dto.BookingRequest;
import com.ayushcodex.stayease.dto.GuestDto;
import com.ayushcodex.stayease.dto.HotelReportDto;
import com.stripe.model.Event;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface BookingService {

    BookingDto initialiseBooking(BookingRequest bookingRequest);

    BookingDto addGuests(Long bookingId,List<GuestDto> guestDtoList);

    String initiatePayment(Long bookingId);

    void capturePayment(Event event);

    void cancelBooking(Long bookingId);

    Map<String, String> getBookingStatus(Long bookingId);

    List<BookingDto> getAllBookingsByHotel(Long hotelId);

    HotelReportDto getHotelReport(Long hotelId, LocalDate startDate, LocalDate endDate);

    List<BookingDto> getMyBookings();
}
