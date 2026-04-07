
document.addEventListener('DOMContentLoaded', () => {
    // State management
    const state = {
        bibleData: { books: [], verses: [] },
        currentBook: null,
        currentChapter: 1,
        testament: 'OT', // 'OT' or 'NT'
        darkMode: localStorage.getItem('darkMode') === 'true',
        fontSize: parseInt(localStorage.getItem('fontSize')) || 18,
        longPressTimer: null,
        currentView: 'bible', // 'bible' or 'hymn'
        hymnNumber: '',
        wakeLock: null
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
            console.log("Loading books via API...");
            const response = await fetch('/api/books');
            if(!response.ok) throw new Error("API error: " + response.status);
            state.bibleData.books = await response.json();
            
            // Normalize testament field for rendering
            state.bibleData.books.forEach(b => {
                if(b.testament === 'Old' || b.testament === 'New') return;
                // Default if not set (or if integers are used in DB)
                b.testament = (b.display_order < 39) ? 'Old' : 'New';
            });

            if (loadingIndicator) loadingIndicator.remove();
            renderBooks();
            console.log("Books loaded via API successfully.");
            
            // Attempt offline data backup silently in background
            fetch('/static/bible_data.json?v=5').then(res => res.json()).then(data => {
                state.fullData = data; 
                console.log("Offline data cached.");
            }).catch(e => console.warn("Background data cache failed"));

        } catch (error) {
            console.error('API loading failed:', error);
            if (loadingIndicator) {
                loadingIndicator.innerText = "서버 연결 실패: " + error.message;
                loadingIndicator.style.background = "#dc2626";
            }
        }
    };

    const renderBooks = () => {
        if (!state.bibleData || !state.bibleData.books) {
            console.warn("No bible data to render.");
            return;
        }
        bookList.innerHTML = '';
        const filtered = state.bibleData.books.filter(b => b.testament === (state.testament === 'OT' ? 'Old' : 'New'));
        console.log(`Rendering ${filtered.length} books for ${state.testament}`);
        
        if (filtered.length === 0) {
            bookList.innerHTML = '<p style="padding:20px; text-align:center;">목록이 없습니다.</p>';
        }

        filtered.forEach(book => {
            const div = document.createElement('div');
            div.className = 'book-item';
            div.innerHTML = `<span>${book.kor_full}</span> <i class="fas fa-chevron-right"></i>`;
            div.addEventListener('click', () => selectBook(book));
            bookList.appendChild(div);
        });
    };

    const selectBook = async (book) => {
        state.currentBook = book;
        bookList.classList.add('hidden');
        chapterList.classList.remove('hidden');
        selectedBookNameHeader.innerText = book.kor_full;
        
        try {
            const response = await fetch(`/api/chapters/${book.id}`);
            const chapters = await response.json();
            renderChapters(chapters, book.id);
        } catch (err) {
            alert('장 정보를 가져오지 못했습니다.');
        }
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

    const loadVerses = async (bookId, chapter) => {
        state.currentChapter = chapter;
        const book = state.bibleData.books.find(b => b.id === bookId);
        currentLocationText.innerText = `${book.kor_full} ${chapter}장`;
        
        try {
            const response = await fetch(`/api/verses/${bookId}/${chapter}`);
            const verses = await response.json();
            renderVerses(verses);
        } catch (err) {
            alert('말씀을 가져오지 못했습니다.');
        }
        
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

    // --- NEW: TAB SWITCHING LOGIC ---
    const tabItems = document.querySelectorAll('.tab-item');
    const bibleView = document.getElementById('bible-view');
    const hymnView = document.getElementById('hymn-view');

    tabItems.forEach(item => {
        item.addEventListener('click', () => {
            const view = item.dataset.view;
            if (state.currentView === view) return;

            state.currentView = view;
            tabItems.forEach(t => t.classList.remove('active'));
            item.classList.add('active');

            if (view === 'bible') {
                bibleView.classList.add('active');
                hymnView.classList.remove('active');
            } else {
                bibleView.classList.remove('active');
                hymnView.classList.add('active');
            }
        });
    });

    // --- NEW: HYMN LOGIC ---
    const hymnNumInput = document.getElementById('hymn-number-input');
    const numBtns = document.querySelectorAll('.num-btn');
    const hymnGoBtn = document.getElementById('hymn-go-btn');
    const hymnReader = document.getElementById('hymn-reader');
    const hymnSearchBox = document.querySelector('.hymn-search-box');
    const hymnResults = document.getElementById('hymn-results');
    const backToHymnSearch = document.getElementById('back-to-hymn-search');

    numBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('reset')) {
                state.hymnNumber = '';
            } else if (btn.classList.contains('del')) {
                state.hymnNumber = state.hymnNumber.slice(0, -1);
            } else {
                if (state.hymnNumber.length < 3) state.hymnNumber += btn.innerText;
            }
            hymnNumInput.value = state.hymnNumber;
        });
    });

    const loadHymn = async (number) => {
        try {
            const response = await fetch(`/api/hymns/${number}`);
            if (!response.ok) throw new Error('Hymn not found');
            const hymn = await response.json();
            displayHymn(hymn);
        } catch (err) {
            alert('해당 장의 찬송가가 없습니다.');
        }
    };

    const displayHymn = (hymn) => {
        document.getElementById('hymn-title').innerText = `${hymn.number}장. ${hymn.title}`;
        document.getElementById('hymn-lyrics-text').innerText = hymn.lyrics;
        document.getElementById('hymn-score-img').src = `/static/${hymn.images}`;
        
        hymnReader.classList.remove('hidden');
        hymnSearchBox.classList.add('hidden');
        hymnResults.classList.add('hidden');
    };

    hymnGoBtn.addEventListener('click', () => {
        if (state.hymnNumber) loadHymn(state.hymnNumber);
    });

    backToHymnSearch.addEventListener('click', () => {
        hymnReader.classList.add('hidden');
        hymnSearchBox.classList.remove('hidden');
    });

    // Hymn Text Search
    const hymnTextInput = document.getElementById('hymn-text-input');
    const hymnSearchBtn = document.getElementById('hymn-search-btn');

    const searchHymns = async () => {
        const query = hymnTextInput.value.trim();
        if (!query) return;
        const response = await fetch(`/api/hymns?q=${encodeURIComponent(query)}`);
        const results = await response.json();
        renderHymnResults(results);
    };

    const renderHymnResults = (results) => {
        hymnResults.innerHTML = '';
        hymnResults.classList.remove('hidden');
        if (results.length === 0) {
            hymnResults.innerHTML = '<p>결과가 없습니다.</p>';
            return;
        }
        results.forEach(h => {
            const div = document.createElement('div');
            div.className = 'result-item';
            div.innerHTML = `<strong>${h.number}장. ${h.title}</strong><p>${h.lyrics.substring(0, 50)}...</p>`;
            div.addEventListener('click', () => displayHymn(h));
            hymnResults.appendChild(div);
        });
    };

    hymnSearchBtn.addEventListener('click', searchHymns);

    // Screen Wake Lock
    const wakeLockBtn = document.getElementById('hymn-wake-lock');
    wakeLockBtn.addEventListener('click', async () => {
        if (!state.wakeLock) {
            try {
                state.wakeLock = await navigator.wakeLock.request('screen');
                wakeLockBtn.style.color = '#eab308'; // Golden
                alert('화면 켜짐 유지 활성화');
            } catch (err) {
                console.error(err);
            }
        } else {
            state.wakeLock.release();
            state.wakeLock = null;
            wakeLockBtn.style.color = '#666';
            alert('화면 켜짐 유지 비활성화');
        }
    });

    // Split Layout Toggle
    const toggleSplitBtn = document.getElementById('hymn-toggle-split');
    const hymnContent = document.getElementById('hymn-content');
    toggleSplitBtn.addEventListener('click', () => {
        const scoreView = document.getElementById('hymn-score-view');
        const lyricsView = document.getElementById('hymn-lyrics-view');
        
        if (scoreView.style.display === 'none') {
            scoreView.style.display = 'flex';
            lyricsView.style.display = 'flex';
        } else {
            // Simplified toggle: if visible, hide one for focus
            // In a better impl, cycle states
            scoreView.style.display = 'none';
        }
    });

    // Init
    initTheme();
    initData();
});
