const API_BASE_URL = "http://localhost:8080/api/chat";

export async function fetchConversations() {
    try {
        const response = await fetch(`${API_BASE_URL}/conversations`);
        if (!response.ok) {
            throw new Error(`Error loading conversations: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return [];
    }
}

export async function fetchMessagesByConversation(conversationId) {
    if (!conversationId || conversationId.toString().startsWith("temp")) {
        return [];
    }

    try {
        const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`);
        if (!response.ok) {
            throw new Error(`Error loading messages: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching messages for conversation ${conversationId}:`, error);
        return [];
    }
}

export async function sendMessageToServer({ content, role, timestamp, conversationId, title, model, temperature }) {
    try {
        const payload = {
            content,
            role,
            timestamp,
            ...(conversationId ? { conversationId } : {}),
            title: title || "New conversation",
            model,
            temperature
        };

        const response = await fetch(`${API_BASE_URL}/message`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
}

export async function updateConversationTitle(conversationId, newTitle) {
    try {
        const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/title`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ title: newTitle }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error updating conversation title: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error updating title for conversation ${conversationId}:`, error);
        throw error;
    }
}

export async function deleteConversation(conversationId) {
    try {
        const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error deleting conversation: ${response.status} ${response.statusText}`);
        }

        return true;
    } catch (error) {
        console.error(`Error deleting conversation ${conversationId}:`, error);
        throw error;
    }
}
