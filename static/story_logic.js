function setupStoryLogic() {
    const storyTimeline = document.getElementById('storyTimeline');
    const openStoryModalBtn = document.getElementById('openStoryModalBtn');
    const storyModal = document.getElementById('storyModal');
    const cancelStoryBtn = document.getElementById('cancelStoryBtn');
    const submitStoryBtn = document.getElementById('submitStoryBtn');
    
    const storyType = document.getElementById('storyType');
    const storyReferenceContainer = document.getElementById('storyReferenceContainer');
    const storyMediaContainer = document.getElementById('storyMediaContainer');
    
    // Toggle fields based on type
    storyType.addEventListener('change', () => {
        const val = storyType.value;
        storyReferenceContainer.style.display = (val === 'word' || val === 'song') ? 'block' : 'none';
        storyMediaContainer.style.display = (val === 'gratitude') ? 'block' : 'none';
        
        let placeholder = '여기에 이야기, 묵상, 감사한 내용 등을 적어주세요.';
        if(val === 'word') placeholder = '이 말씀을 통해 느낀 점이나 기도제목을 나눠보세요.';
        if(val === 'prayer') placeholder = '서로를 위해 기도할 제목을 적어주세요.';
        if(val === 'song') placeholder = '이 찬양에 얽힌 우리만의 추억이나 은혜를 나눠보세요.';
        if(val === 'gratitude') placeholder = '오늘 가장 감사했던 일 한 가지를 적어주세요.';
        document.getElementById('storyContent').placeholder = placeholder;
    });

    openStoryModalBtn.onclick = () => {
        storyModal.style.display = 'flex';
        // Reset inputs
        document.getElementById('storyContent').value = '';
        document.getElementById('storyReference').value = '';
        document.getElementById('storyMediaInput').value = '';
    };

    cancelStoryBtn.onclick = () => {
        storyModal.style.display = 'none';
    };

    // Load Stories
    const loadStories = async () => {
        try {
            const res = await fetch('/api/stories');
            const stories = await res.json();
            renderStories(stories);
            checkNotifications(stories);
        } catch (e) { console.error(e); }
    };

    const typeLabels = {
        'word': '말씀 묵상', 'gratitude': '감사 일기', 'prayer': '기도 카드', 'song': '우리의 찬양'
    };

    const renderStories = (stories) => {
        storyTimeline.innerHTML = '';
        if(stories.length === 0) {
            storyTimeline.innerHTML = '<div style="text-align:center; padding:30px; color:#887a6c;">아직 작성된 이야기가 없습니다.<br>첫 번째 이야기를 남겨보세요!</div>';
            return;
        }

        stories.forEach(s => {
            const dateStr = new Date(s.created_at).toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'});
            
            let referenceHtml = '';
            if (s.type === 'word' && s.reference) {
                referenceHtml = `<div class="story-reference">"${s.reference}"</div>`;
            } else if (s.type === 'song' && s.reference) {
                // simple youtube embed
                let ytMatch = s.reference.match(/(?:v=|youtu\.be\/|embed\/)([^&?]+)/);
                if (ytMatch && ytMatch[1]) {
                    referenceHtml = `<iframe class="story-youtube" src="https://www.youtube.com/embed/${ytMatch[1]}" allowfullscreen></iframe>`;
                } else if (s.reference.startsWith('http')) {
                    referenceHtml = `<div class="story-reference"><a href="${s.reference}" target="_blank" style="color:#d4a373;">음원/링크 열기</a></div>`;
                }
            }

            let mediaHtml = s.media_url ? `<div class="story-media"><img src="${s.media_url}" alt="첨부 사진"></div>` : '';
            
            let prayerHtml = '';
            if (s.type === 'prayer') {
                if(s.is_answered) {
                    prayerHtml = `<button class="prayer-answer-btn answered" disabled><i class="fas fa-check"></i> 응답받은 기도</button>`;
                } else {
                    prayerHtml = `<button class="prayer-answer-btn" onclick="window.answerPrayer(${s.id})">응답 체크하기</button>`;
                }
            }

            const card = document.createElement('div');
            card.className = 'story-card';
            card.innerHTML = `
                <div class="story-card-header">
                    <div>
                        <span class="story-author ${s.author}">${s.author}</span>
                        <span style="margin: 0 5px; color:#ccc;">|</span>
                        <span>${dateStr}</span>
                    </div>
                    <div><button onclick="window.deleteStory(${s.id})" style="background:none;border:none;color:#ccc;cursor:pointer;"><i class="fas fa-trash"></i></button></div>
                </div>
                <div><span class="story-type-badge">${typeLabels[s.type] || '기록'}</span></div>
                ${referenceHtml}
                <div class="story-content" style="margin-top: 10px; white-space: pre-wrap;">${s.content}</div>
                ${mediaHtml}
                ${prayerHtml}
            `;
            storyTimeline.appendChild(card);
        });
    };

    // Submitting a story
    submitStoryBtn.onclick = async () => {
        const type = storyType.value;
        const author = document.getElementById('currentUserSelect').value;
        const content = document.getElementById('storyContent').value.trim();
        const reference = document.getElementById('storyReference').value.trim();
        const mediaFile = document.getElementById('storyMediaInput').files[0];

        if(!content) { alert('내용을 입력해주세요.'); return; }

        submitStoryBtn.innerText = '저장 중...';
        submitStoryBtn.disabled = true;

        let mediaUrl = null;
        if(mediaFile) {
            const formData = new FormData();
            formData.append('file', mediaFile);
            try {
                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                const data = await res.json();
                mediaUrl = data.url;
            } catch(e) { console.error('Upload failed', e); }
        }

        try {
            await fetch('/api/stories', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    type, author, content, reference: reference || null, media_url: mediaUrl
                })
            });
            storyModal.style.display = 'none';
            loadStories();
        } catch(e) {
            alert('저장 실패!');
        } finally {
            submitStoryBtn.innerText = '기록하기';
            submitStoryBtn.disabled = false;
        }
    };

    // Global Functions for inline onclick
    window.answerPrayer = async (id) => {
        if(confirm('이 기도제목이 응답되었나요?')) {
            await fetch(`/api/stories/${id}/answer`, { method: 'PUT' });
            loadStories();
        }
    };
    
    window.deleteStory = async (id) => {
        if(confirm('이 기록을 삭제하시겠습니까?')) {
            await fetch(`/api/stories/${id}`, { method: 'DELETE' });
            loadStories();
        }
    };

    // Notification Check
    const checkNotifications = (stories) => {
        if(stories.length === 0) return;
        const latestId = stories[0].id;
        const savedId = localStorage.getItem('lastStoryId');
        const author = document.getElementById('currentUserSelect').value;
        
        if (savedId && latestId > parseInt(savedId) && stories[0].author !== author) {
            if (Notification.permission === 'granted') {
                new Notification('우리 이야기', {
                    body: `${stories[0].author}님이 소중한 이야기를 남겼습니다.`,
                    icon: '/static/icons/icon-192x192.png'
                });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission();
            }
        }
        localStorage.setItem('lastStoryId', latestId);
    };

    // Backup Functionality
    const backupStoryBtn = document.getElementById('backupStoryBtn');
    if (backupStoryBtn) {
        backupStoryBtn.onclick = async () => {
            try {
                const res = await fetch('/api/stories');
                const stories = await res.json();
                
                let textContent = "==== 우리 이야기 백업 ====\n\n";
                stories.forEach(s => {
                    const dateStr = new Date(s.created_at).toLocaleString('ko-KR');
                    textContent += `[${dateStr}] ${s.author} - ${typeLabels[s.type] || '기록'}\n`;
                    if (s.reference) textContent += `참고: ${s.reference}\n`;
                    textContent += `${s.content}\n`;
                    if (s.media_url) textContent += `(첨부 이미지: ${s.media_url})\n`;
                    textContent += `----------------------------------------\n\n`;
                });

                const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `우리이야기_백업_${new Date().toISOString().split('T')[0]}.txt`;
                a.click();
            } catch(e) {
                alert('백업에 실패했습니다.');
            }
        };
    }

    // Load initial
    loadStories();

    // Export function so Bible reader can call it
    window.openStoryModalWithData = (bookName, chapter, verseContent) => {
        const verseRef = `${bookName} ${chapter}장`;
        
        storyType.value = 'word';
        storyType.dispatchEvent(new Event('change'));
        document.getElementById('storyReference').value = verseRef + ' - ' + verseContent;
        storyModal.style.display = 'flex';
        document.getElementById('storyContent').focus();
    };

    // Periodic Notification Check (every 1 minute)
    setInterval(async () => {
        try {
            const res = await fetch('/api/stories');
            if (res.ok) {
                const stories = await res.json();
                checkNotifications(stories);
                // Also update the UI if they are on the story view
                if (document.getElementById('story-view').classList.contains('active')) {
                    renderStories(stories);
                }
            }
        } catch(e) {}
    }, 60000);
}
