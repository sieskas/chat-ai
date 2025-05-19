
export async function fetchConversations() {
    try {
        const response = await fetch("http://localhost:8080/api/chat/conversations");
        if (!response.ok) {
            throw new Error(`Error loading conversations: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching conversations:", error);
        throw error;
    }
}

export async function fetchMessagesByConversation(conversationId) {
    if (!conversationId || conversationId.toString().startsWith("temp")) {
        return [];
    }

    try {
        const response = await fetch(`http://localhost:8080/api/chat/conversations/${conversationId}/messages`);
        if (!response.ok) {
            throw new Error(`Error loading messages: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching messages for conversationId=${conversationId}:`, error);
        throw error;
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

        const response = await fetch("http://localhost:8080/api/chat/message", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
}

export async function updateConversationTitle(conversationId, newTitle) {
    try {
        const payload = {
            title: newTitle
        };

        const response = await fetch(`http://localhost:8080/api/chat/conversations/${conversationId}/title`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Error updating conversation title: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error updating title for conversationId=${conversationId}:`, error);
        throw error;
    }
}

export async function deleteConversation(conversationId) {
    try {
        const response = await fetch(`http://localhost:8080/api/chat/conversations/${conversationId}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error(`Error deleting conversation: ${response.status}`);
        }

        return true;
    } catch (error) {
        console.error(`Error deleting conversation ${conversationId}:`, error);
        throw error;
    }
}
