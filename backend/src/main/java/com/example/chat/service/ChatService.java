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

    @Autowired
    private OpenAIService openAIService;

    @Transactional
    public Message handleChat(Conversation conversation, Message userMessage) {
        if (userMessage == null) {
            throw new IllegalArgumentException("Message cannot be null");
        }

        // Handle conversation
        if (conversation == null) {
            conversation = new Conversation();
            conversation.setTitle("New conversation");
        }

        if (conversation.getId() != null) {
            // Existing conversation
            conversation = conversationRepo.findById(conversation.getId())
                    .orElseThrow(() -> new RuntimeException("Conversation not found"));
        } else {
            // New conversation
            if (conversation.getTitle() == null || conversation.getTitle().trim().isEmpty()) {
                conversation.setTitle("New conversation");
            }
            conversation = conversationRepo.save(conversation);
        }

        // Save user message
        userMessage.setConversation(conversation);
        messageRepo.save(userMessage);

        // Generate AI response
        Message aiMessage = new Message();
        try {
            // Call ChatGPT via OpenAI
            String aiResponse = openAIService.generateChatResponse(userMessage.getContent());
            aiMessage.setContent(aiResponse);
        } catch (Exception e) {
            // Fallback response in case of OpenAI error
            System.err.println("Error calling OpenAI: " + e.getMessage());
            aiMessage.setContent("I'm sorry, something went wrong. Could you please rephrase your question?");
        }

        aiMessage.setRole("assistant");
        aiMessage.setTimestamp(OffsetDateTime.now(ZoneOffset.UTC));
        aiMessage.setConversation(conversation);
        messageRepo.save(aiMessage);

        return aiMessage;
    }

    @Transactional(readOnly = true)
    public List<Conversation> getAllConversations() {
        return conversationRepo.findAll();
    }

    @Transactional(readOnly = true)
    public List<Message> getMessagesByConversation(Long conversationId) {
        return messageRepo.findByConversationId(conversationId);
    }

    @Transactional
    public void deleteConversation(Long id) {
        conversationRepo.deleteById(id);
    }

    @Transactional
    public Conversation updateConversationTitle(Long id, String newTitle) {
        Conversation conversation = conversationRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Conversation not found with id: " + id));

        conversation.setTitle(newTitle);
        return conversationRepo.save(conversation);
    }
}
