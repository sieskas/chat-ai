import React, { useEffect, useRef } from 'react';

export const ChatWindow = ({ messages }) => {
    const containerRef = useRef(null);

    // Auto-scroll vers le bas quand de nouveaux messages arrivent
    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }, [messages]);

    // Exécuter les scripts Chart.js après le rendu
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Attendre que le DOM soit mis à jour
        setTimeout(() => {
            // Chercher tous les éléments canvas avec data-chart
            const chartCanvases = container.querySelectorAll('canvas[data-chart]');

            chartCanvases.forEach((canvas) => {
                const chartData = canvas.getAttribute('data-chart');
                if (chartData && !canvas.hasAttribute('data-chart-initialized')) {
                    try {
                        // Marquer comme initialisé pour éviter les doublons
                        canvas.setAttribute('data-chart-initialized', 'true');

                        // Parser les données du graphique
                        const config = JSON.parse(chartData);

                        // Créer le graphique Chart.js
                        if (window.Chart) {
                            new window.Chart(canvas, config);
                        } else {
                            console.warn('Chart.js n\'est pas chargé');
                        }
                    } catch (error) {
                        console.error('Erreur lors de la création du graphique:', error);
                    }
                }
            });

            // Chercher et exécuter les scripts Chart.js avec le type spécial
            const scripts = container.querySelectorAll('script[type="text/chart-js"]');
            scripts.forEach((script) => {
                if (!script.hasAttribute('data-executed')) {
                    script.setAttribute('data-executed', 'true');
                    try {
                        // Nettoyer le contenu du script des balises HTML
                        let scriptContent = script.textContent;

                        // Supprimer les <br> tags et autres balises HTML
                        scriptContent = scriptContent
                            .replace(/<br\s*\/?>/gi, '\n')  // Remplacer <br> par des nouvelles lignes
                            .replace(/<[^>]+>/g, '')         // Supprimer toutes les autres balises HTML
                            .trim();

                        // Exécuter seulement si le contenu est propre
                        if (scriptContent && !scriptContent.includes('<')) {
                            const func = new Function(scriptContent);
                            func();
                        } else if (scriptContent.includes('<')) {
                            console.error('Le script contient encore du HTML après nettoyage:', scriptContent);
                        }
                    } catch (error) {
                        console.error('Erreur lors de l\'exécution du script Chart.js:', error);
                    }
                }
            });
        }, 100);
    }, [messages]);

    // Parser le contenu pour détecter et transformer le code Chart.js
    const parseChartContent = (content) => {
        // Détecter les blocs HTML avec Canvas et Script Chart.js
        const htmlChartRegex = /```html\s*([\s\S]*?)```/gi;

        let parsedContent = content.replace(htmlChartRegex, (match, htmlCode) => {
            // Si le code HTML contient Chart.js, le traiter spécialement
            if (htmlCode.includes('Chart') || htmlCode.includes('canvas')) {
                // Générer un ID unique pour éviter les conflits
                const uniqueId = `chart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                // Parser le HTML pour extraire canvas et script séparément
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlCode, 'text/html');

                const canvasEl = doc.querySelector('canvas');
                const scriptEl = doc.querySelector('script');

                if (canvasEl && scriptEl) {
                    // Mettre à jour l'ID du canvas
                    const oldId = canvasEl.id || 'chart';
                    canvasEl.id = uniqueId;

                    // Mettre à jour le script pour utiliser le nouvel ID
                    let scriptContent = scriptEl.textContent;
                    scriptContent = scriptContent.replace(
                        new RegExp(`getElementById\\(['"]${oldId}['"]\\)`, 'g'),
                        `getElementById('${uniqueId}')`
                    );

                    // Créer le HTML final
                    return `<div class="chart-container" style="margin: 20px 0; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #fafafa;">
                        <canvas id="${uniqueId}" width="${canvasEl.width || 400}" height="${canvasEl.height || 200}"></canvas>
                        <script type="text/chart-js">${scriptContent}</script>
                    </div>`;
                }
            }

            // Si on ne peut pas parser correctement, afficher comme du code
            return `<pre><code class="language-html">${htmlCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
        });

        // Détecter les blocs de code JavaScript avec Chart.js
        const jsChartRegex = /```(?:javascript|js)\s*((?:.*?Chart.*?|.*?canvas.*?|.*?new Chart.*?)[\s\S]*?)```/gi;

        parsedContent = parsedContent.replace(jsChartRegex, (match, code) => {
            if (code.includes('Chart') || code.includes('canvas')) {
                // Générer un ID unique
                const uniqueId = `chart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                // Essayer d'extraire la configuration Chart.js
                const configMatch = code.match(/new Chart\([^,]+,\s*({[\s\S]*})\s*\)/);

                if (configMatch) {
                    try {
                        // Valider que c'est du JSON valide
                        const configStr = configMatch[1];
                        // On ne parse pas ici car le code pourrait contenir des fonctions

                        return `
                            <div class="chart-container" style="position: relative; height: 400px; margin: 20px 0; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #fafafa;">
                                <canvas id="${uniqueId}"></canvas>
                                <script type="text/chart-js">
                                    (function() {
                                        ${code.replace(/getElementById\(['"][^'"]+['"]\)/, `getElementById('${uniqueId}')`)}
                                    })();
                                </script>
                            </div>
                        `;
                    } catch (e) {
                        // Si erreur, afficher comme code normal
                    }
                }
            }

            // Code JavaScript normal
            return `<pre><code class="language-javascript">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
        });

        return parsedContent;
    };

    // Fonction pour traiter le contenu Markdown simple
    const parseMarkdown = (content) => {
        // First, protect code blocks from markdown processing
        const codeBlocks = [];
        let protectedContent = content;

        // Protect inline code blocks
        protectedContent = protectedContent.replace(/```[\s\S]*?```/g, (match) => {
            const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
            codeBlocks.push(match);
            return placeholder;
        });

        // Apply markdown transformations
        let processedContent = protectedContent
            // Headers
            .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
            // Bold
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Tables
            .replace(/(\n\|.*?\|\n(?:\|.*?\|\n)*)/g, (match) => {
                const lines = match.trim().split('\n');
                if (lines.length < 3) return match;

                let tableHtml = '<table class="min-w-full border-collapse border border-gray-300 my-4">\n';

                // Header
                const headerCells = lines[0].split('|').slice(1, -1);
                tableHtml += '<thead><tr>';
                headerCells.forEach(cell => {
                    tableHtml += `<th class="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold">${cell.trim()}</th>`;
                });
                tableHtml += '</tr></thead>\n<tbody>';

                // Data rows
                for (let i = 2; i < lines.length; i++) {
                    if (lines[i].includes('|')) {
                        const cells = lines[i].split('|').slice(1, -1);
                        tableHtml += '<tr>';
                        cells.forEach(cell => {
                            tableHtml += `<td class="border border-gray-300 px-4 py-2">${cell.trim()}</td>`;
                        });
                        tableHtml += '</tr>';
                    }
                }

                tableHtml += '</tbody></table>';
                return tableHtml;
            })
            // Line breaks (but not inside protected code blocks)
            .replace(/\n/g, '<br>');

        // Restore code blocks
        codeBlocks.forEach((block, index) => {
            processedContent = processedContent.replace(`__CODE_BLOCK_${index}__`, block);
        });

        return processedContent;
    };

    return (
        <>
            {/* S'assurer que Chart.js est chargé */}
            {typeof window !== 'undefined' && !window.Chart && (
                <script
                    src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"
                    onLoad={() => console.log('Chart.js chargé')}
                />
            )}

            <div className="flex-1 overflow-auto py-4 w-full" ref={containerRef}>
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
                                <div className="text-xs font-medium text-gray-500 mb-1 px-1">
                                    {msg.role === 'assistant' ? 'AI Assistant' : 'You'}
                                </div>

                                <div className={`max-w-[90%] px-4 py-3 rounded-lg ${
                                    msg.role === 'assistant'
                                        ? 'bg-gray-100 text-gray-800'
                                        : 'bg-gray-700 text-white'
                                }`}>
                                    {msg.role === 'assistant' ? (
                                        <div
                                            className="prose max-w-full"
                                            dangerouslySetInnerHTML={{
                                                __html: parseChartContent(parseMarkdown(msg.content))
                                            }}
                                        />
                                    ) : (
                                        <div className="whitespace-pre-wrap">{msg.content}</div>
                                    )}
                                </div>

                                <div className="text-xs text-gray-400 mt-1 px-1">
                                    {msg.timestamp ? new Date(msg.timestamp).toLocaleString() : new Date().toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};
