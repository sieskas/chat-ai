import React, { useState, useRef } from 'react';

export const Sidebar = ({ conversations, selectConversation, newConversation, renameConversation, activeConversationId, model, setModel }) => {
    const [search, setSearch] = useState('');
    const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [newChatTitle, setNewChatTitle] = useState('');
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const inputRef = useRef(null);

    const handleNewChat = () => {
        setIsCreatingNew(true);
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const handleCreateChat = () => {
        const title = newChatTitle.trim() || "New chat";
        newConversation(title);
        setNewChatTitle('');
        setIsCreatingNew(false);
    };

    const handleStartRename = (id, currentTitle) => {
        setEditingId(id);
        setEditingTitle(currentTitle);
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const handleFinishRename = () => {
        if (editingId) {
            renameConversation(editingId, editingTitle);
            setEditingId(null);
            setEditingTitle('');
        }
    };

    // Secure conversations to avoid errors
    const safeConversations = conversations?.filter(c => c) || [];

    return (
        <aside className="w-64 bg-gray-50 h-screen flex flex-col border-r border-gray-100">
            <div className="p-3">
                {isCreatingNew ? (
                    <div className="flex mb-3 relative">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Enter chat name..."
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 pr-10"
                            value={newChatTitle}
                            onChange={(e) => setNewChatTitle(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCreateChat();
                                if (e.key === 'Escape') setIsCreatingNew(false);
                            }}
                        />
                        <button
                            onClick={handleCreateChat}
                            className="absolute right-0 top-0 h-full px-3 text-sm text-gray-700 rounded-r-md hover:bg-gray-200"
                            title="Create chat"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                            </svg>
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleNewChat}
                        className="w-full text-sm py-2 border border-gray-300 rounded-md hover:bg-gray-100 flex items-center justify-center gap-2 mb-3"
                    >
                        <span>+ New chat</span>
                    </button>
                )}
            </div>

            <div className="px-3 mb-3">
                <input
                    type="text"
                    placeholder="Search..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="flex-1 overflow-auto">
                <div className="px-3 py-1 text-xs font-medium text-gray-500">CHATS</div>
                <ul>
                    {safeConversations
                        .filter(c => {
                            // Check that c.title exists and is a string
                            const title = c.title || '';
                            return title.toLowerCase().includes((search || '').toLowerCase());
                        })
                        .map(conv => (
                            <li key={conv.id} className="px-3 py-1">
                                {editingId === conv.id ? (
                                    <div className="flex relative">
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 pr-10"
                                            value={editingTitle}
                                            onChange={(e) => setEditingTitle(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleFinishRename();
                                                if (e.key === 'Escape') {
                                                    setEditingId(null);
                                                    setEditingTitle('');
                                                }
                                            }}
                                        />
                                        <button
                                            onClick={handleFinishRename}
                                            className="absolute right-0 top-0 h-full px-3 text-sm text-gray-700 rounded-r-md hover:bg-gray-200"
                                            title="Save"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center group">
                                        <button
                                            className={`flex-1 text-left px-3 py-2 rounded-md text-sm ${
                                                conv.id === activeConversationId ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'
                                            }`}
                                            onClick={() => selectConversation(conv.id)}
                                        >
                                            {conv.title || 'Untitled Chat'}
                                        </button>
                                        <button
                                            className="p-1 text-gray-400 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => handleStartRename(conv.id, conv.title || '')}
                                            title="Rename"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </li>
                        ))}
                </ul>
            </div>

            <div className="border-t border-gray-100 p-3">
                <div className="relative">
                    <button
                        className="flex items-center justify-between w-full px-3 py-2 text-sm text-left text-gray-700 rounded-md hover:bg-gray-100"
                        onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                    >
                        <span className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            {model}
                        </span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {isModelDropdownOpen && (
                        <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                            <div className="py-1">
                                {['gpt-4o', 'gpt-4', 'gpt-3.5-turbo'].map((m) => (
                                    <button
                                        key={m}
                                        className={`block w-full px-4 py-2 text-left text-sm ${model === m ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                                        onClick={() => {
                                            setModel(m);
                                            setIsModelDropdownOpen(false);
                                        }}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};
