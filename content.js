// 1. Inject the spy script
const s = document.createElement('script');
s.src = chrome.runtime.getURL('injected.js');
s.onload = function() { this.remove(); };
(document.head || document.documentElement).appendChild(s);

// 2. Listen for messages from injected.js
window.addEventListener("message", (event) => {
    if (event.source !== window) return;

    if (event.data.type && event.data.type === "AI_SEO_PEEPER_DATA") {
        const queries = event.data.data;
        if (queries && queries.length > 0) {
            updatePeeperUI(queries);
        }
    }
});

// 3. UI Logic
function createBaseUI() {
    const existing = document.getElementById('ai-seo-peeper-box');
    if (existing) return existing;

    const container = document.createElement('div');
    container.id = 'ai-seo-peeper-box';
    
    // Notification Dot (visible only when minimized + new data)
    const dot = document.createElement('div');
    dot.className = 'peeper-notification-dot';
    container.appendChild(dot);

    // Eye Icon (visible only when minimized)
    const eye = document.createElement('div');
    eye.className = 'peeper-eye-icon';
    eye.innerText = '👀';
    container.appendChild(eye);

    // Wrapper for Main Content (to fade in/out smoothly)
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'peeper-content-wrapper';

    // --- Header ---
    const header = document.createElement('div');
    header.className = 'peeper-header';
    
    const title = document.createElement('div');
    title.className = 'peeper-title';
    title.innerHTML = 'AI SEO Peeper'; 
    
    const controls = document.createElement('div');
    controls.className = 'peeper-controls';
    
    // Broom Icon (Clear)
    const clearIcon = document.createElement('span');
    clearIcon.className = 'peeper-icon-btn';
    clearIcon.innerText = '🧹';
    clearIcon.title = "Clear List";
    clearIcon.onclick = (e) => {
        e.stopPropagation();
        const list = document.getElementById('ai-seo-peeper-list');
        if(list) list.innerHTML = '';
    };

    // Close Icon (Minimize)
    const closeBtn = document.createElement('span');
    closeBtn.className = 'peeper-icon-btn';
    closeBtn.innerText = '×';
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
    copyBtn.innerText = 'Copy All';
    copyBtn.onclick = (e) => {
        e.stopPropagation();
        const items = Array.from(document.querySelectorAll('#ai-seo-peeper-list li')).map(li => li.innerText);
        if (items.length === 0) return;
        
        navigator.clipboard.writeText(items.join('\n'));
        const originalText = copyBtn.innerText;
        copyBtn.innerText = 'Copied!';
        setTimeout(() => copyBtn.innerText = originalText, 2000);
    };

    btnContainer.appendChild(copyBtn);

    // --- Assembly ---
    contentWrapper.appendChild(header);
    contentWrapper.appendChild(list);
    contentWrapper.appendChild(btnContainer);
    container.appendChild(contentWrapper);
    
    // --- Expand Logic ---
    container.onclick = (e) => {
        // Only expand if currently minimized
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
        container.classList.remove('has-new-data'); // Clear notification
        container.title = "";
    }
}

function updatePeeperUI(newQueries) {
    createBaseUI(); // Ensure UI exists
    
    const container = document.getElementById('ai-seo-peeper-box');
    const list = document.getElementById('ai-seo-peeper-list');
    
    // Check if we are currently minimized
    const isMinimized = container.classList.contains('minimized');

    const existingItems = new Set(Array.from(list.children).map(li => li.innerText));
    let addedAny = false;

    newQueries.forEach(q => {
        if (!existingItems.has(q)) {
            const item = document.createElement('li');
            item.innerText = q;
            item.style.animation = "highlight 1s ease";
            list.prepend(item);
            addedAny = true;
        }
    });

    // Handle Minimized Notifications
    if (addedAny && isMinimized) {
        // 1. Add visual badge
        container.classList.add('has-new-data');

        // 2. Trigger Shake Animation
        container.classList.remove('shaking'); // reset
        void container.offsetWidth; // force reflow (magic trick to restart CSS animation)
        container.classList.add('shaking');
    }
}