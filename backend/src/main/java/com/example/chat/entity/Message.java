package com.example.chat.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;

@Entity
public class Message {
    @Id
    @GeneratedValue
    private Long id;

    private String role;
    private String content;
    private OffsetDateTime timestamp;
    private String model;
    private String temperature;

    @ManyToOne
    private Conversation conversation;

    public Message() {}

    public Message(String role, String content, OffsetDateTime timestamp, Conversation conversation) {
        this.role = role;
        this.content = content;
        this.timestamp = timestamp;
        this.conversation = conversation;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public OffsetDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(OffsetDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public Conversation getConversation() {
        return conversation;
    }

    public void setConversation(Conversation conversation) {
        this.conversation = conversation;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getTemperature() {
        return temperature;
    }

    public void setTemperature(String temperature) {
        this.temperature = temperature;
    }
}