package com.example.chat.service;

import com.example.chat.dto.TrafficData;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Component
public class TrafficToolImpl implements TrafficTool {

    @Override
    public List<TrafficData> getTrafficReport(String token, String startDate, String endDate, String locationId) {
        System.out.println("? TrafficTool called with: " + token + ", " + startDate + ", " + endDate + ", " + locationId);

        if (!"my-secret-token".equals(token)) {
            return List.of(new TrafficData("error", 0)); // or throw exception if preferred
        }

        if (!"store-001".equals(locationId)) {
            return List.of(new TrafficData("invalid-location", 0));
        }

        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        if (start.isAfter(end)) {
            return List.of(new TrafficData("invalid-range", 0));
        }

        return start.datesUntil(end.plusDays(1))
                .map(date -> new TrafficData(date.toString(), new Random().nextInt(300)))
                .collect(Collectors.toList());
    }
}
