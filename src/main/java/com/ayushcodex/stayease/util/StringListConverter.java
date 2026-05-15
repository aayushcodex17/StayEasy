package com.ayushcodex.stayease.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.*;

@Converter
public class StringListConverter implements AttributeConverter<Set<String>, String> {

    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(Set<String> attribute) {
        try {
            return mapper.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Could not convert list to JSON", e);
        }
    }

    @Override
    public Set<String> convertToEntityAttribute(String dbData) {
        try {
            if (dbData == null) return Collections.emptySet();
            String[] values=mapper.readValue(dbData, String[].class);
            return new HashSet<>(Arrays.asList(values));
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Could not convert JSON to list", e);
        }
    }
}
