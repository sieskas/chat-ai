import { useState, useEffect } from "react";
import {
    fetchConversations,
    fetchMessagesByConversation,
    sendMessageToServer,
    deleteConversation as deleteConversationApi,
    updateConversationTitle,
} from "../api/chatApi";

export function useChat() {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Charger les conversations au démarrage
    useEffect(() => {
        fetchConversations()
            .then(setConversations)
            .catch(err => {
                console.error("Error loading conversations:", err);
            });
    }, []);

    // Charger les messages quand la conversation sélectionnée change
    useEffect(() => {
        if (selectedConversation && selectedConversation.id !== undefined && !selectedConversation.id.toString().startsWith("temp")) {
            fetchMessagesByConversation(selectedConversation.id)
                .then(setMessages)
                .catch(err => {
                    console.error(`Error loading messages for conversation ${selectedConversation.id}:`, err);
                });
        } else if (!selectedConversation || !selectedConversation.id.toString().startsWith("temp")) {
            setMessages([]);
        }
    }, [selectedConversation?.id]);

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
            // Ajouter le message utilisateur immédiatement
            setMessages(prev => [...prev, { ...userMessage, fromClient: true }]);

            // Envoyer au serveur
            const response = await sendMessageToServer(userMessage);

            // Mettre à jour les messages
            setMessages(prev => {
                const filtered = prev.filter(m => !m.fromClient);
                const finalUserMessage = {
                    ...userMessage,
                    conversationId: response.conversationId || userMessage.conversationId,
                };
                return [...filtered, finalUserMessage, response];
            });

            // Si c'est une nouvelle conversation ou une conversation temporaire qui devient permanente
            if (response.conversationId &&
                (!selectedConversation || selectedConversation.id !== response.conversationId || isTempId)) {

                // Récupérer toutes les conversations mises à jour
                const allConversations = await fetchConversations();
                setConversations(allConversations);

                // Trouver et sélectionner la nouvelle conversation
                const newConversation = allConversations.find(c => c.id === response.conversationId);
                if (newConversation) {
                    setSelectedConversation(newConversation);
                } else {
                    // Fallback: créer un objet conversation temporaire
                    setSelectedConversation({
                        id: response.conversationId,
                        title: title || "New conversation",
                    });
                }
            }

        } catch (err) {
            console.error("Error in useChat.send:", err);
            // En cas d'erreur, supprimer le message temporaire
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
            isTemp: true
        };
        setConversations([newConv, ...conversations]);
        setSelectedConversation(newConv);
        setMessages([]);
    };

    const renameConversation = async (id, newTitle) => {
        const trimmedTitle = newTitle.trim() || "Untitled";

        // Mise à jour optimiste de l'interface
        setConversations(prev =>
            prev.map(c => c.id === id ? { ...c, title: trimmedTitle } : c)
        );

        if (selectedConversation && selectedConversation.id === id) {
            setSelectedConversation(prev => ({ ...prev, title: trimmedTitle }));
        }

        // Pour les conversations temporaires, pas d'appel API
        if (id.toString().startsWith("temp")) {
            return;
        }

        try {
            await updateConversationTitle(id, trimmedTitle);
            // Actualiser la liste pour assurer la cohérence
            const updatedConversations = await fetchConversations();
            setConversations(updatedConversations);
        } catch (error) {
            console.error(`Error renaming conversation ${id}:`, error);
            // Restaurer l'état précédent en cas d'erreur
            const updatedConversations = await fetchConversations();
            setConversations(updatedConversations);
            throw error;
        }
    };

    const deleteConversation = async (id) => {
        try {
            // Appel API seulement pour les conversations permanentes
            if (!id.toString().startsWith("temp")) {
                await deleteConversationApi(id);
            }

            // Supprimer de la liste
            setConversations(prevConversations =>
                prevConversations.filter(c => c.id !== id)
            );

            // Si c'était la conversation sélectionnée, la désélectionner
            if (selectedConversation && selectedConversation.id === id) {
                setSelectedConversation(null);
                setMessages([]);
            }

            return true;
        } catch (error) {
            console.error(`Error deleting conversation ${id}:`, error);
            throw error;
        }
    };

    return {
        conversations,
        selectedConversation,
        selectConversation,
        messages,
        send,
        newConversation,
        renameConversation,
        deleteConversation,
        isLoading,
    };
}
