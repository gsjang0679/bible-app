document.addEventListener('DOMContentLoaded', () => {
    // State management
    const state = {
        bibleData: { books: [], verses: [] },
        currentBook: null,
        currentChapter: 1,
        testament: 'OT', // 'OT' or 'NT'
        fontSize: parseInt(localStorage.getItem('fontSize')) || 18,
        longPressTimer: null,
        currentView: 'home', // 'home', 'bible-select', 'reader', 'hymn-select', 'hymn-reader'
        hymnRange: 1,
        hymnData: []
    };

    // UI Elements
    const views = {
        'home-view': document.getElementById('home-view'),
        'bible-select-view': document.getElementById('bible-select-view'),
        'reader-view': document.getElementById('reader-view'),
        'hymn-select-view': document.getElementById('hymn-select-view'),
        'hymn-reader-view': document.getElementById('hymn-reader-view'),
        'story-view': document.getElementById('story-view')
    };

    const bookSelectionList = document.getElementById('bookSelectionList');
    const chapterSelectionGrid = document.getElementById('chapterSelectionGrid');
    const selectionTabs = document.querySelectorAll('.selection-tab');
    
    const versesContainer = document.getElementById('versesContainer');
    
    const readerFooter = document.querySelector('.reader-footer');
    const readerViewTitle = document.getElementById('readerViewTitle');

    // Switch View Helper
    const switchView = (viewName, title = '') => {
        console.log(`Switching view to: ${viewName}`);
        
        // Reset all views visibility
        Object.keys(views).forEach(key => {
            if (views[key]) {
                views[key].classList.toggle('active', key === viewName);
            }
        });
        state.currentView = viewName;
        
        // Manage specific UI components
        if (readerFooter) {
            readerFooter.classList.toggle('hidden', viewName !== 'reader-view');
        }
        
        if (viewName === 'reader-view' && readerViewTitle) {
            readerViewTitle.innerText = title;
        }
    };

    // Initialize Data
    const initData = async () => {
        try {
            const response = await fetch('/api/books');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            state.bibleData.books = await response.json();
            renderBooks();
        } catch (err) {
            console.error('Data initialization failed:', err);
            bookSelectionList.innerHTML = `<p style="padding:20px; color:red;">데이터 로드 실패: ${err.message}</p>`;
        }
    };

    const renderBooks = () => {
        bookSelectionList.innerHTML = '';
        state.bibleData.books.forEach(book => {
            const div = document.createElement('div');
            div.className = 'list-item';
            div.innerHTML = `<span>${book.kor_full}</span>`; // Removed chevron icon to match image
            div.onclick = () => selectBook(book);
            bookSelectionList.appendChild(div);
        });
    };

    const selectBook = async (book) => {
        state.currentBook = book;
        try {
            const response = await fetch(`/api/chapters/${book.id}`);
            const chapters = await response.json();
            renderChapters(chapters);
            
            // Switch tab to Chapter
            selectionTabs.forEach(t => t.classList.toggle('active', t.dataset.tab === 'CH'));
            bookSelectionList.classList.add('hidden');
            chapterSelectionGrid.classList.remove('hidden');
        } catch (err) {
            console.error(err);
        }
    };

    const renderChapters = (chapters) => {
        chapterSelectionGrid.innerHTML = '';
        chapters.forEach(ch => {
            const div = document.createElement('div');
            div.className = 'grid-item';
            div.innerText = ch;
            div.onclick = () => loadVerses(state.currentBook.id, ch);
            chapterSelectionGrid.appendChild(div);
        });
    };

    const loadVerses = async (bookId, chapter) => {
        state.currentChapter = chapter;
        const book = state.bibleData.books.find(b => b.id === bookId);
        
        try {
            const response = await fetch(`/api/verses/${bookId}/${chapter}`);
            const verses = await response.json();
            renderVerses(verses);
            switchView('reader-view', `${book.kor_full} ${chapter}장`);
        } catch (err) {
            console.error(err);
        }
    };

    const renderVerses = (verses) => {
        versesContainer.innerHTML = '';
        versesContainer.style.fontSize = state.fontSize + 'px';
        verses.forEach(v => {
            const div = document.createElement('div');
            div.className = 'verse';
            const safeContent = v.content.replace(/"/g, '&quot;').replace(/'/g, "\\'");
            div.innerHTML = `<span class="v-num">${v.verse}.</span> ${v.content}
                <button class="verse-share-btn" onclick="if(window.openStoryShare) window.openStoryShare('${safeContent}')" title="우리 이야기로 보내기"><i class="fas fa-share-alt"></i></button>`;
            versesContainer.appendChild(div);
        });
        versesContainer.scrollTop = 0;
    };

    // Zoom Controls
    document.getElementById('zoomInBtn').onclick = () => {
        state.fontSize += 2;
        versesContainer.style.fontSize = state.fontSize + 'px';
        localStorage.setItem('fontSize', state.fontSize);
    };
    document.getElementById('zoomOutBtn').onclick = () => {
        if (state.fontSize > 12) {
            state.fontSize -= 2;
            versesContainer.style.fontSize = state.fontSize + 'px';
            localStorage.setItem('fontSize', state.fontSize);
        }
    };

    // Chapter Navigation
    document.getElementById('prevChapterBtn').onclick = () => {
        if (state.currentChapter > 1) {
            loadVerses(state.currentBook.id, state.currentChapter - 1);
        }
    };
    document.getElementById('nextChapterBtn').onclick = () => {
        loadVerses(state.currentBook.id, state.currentChapter + 1);
    };

    // Home Menu Handlers
    document.querySelectorAll('.gold-outline-btn').forEach(btn => {
        btn.onclick = () => {
            const target = btn.dataset.target;
            const title = btn.innerText.trim();
            
            if (target === 'bible-select-view') {
                // Prepare Bible Select/Search View
                bookSelectionList.classList.remove('hidden');
                chapterSelectionGrid.classList.add('hidden');
                selectionTabs.forEach(t => t.classList.toggle('active', t.dataset.tab === 'OT'));
                renderBooks(); // Refresh list to remove search results if any
            }
            switchView(target, title);
        };
    });

    // Back button routing
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.onclick = () => {
            const target = btn.dataset.target;
            if (target) {
                switchView(target);
            }
        };
    });

    // Tab Switching in Bible Selection (Books vs Chapters grid)
    selectionTabs.forEach(tab => {
        tab.onclick = () => {
            if (tab.dataset.tab === 'OT') {
                bookSelectionList.classList.remove('hidden');
                chapterSelectionGrid.classList.add('hidden');
            } else if (tab.dataset.tab === 'CH' && state.currentBook) {
                bookSelectionList.classList.add('hidden');
                chapterSelectionGrid.classList.remove('hidden');
            }
            selectionTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        };
    });



    // Hymnal Logic
    const hymnList = document.getElementById('hymnList');
    const hymnRangeTabs = document.querySelectorAll('#hymnRangeTabs .selection-tab');
    const hymnListWrapper = document.getElementById('hymnListWrapper');
    const hymnNumpadWrapper = document.getElementById('hymnNumpadWrapper');
    const hymnSearchArea = document.getElementById('hymnSearchArea');
    const miniRangeBtns = document.querySelectorAll('.mini-range-btn');
    const hymnNumDisplay = document.getElementById('hymnNumDisplay');
    
    let currentHymnNumInput = "";

    const loadHymnsByRange = async (range) => {
        state.hymnRange = range;
        try {
            const response = await fetch('/api/hymns');
            const allHymns = await response.json();
            renderHymns(allHymns.filter(h => h.number >= range && h.number < parseInt(range) + 100));
        } catch (err) {
            console.error(err);
        }
    };

    const renderHymns = (hymns) => {
        hymnList.innerHTML = '';
        if (hymns.length === 0) {
            hymnList.innerHTML = '<p style="padding:20px; text-align:center; color:#888;">검색 결과가 없습니다.</p>';
            return;
        }
        hymns.forEach(h => {
            const div = document.createElement('div');
            div.className = 'list-item';
            div.innerHTML = `<span>${h.number}. ${h.title}</span>`;
            div.onclick = () => displayHymn(h);
            hymnList.appendChild(div);
        });
    };

    const displayHymn = (hymn) => {
        document.getElementById('hymn-title').innerText = `${hymn.number}장. ${hymn.title}`;
        document.getElementById('hymn-lyrics-text').innerHTML = hymn.lyrics;
        document.getElementById('hymn-score-img').src = `/static/${hymn.images}`;
        // Reset split view to default (both)
        document.getElementById('hymn-content').classList.remove('lyrics-only', 'score-only');
        const icon = document.querySelector('#hymn-toggle-split i');
        if(icon) icon.className = 'fas fa-columns';
        switchView('hymn-reader-view', '찬송가');
    };

    // Hymn Tab Switching
    hymnRangeTabs.forEach(tab => {
        tab.onclick = () => {
            hymnRangeTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            if (tab.dataset.tab === 'list') {
                hymnListWrapper.classList.remove('hidden');
                hymnSearchArea.classList.remove('hidden');
                hymnNumpadWrapper.classList.add('hidden');
            } else {
                hymnListWrapper.classList.add('hidden');
                hymnSearchArea.classList.add('hidden');
                hymnNumpadWrapper.classList.remove('hidden');
                currentHymnNumInput = "";
                hymnNumDisplay.innerText = "";
            }
        };
    });

    // Mini Range Buttons
    miniRangeBtns.forEach(btn => {
        btn.onclick = () => {
            miniRangeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadHymnsByRange(btn.dataset.range);
        };
    });

    // Numpad Buttons
    document.querySelectorAll('.num-btn').forEach(btn => {
        btn.onclick = () => {
            const num = btn.dataset.num;
            if (num === 'del') {
                currentHymnNumInput = currentHymnNumInput.slice(0, -1);
            } else if (btn.id === 'hymnGoBtn') {
                if (currentHymnNumInput) navigateToHymn(currentHymnNumInput);
                return;
            } else {
                if (currentHymnNumInput.length < 3) {
                    currentHymnNumInput += num;
                }
            }
            hymnNumDisplay.innerText = currentHymnNumInput;
        };
    });

    const navigateToHymn = async (num) => {
        try {
            const response = await fetch(`/api/hymns/${num}`);
            if (response.ok) {
                const hymn = await response.json();
                displayHymn(hymn);
            } else {
                alert("해당 번호의 찬양을 찾을 수 없습니다.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const backToHymnSelectBtn = document.getElementById('backToHymnSelect');
    if (backToHymnSelectBtn) {
        backToHymnSelectBtn.onclick = () => switchView('hymn-select-view', '찬 송 가');
    }

    // Hymn Search Logic
    const hymnSearchInput = document.getElementById('hymnSearchInput');
    const hymnSearchBtn = document.getElementById('hymnSearchBtn');
    
    if (hymnSearchBtn && hymnSearchInput) {
        const searchHymn = async () => {
            const query = hymnSearchInput.value.trim();
            if(!query) return;
            
            try {
                const response = await fetch(`/api/hymns?q=${encodeURIComponent(query)}`);
                const results = await response.json();
                renderHymns(results);
                // Also switch range button active state if it's a number search
                if (!isNaN(query)) {
                    miniRangeBtns.forEach(b => b.classList.remove('active'));
                }
            } catch (err) {
                console.error('Search failed:', err);
            }
        };

        hymnSearchBtn.onclick = searchHymn;
        hymnSearchInput.onkeypress = (e) => { if(e.key === 'Enter') searchHymn(); };
    }

    // Hymn Toggle & Swipe Split Logic
    const toggleSplitBtn = document.getElementById('hymn-toggle-split');
    const hymnContent = document.getElementById('hymn-content');
    if (toggleSplitBtn && hymnContent) {
        toggleSplitBtn.onclick = () => {
            const icon = toggleSplitBtn.querySelector('i');
            if (hymnContent.classList.contains('lyrics-only')) {
                hymnContent.classList.remove('lyrics-only');
                hymnContent.classList.add('score-only');
                icon.className = 'fas fa-music';
            } else if (hymnContent.classList.contains('score-only')) {
                hymnContent.classList.remove('score-only');
                icon.className = 'fas fa-columns';
            } else {
                hymnContent.classList.add('lyrics-only');
                icon.className = 'fas fa-image';
            }
        };

        let touchStartY = 0;
        let touchEndY = 0;

        hymnContent.addEventListener('touchstart', e => {
            touchStartY = e.changedTouches[0].screenY;
        }, {passive: true});

        hymnContent.addEventListener('touchend', e => {
            touchEndY = e.changedTouches[0].screenY;
            const delta = touchEndY - touchStartY;
            const icon = toggleSplitBtn.querySelector('i');
            
            if (delta > 50) {
                // Swipe DOWN: Expand Score
                const lyricsView = document.querySelector('.hymn-lyrics-view');
                if (hymnContent.classList.contains('lyrics-only') && lyricsView && lyricsView.scrollTop > 5) return;
                
                if (hymnContent.classList.contains('lyrics-only')) {
                    hymnContent.classList.remove('lyrics-only');
                    icon.className = 'fas fa-columns';
                } else {
                    hymnContent.classList.add('score-only');
                    icon.className = 'fas fa-music';
                }
            } else if (delta < -50) {
                // Swipe UP: Expand Lyrics
                const scoreView = document.querySelector('.hymn-score-view');
                if (!hymnContent.classList.contains('lyrics-only') && scoreView) {
                    if (scoreView.scrollTop + scoreView.clientHeight < scoreView.scrollHeight - 5) return;
                }

                if (hymnContent.classList.contains('score-only')) {
                    hymnContent.classList.remove('score-only');
                    icon.className = 'fas fa-columns';
                } else {
                    hymnContent.classList.add('lyrics-only');
                    icon.className = 'fas fa-image';
                }
            }
        }, {passive: true});
    }

    // Init Data
    initData();
    loadHymnsByRange(1);
    
    // Explicitly start at home
    switchView('home-view');

    // Story View Logic Start
    setupStoryLogic();
});

