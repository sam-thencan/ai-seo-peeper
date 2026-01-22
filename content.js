// 1. Listen for messages from injected.js (The Main World script)
window.addEventListener("message", (event) => {
    if (event.source !== window) return;

    if (event.data.type && event.data.type === "AI_SEO_PEEPER_DATA") {
        const queries = event.data.data;
        if (queries && queries.length > 0) {
            updatePeeperUI(queries);
        }
    }
});

// 2. UI Logic
function createBaseUI() {
    const existing = document.getElementById('ai-seo-peeper-box');
    if (existing) return existing;

    const container = document.createElement('div');
    container.id = 'ai-seo-peeper-box';
    
    // Notification Dot
    const dot = document.createElement('div');
    dot.className = 'peeper-notification-dot';
    container.appendChild(dot);

    // Eye Icon
    const eye = document.createElement('div');
    eye.className = 'peeper-eye-icon';
    eye.textContent = '👀'; 
    container.appendChild(eye);

    // Wrapper for Main Content
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'peeper-content-wrapper';

    // --- Header ---
    const header = document.createElement('div');
    header.className = 'peeper-header';
    
    const title = document.createElement('div');
    title.className = 'peeper-title';
    title.textContent = 'ChatGPT Search Peeper'; 
    
    const controls = document.createElement('div');
    controls.className = 'peeper-controls';
    
    // Broom Icon
    const clearIcon = document.createElement('span');
    clearIcon.className = 'peeper-icon-btn';
    clearIcon.textContent = '🧹';
    clearIcon.title = "Clear List";
    clearIcon.onclick = (e) => {
        e.stopPropagation();
        const list = document.getElementById('ai-seo-peeper-list');
        if(list) list.textContent = '';
    };

    // Close Icon
    const closeBtn = document.createElement('span');
    closeBtn.className = 'peeper-icon-btn';
    closeBtn.textContent = '×';
    closeBtn.style.fontSize = "20px";
    closeBtn.title = "Minimize";
    closeBtn.onclick = (e) => {
        e.stopPropagation();
        toggleMinimize(true);
    };

    controls.appendChild(clearIcon);
    controls.appendChild(closeBtn);
    header.appendChild(title);
    header.appendChild(controls);

    // --- List ---
    const list = document.createElement('ul');
    list.id = 'ai-seo-peeper-list';

    // --- Footer/Copy ---
    const btnContainer = document.createElement('div');
    btnContainer.className = 'peeper-btns';

    const copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copy All';
    copyBtn.onclick = (e) => {
        e.stopPropagation();
        const items = Array.from(document.querySelectorAll('#ai-seo-peeper-list li')).map(li => li.textContent);
        if (items.length === 0) return;
        
        navigator.clipboard.writeText(items.join('\n'));
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => copyBtn.textContent = originalText, 2000);
    };

    // REMOVED PROMO LINK HERE

    btnContainer.appendChild(copyBtn);

    // --- Assembly ---
    contentWrapper.appendChild(header);
    contentWrapper.appendChild(list);
    contentWrapper.appendChild(btnContainer);
    container.appendChild(contentWrapper);
    
    // --- Expand Logic ---
    container.onclick = (e) => {
        if (container.classList.contains('minimized')) {
            toggleMinimize(false);
        }
    };

    document.body.appendChild(container);
    return container;
}

function toggleMinimize(shouldMinimize) {
    const container = document.getElementById('ai-seo-peeper-box');
    if (!container) return;

    if (shouldMinimize) {
        container.classList.add('minimized');
        container.title = "Click to expand queries";
    } else {
        container.classList.remove('minimized');
        container.classList.remove('has-new-data'); 
        container.title = "";
    }
}

function updatePeeperUI(newQueries) {
    createBaseUI(); 
    
    const container = document.getElementById('ai-seo-peeper-box');
    const list = document.getElementById('ai-seo-peeper-list');
    
    const isMinimized = container.classList.contains('minimized');

    const existingItems = new Set(Array.from(list.children).map(li => li.textContent));
    let addedAny = false;

    newQueries.forEach(q => {
        if (!existingItems.has(q)) {
            const item = document.createElement('li');
            item.textContent = q;
            item.style.animation = "highlight 1s ease";
            list.prepend(item);
            addedAny = true;
        }
    });

    if (addedAny && isMinimized) {
        container.classList.add('has-new-data');
        container.classList.remove('shaking'); 
        void container.offsetWidth; 
        container.classList.add('shaking');
    }
}