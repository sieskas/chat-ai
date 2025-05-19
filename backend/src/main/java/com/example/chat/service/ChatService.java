package com.example.chat.service;

import com.example.chat.entity.Conversation;
import com.example.chat.entity.Message;
import com.example.chat.repository.ConversationRepository;
import com.example.chat.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Service
public class ChatService {

    @Autowired
    private ConversationRepository conversationRepo;

    @Autowired
    private MessageRepository messageRepo;

    @Transactional
    public Message handleChat(Conversation conversation, Message userMessage) {
        if (userMessage == null) {
            throw new IllegalArgumentException("Message cannot be null");
        }

        if (conversation == null) {
            conversation = new Conversation();
            conversation.setTitle(conversation.getTitle());
            conversation = conversationRepo.save(conversation);
        } else if (conversation.getId() != null) {
            conversation = conversationRepo.findById(conversation.getId())
                    .orElseThrow(() -> new RuntimeException("Conversation not found: "));
        } else {
            conversation = conversationRepo.save(conversation);
        }

        userMessage.setConversation(conversation);
        messageRepo.save(userMessage);

        Message aiMessage = new Message();
        aiMessage.setRole("assistant");
        aiMessage.setContent("Automatically generated response for: " + userMessage.getContent());
        aiMessage.setTimestamp(OffsetDateTime.now(ZoneOffset.UTC));
        aiMessage.setConversation(conversation);
        messageRepo.save(aiMessage);
        return aiMessage;
    }

    public List<Conversation> getAllConversations() {
        return conversationRepo.findAll();
    }

    public List<Message> getMessagesByConversation(Long conversationId) {
        return messageRepo.findByConversationId(conversationId);
    }

    @Transactional
    public void deleteConversation(Long id) {
        conversationRepo.deleteById(id);
    }
}