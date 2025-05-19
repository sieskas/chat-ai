
import React from 'react';

export const ChatWindow = ({ messages }) => {
    return (
        <div className="flex-1 overflow-auto py-4 w-full">
            {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <h1 className="text-2xl font-semibold mb-8">ChatAI</h1>
                    <div className="max-w-md text-center">
                        <p className="mb-6">Ask me anything about any topic, or let me help you with tasks.</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-6 max-w-3xl mx-auto">
                    {messages.map((msg, idx) => (
                        <div key={idx}
                             className={`flex flex-col ${msg.role === 'assistant' ? 'items-start' : 'items-end'}`}>
                            {/* Label that shows "You" or "AI Assistant" */}
                            <div className="text-xs font-medium text-gray-500 mb-1 px-1">
                                {msg.role === 'assistant' ? 'AI Assistant' : 'You'}
                            </div>

                            <div className={`max-w-[90%] px-4 py-3 rounded-lg ${
                                msg.role === 'assistant'
                                    ? 'bg-gray-100 text-gray-800'
                                    : 'bg-gray-700 text-white'
                            }`}>
                                <div className="whitespace-pre-wrap">{msg.content}</div>
                            </div>

                            {/* Timestamp at the bottom of the message */}
                            <div className="text-xs text-gray-400 mt-1 px-1">
                                {msg.timestamp ? new Date(msg.timestamp).toLocaleString() : new Date().toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
