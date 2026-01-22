(function() {
    // UPDATED BRANDING LOG
    console.log("%cChatGPT Search Peeper: Real-time Stream Reader (v1.5) active.", "color: #d75f40; font-weight: bold;");

    const originalFetch = window.fetch;

    const getUrl = (resource) => {
        if (typeof resource === 'string') return resource;
        if (resource instanceof Request) return resource.url;
        if (resource instanceof URL) return resource.href;
        return resource ? resource.toString() : '';
    };

    window.fetch = async function(...args) {
        let response;
        try {
            response = await originalFetch(...args);
        } catch (e) {
            throw e;
        }

        try {
            const url = getUrl(args[0]);
            
            if (url.includes('/conversation') || url.includes('/backend-api/')) {
                const clone = response.clone();
                readStreamChunkByChunk(clone);
            }
        } catch (err) {
            // Silently ignore stream errors to protect user experience
        }

        return response;
    };

    async function readStreamChunkByChunk(responseClone) {
        const reader = responseClone.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";
        let foundSoFar = new Set(); 

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;

                scanForQueries(buffer, foundSoFar);
            }
        } catch (err) { }
    }

    function scanForQueries(text, foundSoFar) {
        const regex = /"(?:search_)?queries"\s*:\s*\[(.*?)\]/g;
        let match;
        let newQueries = [];

        while ((match = regex.exec(text)) !== null) {
            try {
                const arrayString = `[${match[1]}]`;
                const parsed = JSON.parse(arrayString);
                
                parsed.forEach(q => {
                    if (typeof q === 'string' && q.trim().length > 2 && !foundSoFar.has(q)) {
                        foundSoFar.add(q);
                        newQueries.push(q);
                    }
                });
            } catch (e) { }
        }

        if (newQueries.length > 0) {
            window.postMessage({
                type: "AI_SEO_PEEPER_DATA",
                data: newQueries
            }, "*");
        }
    }

})();