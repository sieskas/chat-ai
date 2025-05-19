import { useState, useEffect } from "react";
import {
    fetchConversations,
    fetchMessagesByConversation,
    sendMessageToServer,
} from "../api/chatApi";

export function useChat() {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchConversations()
            .then(setConversations)
            .catch(err => {
                console.error("Error loading conversations:", err);
            });
    }, []);

    useEffect(() => {
        if (selectedConversation && selectedConversation.id !== undefined) {
            fetchMessagesByConversation(selectedConversation.id)
                .then(setMessages)
                .catch(err => {
                    console.error(`Error loading messages for conversation ${selectedConversation.id}:`, err);
                });
        } else {
            setMessages([]);
        }
    }, [selectedConversation]);

    const selectConversation = (id) => {
        const conversation = conversations.find(c => c.id === id);
        if (conversation) {
            setSelectedConversation(conversation);
        } else {
            console.error(`Conversation with ID ${id} not found`);
        }
    };

    const send = async (content, title, model, temperature) => {
        setIsLoading(true);

        const isTempId = selectedConversation?.id?.toString().startsWith("temp");
        const userMessage = {
            role: "user",
            content,
            timestamp: new Date().toISOString(),
            conversationId: !isTempId ? selectedConversation?.id : null,
            title: title,
            model,
            temperature,
        };

        try {
            setMessages(prev => [...prev, { ...userMessage, fromClient: true }]);

            const response = await sendMessageToServer(userMessage);

            if (response.conversationId &&
                (!selectedConversation || selectedConversation.id !== response.conversationId)) {

                const all = await fetchConversations();
                setConversations(all);

                const newConv = all.find(c => c.id === response.conversationId);
                if (newConv) {
                    setSelectedConversation(newConv);
                } else {
                    setSelectedConversation({
                        id: response.conversationId,
                        title: "New conversation",
                    });
                }
            }

            setMessages(prev => {
                const filtered = prev.filter(m => !m.fromClient);

                const userMsg = {
                    ...userMessage,
                    conversationId: response.conversationId || userMessage.conversationId
                };

                // Return updated list
                return [...filtered, userMsg, response];
            });

        } catch (err) {
            console.error("Error in useChat.send:", err);
            setMessages(prev => prev.filter(m => !m.fromClient));
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const newConversation = (title) => {
        const tempId = `temp-${Date.now()}`;
        const newConv = {
            id: tempId,
            title: title || "New chat",
            isTemp: true // Mark as temporary
        };
        setConversations([newConv, ...conversations]);
        setSelectedConversation(newConv);
        setMessages([]);
    };

    const renameConversation = (id, newTitle) => {
        setConversations(prev =>
            prev.map(c =>
                c.id === id ? {...c, title: newTitle.trim() || "Untitled"} : c
            )
        );
    };

    return {
        conversations,
        selectedConversation,
        setSelectedConversation,
        selectConversation,
        messages,
        send,
        newConversation,
        renameConversation,
        isLoading,
    };
}
