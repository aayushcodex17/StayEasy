package com.ayushcodex.stayease.services;

import com.ayushcodex.stayease.dto.ProfileUpdateRequestDto;
import com.ayushcodex.stayease.dto.UserDto;
import com.ayushcodex.stayease.entity.User;

public interface UserService {

    User getUserById(Long id);

    void updateProfile(ProfileUpdateRequestDto profileUpdateRequestDto);

    UserDto getMyProfile();
}
