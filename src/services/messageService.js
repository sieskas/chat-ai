export function ensureTimestamps(messages) {
    return messages.map(msg => {
        if (!msg.timestamp) {
            return {
                ...msg,
                timestamp: new Date().toLocaleString('fr-FR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            };
        }
        return msg;
    });
}
