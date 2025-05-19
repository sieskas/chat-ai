package com.example.chat.dto;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;

public class MessageDTO {
    private Long id;
    private String role;
    private String content;
    private OffsetDateTime timestamp;
    private Long conversationId;

    public MessageDTO() {}

    public MessageDTO(Long id, String role, String content, OffsetDateTime timestamp, Long conversationId) {
        this.id = id;
        this.role = role;
        this.content = content;
        this.timestamp = timestamp;
        this.conversationId = conversationId;
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

    public Long getConversationId() {
        return conversationId;
    }

    public void setConversationId(Long conversationId) {
        this.conversationId = conversationId;
    }
}