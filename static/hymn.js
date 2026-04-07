/**
 * Hymn Split View Logic
 * Handles: Zooming, Scrolling, Contrast, Flex Mode, etc.
 */

// --- 1. Pinch-to-Zoom Logic (Manual Implementation) ---
const scoreWrapper = document.getElementById('score-wrapper');
const scoreImg = document.getElementById('score-img');

let scale = 1;
let currentX = 0;
let currentY = 0;
let initialDistance = 0;
let isPanning = false;
let startX = 0;
let startY = 0;

scoreWrapper.addEventListener('touchstart', (e) => {
  if (e.touches.length === 2) {
    initialDistance = Math.hypot(
      e.touches[0].pageX - e.touches[1].pageX,
      e.touches[0].pageY - e.touches[1].pageY
    );
  } else if (e.touches.length === 1) {
    isPanning = true;
    startX = e.touches[0].pageX - currentX;
    startY = e.touches[0].pageY - currentY;
  }
});

scoreWrapper.addEventListener('touchmove', (e) => {
  if (e.touches.length === 2) {
    const currentDistance = Math.hypot(
      e.touches[0].pageX - e.touches[1].pageX,
      e.touches[0].pageY - e.touches[1].pageY
    );
    const zoomFactor = currentDistance / initialDistance;
    scale = Math.max(0.5, Math.min(scale * zoomFactor, 3));
    initialDistance = currentDistance;
    updateTransform();
  } else if (isPanning && e.touches.length === 1) {
    currentX = e.touches[0].pageX - startX;
    currentY = e.touches[0].pageY - startY;
    updateTransform();
  }
  e.preventDefault(); // Prevent standard scroll
}, { passive: false });

scoreWrapper.addEventListener('touchend', () => {
  isPanning = false;
});

function updateTransform() {
  scoreImg.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;
}

// --- 2. Font Size Slider ---
const fontSizeSlider = document.getElementById('font-size');
const fontSizeVal = document.getElementById('font-size-val');
const lyricsContent = document.getElementById('lyrics-content');

fontSizeSlider.addEventListener('input', (e) => {
  const size = e.target.value;
  lyricsContent.style.fontSize = `${size}px`;
  fontSizeVal.textContent = `${size}px`;
});

// --- 3. High Contrast Mode ---
const btnHighContrast = document.getElementById('btn-high-contrast');
btnHighContrast.addEventListener('click', () => {
  document.body.classList.toggle('high-contrast');
  btnHighContrast.classList.toggle('active');
});

// --- 4. Sync Scroll Logic (Optional) ---
const btnSyncScroll = document.getElementById('btn-sync-scroll');
let isSyncScroll = true;

btnSyncScroll.addEventListener('click', () => {
  isSyncScroll = !isSyncScroll;
  btnSyncScroll.classList.toggle('active', isSyncScroll);
});

// Simple Sync Scroll logic
lyricsContent.addEventListener('scroll', () => {
  if (!isSyncScroll) return;
  // If lyrics scroll 100px, move score wrap roughly by 150px (depending on relative sizes)
  const ratio = (scoreWrapper.scrollHeight - scoreWrapper.clientHeight) / 
                (lyricsContent.scrollHeight - lyricsContent.clientHeight);
  scoreWrapper.scrollTop = lyricsContent.scrollTop * ratio;
});

// --- 5. Full-screen Mode (Layout States) ---
const scoreContainer = document.getElementById('score-container');
const lyricsContainer = document.getElementById('lyrics-container');
const btnFullscreenScore = document.getElementById('btn-fullscreen-score');
const btnFullscreenLyrics = document.getElementById('btn-fullscreen-lyrics');

let currentView = 'split'; // 'split', 'score', 'lyrics'

btnFullscreenScore.addEventListener('click', () => {
  if (currentView === 'score') {
    setLayout('split');
  } else {
    setLayout('score');
  }
});

btnFullscreenLyrics.addEventListener('click', () => {
  if (currentView === 'lyrics') {
    setLayout('split');
  } else {
    setLayout('lyrics');
  }
});

function setLayout(view) {
  currentView = view;
  if (view === 'score') {
    scoreContainer.style.flex = '1';
    lyricsContainer.style.flex = '0';
    lyricsContainer.style.height = '0';
  } else if (view === 'lyrics') {
    scoreContainer.style.flex = '0';
    scoreContainer.style.height = '0';
    lyricsContainer.style.flex = '1';
  } else {
    // Default split
    scoreContainer.style.flex = '6';
    lyricsContainer.style.flex = '4';
    scoreContainer.style.height = '';
    lyricsContainer.style.height = '';
  }
}

// --- 6. Z Flip 7 Flex Mode Simulation ---
// In a real device, you monitor resize or posture events.
function checkFlexMode() {
  const app = document.getElementById('app');
  const isHorizontalFold = window.innerHeight < window.innerWidth && window.innerHeight < 600; 
  // Simplified logic: If the height is very small compared to normal mobile usage, it might be folded (Flex mode)
  // or use the aspect-ratio.
  if (window.innerHeight < 600 && window.innerWidth < 1000) {
     app.classList.add('flex-mode');
  } else {
     app.classList.remove('flex-mode');
  }
}

window.addEventListener('resize', checkFlexMode);
checkFlexMode(); // Initial check

// --- 7. Screen Wake Lock (Keep Screen On) ---
let wakeLock = null;

async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
      console.log('Wake Lock is active');
      wakeLock.addEventListener('release', () => {
        console.log('Wake Lock was released');
      });
    }
  } catch (err) {
    console.error(`${err.name}, ${err.message}`);
  }
}

// Re-request wake lock when page becomes visible again
document.addEventListener('visibilitychange', async () => {
  if (wakeLock !== null && document.visibilityState === 'visible') {
    requestWakeLock();
  }
});

requestWakeLock();

// --- 8. Navigation Dummy ---
document.getElementById('btn-prev').addEventListener('click', () => alert('이전 곡으로 이동합니다.'));
document.getElementById('btn-next').addEventListener('click', () => alert('다음 곡으로 이동합니다.'));
