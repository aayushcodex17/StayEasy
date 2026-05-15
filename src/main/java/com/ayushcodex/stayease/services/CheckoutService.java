package com.ayushcodex.stayease.services;

import com.ayushcodex.stayease.entity.Booking;

public interface CheckoutService {

    String getCheckoutSession(Booking booking, String successUrl, String failureUrl);
}
