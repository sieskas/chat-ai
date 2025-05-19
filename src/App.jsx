import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { ChatInput } from './components/ChatInput';
import { useChat } from './hooks/useChat';

function App() {
    const {
        conversations,
        selectedConversation,
        selectConversation,
        messages,
        send,
        newConversation,
        renameConversation,
        isLoading
    } = useChat();

    const [model, setModel] = useState('gpt-4o');
    const [temperature, setTemperature] = useState(0.7);
    const [error, setError] = useState(null);

    const sendMessage = async (content) => {
        setError(null);
        try {
            // Pass the conversation title if it's a new conversation
            const title = selectedConversation?.title || "New conversation";
            await send(content, title, model, temperature);
        } catch (err) {
            console.error("Server error:", err);
            setError("Error when calling the server. Please try again.");
        }
    };

    return (
        <div className="flex h-screen bg-white">
            <Sidebar
                conversations={conversations}
                selectConversation={selectConversation}
                newConversation={newConversation}
                renameConversation={renameConversation}
                activeConversationId={selectedConversation?.id}
                model={model}
                setModel={setModel}
            />

            <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                    <div className="flex flex-col justify-between h-screen max-w-3xl mx-auto px-4 w-full">
                        <ChatWindow messages={messages} />
                        {error && (
                            <div className="text-red-600 text-sm mb-2">
                                {error}
                            </div>
                        )}
                        <ChatInput
                            sendMessage={sendMessage}
                            isLoading={isLoading}
                            temperature={temperature}
                            setTemperature={setTemperature}
                        />
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                        Select or create a new conversation
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
