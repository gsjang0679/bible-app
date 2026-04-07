
document.addEventListener('DOMContentLoaded', () => {
    // State management
    const state = {
        bibleData: { books: [], verses: [] },
        currentBook: null,
        currentChapter: 1,
        testament: 'OT', // 'OT' or 'NT'
        darkMode: localStorage.getItem('darkMode') === 'true',
        fontSize: parseInt(localStorage.getItem('fontSize')) || 18,
        longPressTimer: null
    };

    // UI Elements
    const bookList = document.getElementById('bookList');
    const chapterList = document.getElementById('chapterList');
    const chaptersGrid = document.getElementById('chaptersGrid');
    const navTabs = document.querySelectorAll('.nav-tab');
    const selectedBookNameHeader = document.getElementById('selectedBookName');
    const backToBooksBtn = document.querySelector('.back-to-books');
    const versesContainer = document.getElementById('versesContainer');
    const currentLocationText = document.getElementById('currentLocation');
    
    const themeToggle = document.getElementById('themeToggle');
    const fontSizeSlider = document.getElementById('fontSizeSlider');
    
    // Modals & Search
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchModal = document.getElementById('searchModal');
    const searchResults = document.getElementById('searchResults');
    const bookmarkBtn = document.getElementById('bookmarkBtn');
    const bookmarkModal = document.getElementById('bookmarkModal');
    const bookmarkResults = document.getElementById('bookmarkResults');
    const closeBtns = document.querySelectorAll('.close');
    const navToggleBtn = document.getElementById('navToggleBtn');
    const navDrawer = document.getElementById('navDrawer');

    const loadingIndicator = document.createElement('div');
    loadingIndicator.style.cssText = "position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(0,0,0,0.7); color:white; padding:20px; border-radius:10px; z-index:9999;";
    loadingIndicator.innerText = "데이터를 불러오는 중...";
    document.body.appendChild(loadingIndicator);

    // Initialize Theme
    const initTheme = () => {
        document.body.className = state.darkMode ? 'dark-mode' : 'light-mode';
        themeToggle.innerHTML = state.darkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        fontSizeSlider.value = state.fontSize;
        versesContainer.style.fontSize = state.fontSize + 'px';
    };

    // Fetch All Data (Once)
    const initData = async () => {
        try {
            const response = await fetch('/static/bible_data.json');
            state.bibleData = await response.json();
            loadingIndicator.remove();
            renderBooks();
        } catch (error) {
            console.error('Failed to load Bible data:', error);
            loadingIndicator.innerText = "데이터 로딩 실패 (인터넷 연결을 확인하세요)";
        }
    };

    const renderBooks = () => {
        bookList.innerHTML = '';
        const filtered = state.bibleData.books.filter(b => b.testament === (state.testament === 'OT' ? 'Old' : 'New'));
        
        filtered.forEach(book => {
            const div = document.createElement('div');
            div.className = 'book-item';
            div.innerHTML = `<span>${book.kor_full}</span> <i class="fas fa-chevron-right"></i>`;
            div.addEventListener('click', () => selectBook(book));
            bookList.appendChild(div);
        });
    };

    const selectBook = (book) => {
        state.currentBook = book;
        bookList.classList.add('hidden');
        chapterList.classList.remove('hidden');
        selectedBookNameHeader.innerText = book.kor_full;
        
        // Find distinct chapters for the book
        const bookVerses = state.bibleData.verses.filter(v => v.book_id === book.id);
        const chapters = [...new Set(bookVerses.map(v => v.chapter))].sort((a, b) => a - b);
        renderChapters(chapters, book.id);
    };

    const renderChapters = (chapters, bookId) => {
        chaptersGrid.innerHTML = '';
        chapters.forEach(ch => {
            const div = document.createElement('div');
            div.className = 'chapter-item';
            div.innerText = ch;
            div.addEventListener('click', () => loadVerses(bookId, ch));
            chaptersGrid.appendChild(div);
        });
    };

    const loadVerses = (bookId, chapter) => {
        state.currentChapter = chapter;
        const book = state.bibleData.books.find(b => b.id === bookId);
        currentLocationText.innerText = `${book.kor_full} ${chapter}장`;
        
        const verses = state.bibleData.verses.filter(v => v.book_id === bookId && v.chapter === chapter);
        renderVerses(verses);
        
        // On mobile, collapse nav to focus on reader
        if (window.innerWidth <= 768) {
            navDrawer.classList.add('collapsed');
        }
    };

    const renderVerses = (verses) => {
        versesContainer.innerHTML = '';
        verses.forEach(v => {
            const p = document.createElement('p');
            p.className = 'verse';
            p.innerHTML = `<span class="v-num">${v.verse}</span> ${v.content}`;
            
            // Long Press Bookmark Implementation
            p.addEventListener('mousedown', (e) => startLongPress(v, p));
            p.addEventListener('touchstart', (e) => startLongPress(v, p));
            p.addEventListener('mouseup', clearLongPress);
            p.addEventListener('mouseleave', clearLongPress);
            p.addEventListener('touchend', clearLongPress);
            
            versesContainer.appendChild(p);
        });
        window.scrollTo({top: 0, behavior: 'smooth'});
    };

    const startLongPress = (verse, el) => {
        state.longPressTimer = setTimeout(() => {
            addBookmark(verse);
            el.style.backgroundColor = 'rgba(26, 115, 232, 0.2)';
            setTimeout(() => el.style.backgroundColor = 'transparent', 1000);
            alert('북마크에 추가되었습니다!');
        }, 800);
    };

    const clearLongPress = () => {
        clearTimeout(state.longPressTimer);
    };

    // LOCAL BOOKMARKS
    const addBookmark = (verse) => {
        let bookmarks = JSON.parse(localStorage.getItem('bible_bookmarks') || '[]');
        // Check if exists
        if (!bookmarks.find(b => b.id === verse.id)) {
            bookmarks.unshift({
                ...verse,
                date: new Date().toISOString()
            });
            localStorage.setItem('bible_bookmarks', JSON.stringify(bookmarks));
        }
    };

    const searchBible = () => {
        const query = searchInput.value.trim();
        if(!query) return;
        
        const results = state.bibleData.verses
            .filter(v => v.content.includes(query))
            .slice(0, 100) // Limit results
            .map(v => {
                const b = state.bibleData.books.find(book => book.id === v.book_id);
                return { ...v, kor_full: b.kor_full };
            });

        renderSearchResults(results);
        searchModal.style.display = 'block';
    };

    const renderSearchResults = (results) => {
        searchResults.innerHTML = '';
        if(results.length === 0) {
            searchResults.innerHTML = '<p>결과가 없습니다.</p>';
            return;
        }
        results.forEach(r => {
            const div = document.createElement('div');
            div.className = 'result-item';
            div.innerHTML = `
                <span class="location-tag">${r.kor_full} ${r.chapter}:${r.verse}</span>
                <p>${r.content}</p>
            `;
            div.addEventListener('click', () => {
                loadVerses(r.book_id, r.chapter);
                searchModal.style.display = 'none';
            });
            searchResults.appendChild(div);
        });
    };

    const showBookmarks = () => {
        const bookmarks = JSON.parse(localStorage.getItem('bible_bookmarks') || '[]');
        bookmarkResults.innerHTML = '';
        
        if(bookmarks.length === 0) {
            bookmarkResults.innerHTML = '<p>저장된 북마크가 없습니다.</p>';
        } else {
            bookmarks.forEach(b => {
                const book = state.bibleData.books.find(bk => bk.id === b.book_id);
                const div = document.createElement('div');
                div.className = 'result-item';
                div.innerHTML = `
                    <span class="location-tag">${book.kor_full} ${b.chapter}:${b.verse}</span>
                    <p>${b.content}</p>
                `;
                div.addEventListener('click', () => {
                    loadVerses(b.book_id, b.chapter);
                    bookmarkModal.style.display = 'none';
                });
                bookmarkResults.appendChild(div);
            });
        }
        bookmarkModal.style.display = 'block';
    };

    // Event Listeners
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            navTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            state.testament = tab.dataset.tab;
            bookList.classList.remove('hidden');
            chapterList.classList.add('hidden');
            renderBooks();
        });
    });

    backToBooksBtn.addEventListener('click', () => {
        bookList.classList.remove('hidden');
        chapterList.classList.add('hidden');
    });

    themeToggle.addEventListener('click', () => {
        state.darkMode = !state.darkMode;
        localStorage.setItem('darkMode', state.darkMode);
        initTheme();
    });

    fontSizeSlider.addEventListener('input', (e) => {
        state.fontSize = parseInt(e.target.value);
        versesContainer.style.fontSize = state.fontSize + 'px';
        localStorage.setItem('fontSize', state.fontSize);
    });

    searchBtn.addEventListener('click', searchBible);
    searchInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') searchBible(); });
    bookmarkBtn.addEventListener('click', showBookmarks);
    
    closeBtns.forEach(btn => {
        btn.onclick = () => {
            searchModal.style.display = 'none';
            bookmarkModal.style.display = 'none';
        }
    });

    window.onclick = (e) => {
        if(e.target == searchModal) searchModal.style.display = 'none';
        if(e.target == bookmarkModal) bookmarkModal.style.display = 'none';
    };

    navToggleBtn.addEventListener('click', () => {
        navDrawer.classList.toggle('collapsed');
    });

    // Init
    initTheme();
    initData();
});
