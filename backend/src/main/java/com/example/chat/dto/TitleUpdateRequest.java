package com.example.chat.dto;

public class TitleUpdateRequest {
    private String title;

    public TitleUpdateRequest() {
    }

    public TitleUpdateRequest(String title) {
        this.title = title;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }
}