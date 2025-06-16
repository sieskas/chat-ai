package com.example.chat.service;

import com.example.chat.dto.TrafficData;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import dev.langchain4j.agent.tool.Tool;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import dev.langchain4j.service.AiServices;
import dev.langchain4j.service.SystemMessage;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static dev.langchain4j.model.openai.OpenAiChatModelName.GPT_4_O;

@Service
public class OpenAIService {

    private final WebClient webClient;
    private final XmlMapper xmlMapper;

    // DTO classes for XML parsing
    @Data
    @JacksonXmlRootElement(localName = "TRAFFIC")
    static class TrafficResponse {
        @JacksonXmlProperty(localName = "data")
        @JacksonXmlElementWrapper(useWrapping = false)
        private List<TrafficDataXml> data;

        @JacksonXmlProperty(localName = "outputMessage")
        private OutputMessage outputMessage;
    }

    @Data
    static class TrafficDataXml {
        @JacksonXmlProperty(isAttribute = true)
        private String storeId;

        @JacksonXmlProperty(isAttribute = true)
        private String trafficDate;

        @JacksonXmlProperty(isAttribute = true)
        private String trafficValue;

        @JacksonXmlProperty(isAttribute = true)
        private String passByTrafficValue;
    }

    @Data
    static class OutputMessage {
        @JacksonXmlProperty(isAttribute = true)
        private String text;
    }

    // Ajoutez d'abord une nouvelle classe DTO pour les donnees avec store ID
    @Data
    public class TrafficDataWithStore {
        private String date;
        private String storeId;
        private int visitors;

        public TrafficDataWithStore(String date, String storeId, int visitors) {
            this.date = date;
            this.storeId = storeId;
            this.visitors = visitors;
        }
    }

    @Tool("Generates daily traffic report JSON based on a token, start date, end date, location ID, and request type (default: tdd)")
    public Object getTrafficReport(String token, String startDate, String endDate, String locationId, String requestType) {
        System.out.println("? TrafficTool called with: " + token + ", " + startDate + ", " + endDate + ", " + locationId + ", " + requestType);

        try {
            // Parse dates
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);

            if (start.isAfter(end)) {
                return List.of(new TrafficData("invalid-range", 0));
            }

            // Format dates for API (MM/dd/yyyy-HH|mm)
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/dd/yyyy");
            String fromDate = start.format(formatter) + "-00|00";
            String toDate = end.format(formatter) + "-23|00";
            String validatedReqType = "td".equals(requestType) ? "td" : "tdd";

            // Call external API
            String responseXml = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/tmas/manTrafExp")
                            .queryParam("fromDate", fromDate)
                            .queryParam("toDate", toDate)
                            .queryParam("interval", "1440")
                            .queryParam("hours", "1")
                            .queryParam("reqType", validatedReqType)
                            .queryParam("apiKey", token)
                            .queryParam("locationId", locationId)
                            .build())
                    .retrieve()
                    .bodyToMono(String.class)
                    .onErrorResume(error -> {
                        System.err.println("Error calling API: " + error.getMessage());
                        return Mono.just("<TRAFFIC><outputMessage text=\"API Error\"/></TRAFFIC>");
                    })
                    .block();

            // Parse XML response
            TrafficResponse trafficResponse = xmlMapper.readValue(responseXml, TrafficResponse.class);

            // Check for errors
            if (trafficResponse.getOutputMessage() != null &&
                    trafficResponse.getOutputMessage().getText().contains("Error")) {
                return List.of(new TrafficData("error", 0));
            }

            // If request type is "tdd", return data with store IDs
            if ("tdd".equals(validatedReqType)) {
                List<TrafficDataWithStore> detailedData = new ArrayList<>();

                if (trafficResponse.getData() != null) {
                    for (TrafficDataXml xmlData : trafficResponse.getData()) {
                        String date = xmlData.getTrafficDate().split(" ")[0];
                        String storeId = xmlData.getStoreId();
                        int value = (int) Double.parseDouble(xmlData.getTrafficValue());

                        detailedData.add(new TrafficDataWithStore(date, storeId, value));
                    }
                }

                // Sort by date then by store ID
                return detailedData.stream()
                        .sorted((a, b) -> {
                            int dateComp = a.getDate().compareTo(b.getDate());
                            if (dateComp != 0) return dateComp;
                            return a.getStoreId().compareTo(b.getStoreId());
                        })
                        .collect(Collectors.toList());
            }

            // For "td" type, aggregate data by date (original behavior)
            Map<String, Double> aggregatedData = new HashMap<>();

