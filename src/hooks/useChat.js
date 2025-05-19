import {useMutation} from '@tanstack/react-query';
import {mockChatResponse} from '../api/chatApi.js';
import {ensureTimestamps} from "../services/messageService.js";

export const useChat = () => {
    return useMutation(async ({ messages, model, temperature }) => {
        const messagesWithTimestamp = ensureTimestamps(messages);
        return await mockChatResponse(messagesWithTimestamp, model, temperature);
    });
};
