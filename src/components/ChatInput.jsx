import React, { useState } from 'react';

export const ChatInput = ({ sendMessage, isLoading, temperature, setTemperature }) => {
    const [message, setMessage] = useState('');
    const [showTemperature, setShowTemperature] = useState(false);

    const handleSend = () => {
        if (message.trim() && !isLoading) {
            sendMessage(message);
            setMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="pb-4 relative">
            {showTemperature && (
                <div className="absolute bottom-full mb-2 w-full bg-white border border-gray-200 p-3 rounded-md shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="font-medium text-sm">Temperature: {temperature}</div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={temperature}
                            onChange={(e) => setTemperature(parseFloat(e.target.value))}
                            className="flex-1 h-2 appearance-none rounded-full bg-gray-200"
                        />
                    </div>
                </div>
            )}

            <div className="relative">
                <div className="border border-gray-300 rounded-lg p-1 flex shadow-sm">
                    <input
                        type="text"
                        placeholder="Message ChatAI..."
                        className="flex-1 px-3 py-2 outline-none text-gray-700 rounded-lg"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                    />
                    <div className="flex items-center">
                        <button
                            type="button"
                            className="p-2 text-gray-500 hover:text-gray-700"
                            onClick={() => setShowTemperature(!showTemperature)}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            className={`p-2 rounded-md ${
                                isLoading || !message.trim()
                                    ? 'text-gray-400'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                            disabled={isLoading || !message.trim()}
                            onClick={handleSend}
                        >
                            {isLoading ? (
                                <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
                <div className="text-xs text-gray-500 mt-1 text-center">
                    ChatAI can make mistakes. Consider checking important information.
                </div>
            </div>
        </div>
    );
};
