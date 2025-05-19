package com.example.chat.controller;

import com.example.chat.dto.ConversationDTO;
import com.example.chat.dto.MessageDTO;
import com.example.chat.dto.MessageRequest;
import com.example.chat.dto.MessageResponse;
import com.example.chat.entity.Conversation;
import com.example.chat.entity.Message;
import com.example.chat.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping("/message")
    public ResponseEntity<MessageResponse> sendMessage(@RequestBody MessageRequest request) {

        Conversation conversation = new Conversation();
        conversation.setId(request.getConversationId());
        conversation.setTitle(request.getTitle());

        Message userMessage = new Message();
        userMessage.setRole(request.getRole());
        userMessage.setContent(request.getContent());
        OffsetDateTime timestamp = OffsetDateTime.parse(request.getTimestamp());
        userMessage.setTimestamp(timestamp);

        Message aiMessage = chatService.handleChat(conversation, userMessage);

        MessageResponse response = new MessageResponse();
        response.setId(aiMessage.getId());
        response.setRole(aiMessage.getRole());
        response.setContent(aiMessage.getContent());
        response.setTimestamp(aiMessage.getTimestamp().toString());
        response.setConversationId(aiMessage.getConversation().getId());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationDTO>> getAllConversations() {
        return ResponseEntity.ok(
                chatService.getAllConversations().stream()
                        .map(conv -> new ConversationDTO(conv.getId(), conv.getTitle()))
                        .collect(Collectors.toList())
        );
    }

    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<List<MessageDTO>> getMessagesByConversation(@PathVariable Long id) {
        return ResponseEntity.ok(
                chatService.getMessagesByConversation(id).stream()
                        .map(msg -> new MessageDTO(
                                msg.getId(),
                                msg.getRole(),
                                msg.getContent(),
                                msg.getTimestamp(),
                                msg.getConversation().getId()))
                        .collect(Collectors.toList())
        );
    }

    @DeleteMapping("/conversations/{id}")
    public ResponseEntity<Void> deleteConversation(@PathVariable Long id) {
        chatService.deleteConversation(id);
        return ResponseEntity.noContent().build();
    }
}