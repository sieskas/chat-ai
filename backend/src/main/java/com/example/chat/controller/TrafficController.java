package com.example.chat.controller;

import com.example.chat.dto.TrafficData;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/traffic")
public class TrafficController {

    private static final String AUTH_TOKEN = "my-secret-token";
    private static final String VALID_LOCATION_ID = "store-001";

    @GetMapping
    public List<TrafficData> getMockTraffic(
            @RequestParam String token,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam String locationId) {

        if (!AUTH_TOKEN.equals(token)) {
            throw new RuntimeException("Unauthorized");
        }

        if (!VALID_LOCATION_ID.equals(locationId)) {
            throw new RuntimeException("Invalid locationId");
        }

        if (startDate.isAfter(endDate)) {
            throw new RuntimeException("startDate must be before endDate");
        }

        return generateMockTraffic(startDate, endDate);
    }

    private List<TrafficData> generateMockTraffic(LocalDate start, LocalDate end) {
        return start.datesUntil(end.plusDays(1))
                .map(date -> new TrafficData(date.toString(), new Random().nextInt(300)))
                .collect(Collectors.toList());
    }

}