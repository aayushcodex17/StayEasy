package com.ayushcodex.stayease.security;

import com.ayushcodex.stayease.dto.LoginDto;
import com.ayushcodex.stayease.dto.RegisterManagerRequestDto;
import com.ayushcodex.stayease.dto.SignUpRequestDto;
import com.ayushcodex.stayease.dto.UserDto;
import com.ayushcodex.stayease.entity.User;
import com.ayushcodex.stayease.entity.enums.Role;
import com.ayushcodex.stayease.exception.ResourceNotFoundException;
import com.ayushcodex.stayease.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JWTService jwtService;


    public UserDto signup(SignUpRequestDto signUpRequestDto){

        Optional<User> user = userRepository.findByEmail(signUpRequestDto.getEmail());

        if(user.isPresent()){
            throw new RuntimeException("User with already present with email:"+signUpRequestDto.getEmail());
        }

        User newUser = modelMapper.map(signUpRequestDto,User.class);
        newUser.setRoles(Set.of(Role.HOTEL_MANAGER));
        newUser.setPassword(passwordEncoder.encode(signUpRequestDto.getPassword()));
        newUser = userRepository.save(newUser);

        return modelMapper.map(newUser, UserDto.class);
    }

    public String[] login(LoginDto loginDto){

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginDto.getEmail(),loginDto.getPassword())
        );

        User user = (User) authentication.getPrincipal();

        String arr[] =new String[2];
        arr[0] = jwtService.generateAccessToken(user);
        arr[1] = jwtService.generateRefreshToken(user);

        return arr;
    }


    public UserDto registerAsManager(RegisterManagerRequestDto registerManagerRequestDto) {

        User user = userRepository.findByEmail(registerManagerRequestDto.getEmail())
                .orElseThrow(() ->new ResourceNotFoundException("User does esist with email: "+registerManagerRequestDto.getEmail()));

        user.setRoles(Set.of(Role.HOTEL_MANAGER));
        User newUser = userRepository.save(user);

        return modelMapper.map(newUser,UserDto.class);

    }

    public String refreshToken(String refreshToken){
        Long id = jwtService.getUserIdFromToken(refreshToken);

        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("USer not found with id:"+id));
        return jwtService.generateAccessToken(user);
    }
}
