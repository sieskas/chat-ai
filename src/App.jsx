import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { ChatInput } from './components/ChatInput';
import { useChat } from './hooks/useChat';
import { v4 as uuidv4 } from 'uuid';

function App() {
    const [conversations, setConversations] = useState([]);
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [model, setModel] = useState('gpt-4o');
    const [temperature, setTemperature] = useState(0.7);
    const { mutateAsync, isLoading } = useChat();

    const activeConversation = conversations.find(c => c.id === activeConversationId);

    const sendMessage = async (content) => {
        if (!activeConversation) return;

        const timestamp = new Date().toLocaleString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const updatedMessages = [
            ...activeConversation.messages,
            {
                role: 'user',
                content,
                timestamp
            }
        ];

        setConversations(prev =>
            prev.map(c => c.id === activeConversationId ? { ...c, messages: updatedMessages } : c)
        );

        // Simuler la réponse du bot avec un message fixe "Bonjour"
        const botTimestamp = new Date().toLocaleString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Modifié pour toujours commencer par "Bonjour"
        setTimeout(() => {
            const botResponse = {
                role: 'assistant',
                content: `Bonjour! ${content}`, // Commence toujours par Bonjour
                timestamp: botTimestamp
            };

            setConversations(prev =>
                prev.map(c => c.id === activeConversationId ? {
                    ...c,
                    messages: [...updatedMessages, botResponse]
                } : c)
            );
        }, 1000);
    };

    const newConversation = (title) => {
        const newConv = { id: uuidv4(), title: title || `New chat`, messages: [] };
        setConversations([newConv, ...conversations]);
        setActiveConversationId(newConv.id);
    };

    const renameConversation = (id, newTitle) => {
        if (!newTitle.trim()) return;

        setConversations(prev =>
            prev.map(c => c.id === id ? { ...c, title: newTitle } : c)
        );
    };

    return (
        <div className="flex h-screen bg-white">
            <Sidebar
                conversations={conversations}
                selectConversation={setActiveConversationId}
                newConversation={newConversation}
                renameConversation={renameConversation}
                activeConversationId={activeConversationId}
                model={model}
                setModel={setModel}
            />

            <div className="flex-1 flex flex-col">
                {activeConversation ? (
                    <div className="flex flex-col justify-between h-screen max-w-3xl mx-auto px-4 w-full">
                        <ChatWindow messages={activeConversation.messages} />
                        <ChatInput
                            sendMessage={sendMessage}
                            isLoading={isLoading}
                            temperature={temperature}
                            setTemperature={setTemperature}
                        />
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                        Select or create a new chat
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
