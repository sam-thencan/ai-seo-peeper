(function() {
    console.log("%cAI SEO Peeper: Real-time Stream Reader (v5) active.", "color: #00FF00; font-weight: bold;");

    const originalFetch = window.fetch;

    const getUrl = (resource) => {
        if (typeof resource === 'string') return resource;
        if (resource instanceof Request) return resource.url;
        if (resource instanceof URL) return resource.href;
        return resource ? resource.toString() : '';
    };

    window.fetch = async function(...args) {
        const url = getUrl(args[0]);
        const response = await originalFetch(...args);

        // Only hijack conversation streams
        if (url.includes('/conversation') || url.includes('/backend-api/')) {
            try {
                // Clone the response so we can read it without breaking the page
                const clone = response.clone();
                
                // START READING THE STREAM IMMEDIATELY
                readStreamChunkByChunk(clone);
            } catch (err) {
                // Stream locked or failed to clone
            }
        }

        return response;
    };

    async function readStreamChunkByChunk(responseClone) {
        const reader = responseClone.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";
        let foundSoFar = new Set(); // Keep track of what we've already sent

        try {
            while (true) {
                // 1. Read the next tiny packet of data
                const { done, value } = await reader.read();
                
                if (done) break;

                // 2. Add packet to our text buffer
                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;

                // 3. Scan the buffer for queries IMMEDIATELY
                scanForQueries(buffer, foundSoFar);
            }
        } catch (err) {
            // Stream interrupted (normal)
        }
    }

    function scanForQueries(text, foundSoFar) {
        // Regex: Matches "queries": ["...", "..."]
        const regex = /"(?:search_)?queries"\s*:\s*\[(.*?)\]/g;
        let match;
        let newQueries = [];

        while ((match = regex.exec(text)) !== null) {
            try {
                // Parse the array
                const arrayString = `[${match[1]}]`;
                const parsed = JSON.parse(arrayString);
                
                parsed.forEach(q => {
                    // Only process queries we haven't seen yet in this stream
                    if (typeof q === 'string' && q.trim().length > 2 && !foundSoFar.has(q)) {
                        foundSoFar.add(q);
                        newQueries.push(q);
                    }
                });
            } catch (e) { }
        }

        // 4. If we found NEW queries in this chunk, send them to UI immediately
        if (newQueries.length > 0) {
            console.log("AI SEO Peeper: ⚡ Live update:", newQueries);
            window.postMessage({
                type: "AI_SEO_PEEPER_DATA",
                data: newQueries
            }, "*");
        }
    }

})();