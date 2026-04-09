const fs = require('fs');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync('static/index.html', 'utf-8');
const js = fs.readFileSync('static/app.js', 'utf-8');

const dom = new JSDOM(html, { runScripts: "outside-only", url: "http://localhost/" });
const window = dom.window;
const document = window.document;

// Mock fetch
window.fetch = async (url) => {
    if (url === '/api/books') return { ok: true, json: async () => [{id: 1, kor_full: '창세기'}] };
    if (url === '/api/hymns') return { ok: true, json: async () => [] };
    return { ok: false };
};

// Execute JS
try {
    window.eval(js);
    
    // Fire DOMContentLoaded
    const event = document.createEvent('Event');
    event.initEvent('DOMContentLoaded', true, true);
    document.dispatchEvent(event);

    console.log("JS executing... Waiting for async init...");
    
    setTimeout(() => {
        let activeViews = document.querySelectorAll('.view-container.active');
        console.log("Active views count:", activeViews.length);
        if(activeViews.length > 0) {
            console.log("Current active view:", activeViews[0].id);
        }

        // Test back button
        const backBtn = document.querySelector('.back-btn[data-target="home-view"]');
        if (backBtn) {
            console.log("Clicking back btn to home-view...");
            backBtn.onclick();
            
            let postActiveViews = document.querySelectorAll('.view-container.active');
            if(postActiveViews.length > 0) {
                console.log("Post click active view:", postActiveViews[0].id);
            } else {
                console.log("Post click active view: NONE!");
            }
        }
        
    }, 1000);

} catch (err) {
    console.error("Runtime exception:", err);
}