            if (trafficResponse.getData() != null) {
                for (TrafficDataXml xmlData : trafficResponse.getData()) {
                    String date = xmlData.getTrafficDate().split(" ")[0];
                    double value = Double.parseDouble(xmlData.getTrafficValue());
                    aggregatedData.merge(date, value, Double::sum);
                }
            }

            // Convert to list of TrafficData
            return aggregatedData.entrySet().stream()
                    .sorted(Map.Entry.comparingByKey())
                    .map(entry -> new TrafficData(entry.getKey(), entry.getValue().intValue()))
                    .collect(Collectors.toList());

        } catch (Exception e) {
            System.err.println("Error processing traffic data: " + e.getMessage());
            return List.of(new TrafficData("error", 0));
        }
    }

    interface Assistant {
        @SystemMessage("""
                You are an assistant helping a user generate a traffic report.
                    
                IMPORTANT: Always call the getTrafficReport tool when the user provides all required information,
                even if you think you've already generated a report. Each request should be treated as new.
                    
                If the user provides all information at once (token, start date, end date, location ID, and request type),
                immediately call the getTrafficReport tool without asking questions.
                    
                Otherwise, ask the user for the following 5 pieces of information, one by one:
                1. The authentication token (API key)
                2. The start date (format: YYYY-MM-DD)
                3. The end date
                4. The location ID
                5. The request type: "td" for aggregated data or "tdd" to see data per store

                Once all the information is collected and you receive the data, generate:
                    
                1. A markdown table showing the traffic data:
                   - If request type is "td": Show aggregated daily traffic (Date | Total Visitors)
                   - If request type is "tdd": Show data per store (Date | Store ID | Visitors)
                   
                   CRITICAL: You MUST display ALL rows of data in the table. NEVER truncate or abbreviate the table with "..." or similar.
                   If there are 100 rows, show all 100 rows. The user needs to see the complete dataset.
                   
                2. HTML code with Chart.js to create a line chart visualization
                    
                CRITICAL CHART.JS RULES - FOLLOW EXACTLY:
                    
                ?? NEVER EVER include this line: <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                ?? NEVER include ANY <script src="..."> tags - Chart.js is ALREADY LOADED
                ?? Start your HTML code DIRECTLY with the <canvas> tag
                    
                You MUST generate code EXACTLY like this structure:
                    
                ```html
                <canvas id="trafficChart" width="800" height="400"></canvas>
                <script>
                var ctx = document.getElementById('trafficChart').getContext('2d');
                var chart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: ['2025-05-01', '2025-05-02', '2025-05-03', ...], // ALL ACTUAL dates
                        datasets: [
                            {
                                label: 'Store 123', // ACTUAL store ID
                                data: [2257, 2299, 2486, ...], // ALL ACTUAL values
                                borderColor: 'rgb(75, 192, 192)',
                                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                tension: 0.1
                            },
                            // More datasets for each store
                        ]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            title: {
                                display: true,
                                text: 'Daily Traffic Report'
                            },
                            legend: {
                                display: true,
                                position: 'top'
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Number of Visitors'
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: 'Date'
                                }
                            }
                        }
                    }
                });
                </script>
                ```
                    
                MANDATORY REQUIREMENTS:
                1. NO <script src="..."> tags whatsoever - Chart.js is pre-loaded
                2. Use ACTUAL dates from the data in labels array - no comments
                3. Use ACTUAL store IDs from the data for dataset labels
                4. Use ACTUAL traffic values in data arrays - no placeholders
                5. Include ALL dates and ALL values - no ellipsis (...)
                6. Different color for each store dataset
                7. Start with <canvas> tag, NOT with <script src="...">
                    
                FORBIDDEN:
                ? <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                ? <script src="..."> of any kind
                ? Comments like /* dates */ or /* values */
                ? Ellipsis (...) in arrays
                ? Placeholder text instead of real data
                """)
        String chat(String userMessage);
    }

    private Assistant assistant;

    public OpenAIService(@Value("${openai.api.key}") String apiKey,
                         @Value("${traffic.api.baseUrl:https://preview.smssoftware.net}") String baseUrl) {

        // Initialize WebClient
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .build();

        // Initialize XmlMapper
        this.xmlMapper = new XmlMapper();

        ChatModel model = OpenAiChatModel.builder()
                .apiKey(apiKey)
                .modelName(GPT_4_O)
                .strictTools(true)
                .build();

        assistant = AiServices.builder(Assistant.class)
                .chatModel(model)
                .tools(this)  // Use 'this' instead of creating a new Calculator instance
                .chatMemory(MessageWindowChatMemory.withMaxMessages(10))
                .build();
    }

    public String generateChatResponse(String userMessage) {
        String response = assistant.chat(userMessage);
        System.out.println(response);
        return response;
    }
}