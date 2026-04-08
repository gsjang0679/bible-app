document.addEventListener('DOMContentLoaded', () => {
    // State management
    const state = {
        bibleData: { 
            books: [
                {"id":1,"kor_short":"창","kor_full":"창세기","testament":"Old","display_order":0},
                {"id":2,"kor_short":"출","kor_full":"출애굽기","testament":"Old","display_order":1},
                {"id":3,"kor_short":"레","kor_full":"레위기","testament":"Old","display_order":2},
                {"id":4,"kor_short":"민","kor_full":"민수기","testament":"Old","display_order":3},
                {"id":5,"kor_short":"신","kor_full":"신명기","testament":"Old","display_order":4},
                {"id":6,"kor_short":"수","kor_full":"여호수아","testament":"Old","display_order":5},
                {"id":7,"kor_short":"삿","kor_full":"사사기","testament":"Old","display_order":6},
                {"id":8,"kor_short":"룻","kor_full":"룻기","testament":"Old","display_order":7},
                {"id":9,"kor_short":"삼상","kor_full":"사무엘상","testament":"Old","display_order":8},
                {"id":10,"kor_short":"삼하","kor_full":"사무엘하","testament":"Old","display_order":9},
                {"id":11,"kor_short":"왕상","kor_full":"열왕기상","testament":"Old","display_order":10},
                {"id":12,"kor_short":"왕하","kor_full":"열왕기하","testament":"Old","display_order":11},
                {"id":13,"kor_short":"대상","kor_full":"역대상","testament":"Old","display_order":12},
                {"id":14,"kor_short":"대하","kor_full":"역대하","testament":"Old","display_order":13},
                {"id":15,"kor_short":"스","kor_full":"에스라","testament":"Old","display_order":14},
                {"id":16,"kor_short":"느","kor_full":"느헤미야","testament":"Old","display_order":15},
                {"id":17,"kor_short":"에","kor_full":"에스더","testament":"Old","display_order":16},
                {"id":18,"kor_short":"욥","kor_full":"욥기","testament":"Old","display_order":17},
                {"id":19,"kor_short":"시","kor_full":"시편","testament":"Old","display_order":18},
                {"id":20,"kor_short":"잠","kor_full":"잠언","testament":"Old","display_order":19},
                {"id":21,"kor_short":"전","kor_full":"전도서","testament":"Old","display_order":20},
                {"id":22,"kor_short":"아","kor_full":"아가","testament":"Old","display_order":21},
                {"id":23,"kor_short":"사","kor_full":"이사야","testament":"Old","display_order":22},
                {"id":24,"kor_short":"렘","kor_full":"예레미야","testament":"Old","display_order":23},
                {"id":25,"kor_short":"애","kor_full":"예레미야애가","testament":"Old","display_order":24},
                {"id":26,"kor_short":"겔","kor_full":"에스겔","testament":"Old","display_order":25},
                {"id":27,"kor_short":"단","kor_full":"다니엘","testament":"Old","display_order":26},
                {"id":28,"kor_short":"호","kor_full":"호세아","testament":"Old","display_order":27},
                {"id":29,"kor_short":"욜","kor_full":"요엘","testament":"Old","display_order":28},
                {"id":30,"kor_short":"암","kor_full":"아모스","testament":"Old","display_order":29},
                {"id":31,"kor_short":"옵","kor_full":"오바댜","testament":"Old","display_order":30},
                {"id":32,"kor_short":"욘","kor_full":"요나","testament":"Old","display_order":31},
                {"id":33,"kor_short":"미","kor_full":"미가","testament":"Old","display_order":32},
                {"id":34,"kor_short":"나","kor_full":"나훔","testament":"Old","display_order":33},
                {"id":35,"kor_short":"합","kor_full":"하박국","testament":"Old","display_order":34},
                {"id":36,"kor_short":"습","kor_full":"스바냐","testament":"Old","display_order":35},
                {"id":37,"kor_short":"학","kor_full":"학개","testament":"Old","display_order":36},
                {"id":38,"kor_short":"슥","kor_full":"스가랴","testament":"Old","display_order":37},
                {"id":39,"kor_short":"말","kor_full":"말라기","testament":"Old","display_order":38},
                {"id":40,"kor_short":"마","kor_full":"마태복음","testament":"New","display_order":39},
                {"id":41,"kor_short":"막","kor_full":"마가복음","testament":"New","display_order":40},
                {"id":42,"kor_short":"눅","kor_full":"누가복음","testament":"New","display_order":41},
                {"id":43,"kor_short":"요","kor_full":"요한복음","testament":"New","display_order":42},
                {"id":44,"kor_short":"행","kor_full":"사도행전","testament":"New","display_order":43},
                {"id":45,"kor_short":"롬","kor_full":"로마서","testament":"New","display_order":44},
                {"id":46,"kor_short":"고전","kor_full":"고린도전서","testament":"New","display_order":45},
                {"id":47,"kor_short":"고후","kor_full":"고린도후서","testament":"New","display_order":46},
                {"id":48,"kor_short":"갈","kor_full":"갈라디아서","testament":"New","display_order":47},
                {"id":49,"kor_short":"엡","kor_full":"에베소서","testament":"New","display_order":48},
                {"id":50,"kor_short":"빌","kor_full":"빌립보서","testament":"New","display_order":49},
                {"id":51,"kor_short":"골","kor_full":"골로새서","testament":"New","display_order":50},
                {"id":52,"kor_short":"살전","kor_full":"데살로니가전서","testament":"New","display_order":51},
                {"id":53,"kor_short":"살후","kor_full":"데살로니가후서","testament":"New","display_order":52},
                {"id":54,"kor_short":"딤전","kor_full":"디모데전서","testament":"New","display_order":53},
                {"id":55,"kor_short":"딤후","kor_full":"디모데후서","testament":"New","display_order":54},
                {"id":56,"kor_short":"딛","kor_full":"디도서","testament":"New","display_order":55},
                {"id":57,"kor_short":"몬","kor_full":"빌레몬서","testament":"New","display_order":56},
                {"id":58,"kor_short":"히","kor_full":"히브리서","testament":"New","display_order":57},
                {"id":59,"kor_short":"약","kor_full":"야고보서","testament":"New","display_order":58},
                {"id":60,"kor_short":"벧전","kor_full":"베드로전서","testament":"New","display_order":59},
                {"id":61,"kor_short":"벧후","kor_full":"베드로후서","testament":"New","display_order":60},
                {"id":62,"kor_short":"요일","kor_full":"요한일서","testament":"New","display_order":61},
                {"id":63,"kor_short":"요이","kor_full":"요한이서","testament":"New","display_order":62},
                {"id":64,"kor_short":"요삼","kor_full":"요한삼서","testament":"New","display_order":63},
                {"id":65,"kor_short":"유","kor_full":"유다서","testament":"New","display_order":64},
                {"id":66,"kor_short":"계","kor_full":"요한계시록","testament":"New","display_order":65}
            ], 
            verses: [] 
        },
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

function toggleFullscreen() {
    const body = document.body;
    const exitBtn = document.getElementById('exitFullscreenBtn');
    const isFull = body.classList.toggle('fullscreen-mode');
    
    if (isFull) {
        exitBtn.classList.remove('hidden');
    } else {
        exitBtn.classList.add('hidden');
    }
}
