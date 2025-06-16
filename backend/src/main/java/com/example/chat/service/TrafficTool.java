package com.example.chat.service;

import com.example.chat.dto.TrafficData;
import dev.langchain4j.agent.tool.Tool;

import java.util.List;

public interface  TrafficTool {
    @Tool("Generates daily traffic report JSON based on a token, start date, end date, and location ID")
    List<TrafficData> getTrafficReport(String token, String startDate, String endDate, String locationId);
}
