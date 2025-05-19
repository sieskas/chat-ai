
export const mockChatResponse = async (messages, model, temperature) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Toujours commencer par "Bonjour"
            resolve({
                role: 'assistant',
                content: `Bonjour! ${messages[messages.length - 1].content}`,
                timestamp: new Date().toLocaleString('fr-FR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            });
        }, 1000); // simule une réponse en 1 seconde
    });
};
