let currentBookId = 1;
let currentChapter = 1;
let allBooks = [];

async function init() {
    await loadBooks();
    await loadHymnal();
    loadBookmarks();
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    const targetId = pageId.endsWith('-page') ? pageId : (pageId === 'detail' ? 'hymn-detail' : pageId + '-page');
    const targetPage = document.getElementById(targetId);
    
    if (targetPage) {
        targetPage.classList.add('active');
        if (pageId === 'bookmark') loadBookmarks();
    }

    // Update nav buttons
    document.querySelectorAll('.nav-links button').forEach(btn => {
        const btnAction = btn.getAttribute('onclick');
        if (btnAction && btnAction.includes(pageId)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

async function loadBooks() {
    try {
        const res = await fetch('/api/bible/books');
        allBooks = await res.json();
        const select = document.getElementById('book-select');
        select.innerHTML = allBooks.map(b => `<option value="${b.id}">${b.kor_full}</option>`).join('');
        await loadChapters();
    } catch (e) {
        console.error("Failed to load books", e);
    }
}

async function loadChapters() {
    const bookId = document.getElementById('book-select').value;
    const book = allBooks.find(b => b.id == bookId);
    const select = document.getElementById('chapter-select');
    
    if (book) {
        select.innerHTML = Array.from({length: book.max_chapter}, (_, i) => `<option value="${i+1}">${i+1}장</option>`).join('');
    }
    await loadVerses();
}

async function loadVerses() {
    const bookId = document.getElementById('book-select').value;
    const chapter = document.getElementById('chapter-select').value;
    
    const res = await fetch(`/api/bible/verses/${bookId}/${chapter}`);
    const verses = await res.json();
    
    const container = document.getElementById('verses-container');
    if (verses.length === 0) {
        container.innerHTML = '<p class="text-dim">이 장에는 말씀이 없습니다.</p>';
    } else {
        container.innerHTML = verses.map(v => `
            <div class="verse-row">
                <span class="verse-num">${v.verse}</span>
                <span class="verse-content">${v.content}</span>
            </div>
        `).join('');
    }
    container.scrollTop = 0;
}

async function loadHymnal() {
    const res = await fetch('/api/hymnal');
    const hymns = await res.json();
    displayHymns(hymns);
}

function displayHymns(hymns) {
    const list = document.getElementById('hymnal-list');
    list.innerHTML = hymns.map(h => `
        <div class="hymn-card" onclick="viewHymn(${h.no})">
            <span class="hymn-no">${h.no}장</span>
            <span class="hymn-title">${h.title}</span>
        </div>
    `).join('');
}

async function searchHymns() {
    const q = document.getElementById('hymn-search').value;
    const res = await fetch(`/api/hymnal?q=${encodeURIComponent(q)}`);
    const hymns = await res.json();
    displayHymns(hymns);
}

async function viewHymn(no) {
    const res = await fetch(`/api/hymnal/${no}`);
    const hymn = await res.json();
    
    const content = document.getElementById('hymn-content');
    const imgSrc = `https://raw.githubusercontent.com/ccmhymn/sheet/master/asset/hymn/img/hymn${String(no).padStart(3, '0')}.gif`;
    
    content.innerHTML = `
        <div class="hymn-header" style="margin-bottom: 2rem;">
            <span class="hymn-no">${hymn.no}장</span>
            <h2 style="font-size: 2rem; margin: 0.5rem 0;">${hymn.title}</h2>
            <p class="text-dim">${hymn.category} | ${hymn.chord} | ${hymn.beat}</p>
            <button class="bookmark-btn" onclick="toggleBookmark('hymn', ${hymn.no}, '${hymn.title}')" style="margin-top: 1rem; padding: 0.5rem 1rem; border-radius: 8px; border: 1px solid var(--accent); background: none; color: var(--accent); cursor: pointer;">
                <i class="fas fa-bookmark"></i> 북마크 추가/해제
            </button>
        </div>
        <div class="sheet-music">
            <img src="${imgSrc}" alt="${hymn.title} 악보" onerror="this.src='https://via.placeholder.com/600x800?text=No+Sheet+Music'" style="max-width: 100%; border-radius: 12px; margin-bottom: 2rem;">
        </div>
        <div class="lyrics-text" style="font-size: 1.2rem; line-height: 2; white-space: pre-wrap;">
            ${hymn.full_lyrics.replace(/<br\/>/g, '\n')}
        </div>
    `;
    
    showPage('detail');
}

function toggleBookmark(type, id, title) {
    let bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    const key = `${type}-${id}`;
    const index = bookmarks.findIndex(b => b.key === key);
    
    if (index > -1) {
        bookmarks.splice(index, 1);
        alert('북마크가 해제되었습니다.');
    } else {
        bookmarks.push({ key, type, id, title });
        alert('북마크에 추가되었습니다.');
    }
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
}

function loadBookmarks() {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    const container = document.getElementById('bookmarks-container');
    
    if (bookmarks.length === 0) {
        container.innerHTML = '<p class="text-dim">북마크가 없습니다.</p>';
    } else {
        container.innerHTML = bookmarks.map(b => `
            <div class="hymn-card" onclick="viewHymn(${b.id})">
                <span class="hymn-no">${b.type === 'hymn' ? b.id + '장' : '성경'}</span>
                <span class="hymn-title">${b.title}</span>
            </div>
        `).join('');
    }
}

function changeFontSize(size) {
    const container = document.getElementById('verses-container');
    if (container) {
        container.style.setProperty('--verse-size', `${size}rem`);
    }
}

window.onload = init;
