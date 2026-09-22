import { AIOrder } from '../types';
import { SlideContent, PresentationThemeId } from './pptxExport';

export function generateInteractiveHtmlPresentation(
  order: AIOrder,
  slides: SlideContent[],
  defaultTheme: PresentationThemeId = 'sapphire'
): string {
  const safeTitle = (order.topic || 'Prezentatsiya')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const slidesJson = JSON.stringify(slides);

  return `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <title>${safeTitle} — StudyHub Taqdimot</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    :root {
      --bg: #0A1128;
      --card-bg: #131E3D;
      --title-color: #38BDF8;
      --text-color: #F1F5F9;
      --accent-color: #38BDF8;
      --subtext-color: #94A3B8;
      --highlight-bg: #1E3A8A;
      --highlight-text: #93C5FD;
      --border-color: #1E293B;
    }

    body[data-theme="academic"] {
      --bg: #F8FAFC;
      --card-bg: #FFFFFF;
      --title-color: #1E3A8A;
      --text-color: #1E293B;
      --accent-color: #2563EB;
      --subtext-color: #475569;
      --highlight-bg: #EFF6FF;
      --highlight-text: #1D4ED8;
      --border-color: #E2E8F0;
    }

    body[data-theme="executive"] {
      --bg: #0F172A;
      --card-bg: #1E293B;
      --title-color: #F59E0B;
      --text-color: #F8FAFC;
      --accent-color: #FBBF24;
      --subtext-color: #94A3B8;
      --highlight-bg: #451A03;
      --highlight-text: #FDE68A;
      --border-color: #334155;
    }

    body[data-theme="emerald"] {
      --bg: #06241B;
      --card-bg: #0B3B2D;
      --title-color: #34D399;
      --text-color: #ECFDF5;
      --accent-color: #10B981;
      --subtext-color: #A7F3D0;
      --highlight-bg: #064E3B;
      --highlight-text: #6EE7B7;
      --border-color: #047857;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: var(--bg);
      color: var(--text-color);
      transition: background 0.3s ease, color 0.3s ease;
    }

    /* Top Progress Bar */
    #progress-bar {
      position: fixed;
      top: 0;
      left: 0;
      height: 4px;
      background: var(--accent-color);
      z-index: 100;
      transition: width 0.25s ease;
    }

    /* Header Nav */
    header {
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      background: rgba(15, 23, 42, 0.4);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid var(--border-color);
      z-index: 40;
    }

    .brand-block {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      font-weight: 700;
    }

    .brand-badge {
      background: var(--accent-color);
      color: #000;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.5px;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .theme-select {
      background: var(--card-bg);
      color: var(--text-color);
      border: 1px solid var(--border-color);
      padding: 6px 12px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }

    .action-btn {
      background: var(--card-bg);
      color: var(--text-color);
      border: 1px solid var(--border-color);
      padding: 6px 12px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }

    .action-btn:hover {
      border-color: var(--accent-color);
      color: var(--accent-color);
    }

    /* Main Slide Stage */
    main {
      height: calc(100vh - 120px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      position: relative;
    }

    .slide-viewport {
      width: 100%;
      max-width: 1100px;
      aspect-ratio: 16 / 9;
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 24px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      padding: 48px 56px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from { opacity: 0; transform: scale(0.985); }
      to { opacity: 1; transform: scale(1); }
    }

    /* Category & Slide Number */
    .slide-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .category-tag {
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: var(--accent-color);
    }

    .slide-counter {
      font-family: monospace;
      font-size: 13px;
      font-weight: 700;
      color: var(--subtext-color);
    }

    .slide-title {
      font-size: 32px;
      font-weight: 900;
      color: var(--title-color);
      line-height: 1.25;
      letter-spacing: -0.5px;
    }

    .slide-subtitle {
      font-size: 15px;
      color: var(--subtext-color);
      margin-top: 6px;
      font-style: italic;
    }

    .slide-content-grid {
      flex: 1;
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
      margin-top: 28px;
      align-content: start;
    }

    .with-highlight {
      grid-template-columns: 3fr 2fr;
    }

    .bullets-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .bullet-item {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      font-size: 17px;
      line-height: 1.55;
      color: var(--text-color);
    }

    .bullet-marker {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--accent-color);
      margin-top: 8px;
      flex-shrink: 0;
    }

    .bullet-item strong {
      color: var(--accent-color);
    }

    .highlight-card {
      background: var(--highlight-bg);
      border: 1px solid var(--accent-color);
      border-radius: 18px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 10px;
    }

    .highlight-label {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1px;
      color: var(--accent-color);
      text-transform: uppercase;
    }

    .highlight-value {
      font-size: 20px;
      font-weight: 800;
      color: var(--highlight-text);
      line-height: 1.35;
    }

    /* Title Slide Specific */
    .title-slide-layout {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 20px;
    }

    .title-slide-layout .slide-title {
      font-size: 42px;
    }

    .presenter-pill {
      display: inline-flex;
      align-items: center;
      gap: 16px;
      background: var(--highlight-bg);
      border: 1px solid var(--border-color);
      padding: 12px 20px;
      border-radius: 16px;
      font-size: 14px;
      margin-top: 24px;
      width: fit-content;
    }

    /* Visual Cue footer inside slide */
    .slide-visual-cue {
      margin-top: 20px;
      padding: 10px 16px;
      border-radius: 10px;
      background: rgba(56, 189, 248, 0.08);
      border-left: 3px solid var(--accent-color);
      font-size: 12px;
      color: var(--subtext-color);
    }

    /* Speaker Notes Bar (Collapsible Prompter) */
    #speaker-notes-prompter {
      position: fixed;
      bottom: 64px;
      left: 50%;
      transform: translateX(-50%);
      width: calc(100% - 48px);
      max-width: 900px;
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid #f59e0b;
      border-radius: 16px;
      padding: 16px 20px;
      color: #fde68a;
      font-size: 14px;
      line-height: 1.5;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
      z-index: 50;
      display: none;
    }

    #speaker-notes-prompter.visible {
      display: block;
    }

    /* Bottom Control Bar */
    footer {
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      background: rgba(15, 23, 42, 0.4);
      backdrop-filter: blur(8px);
      border-top: 1px solid var(--border-color);
      z-index: 40;
    }

    .nav-btn {
      background: var(--card-bg);
      color: var(--text-color);
      border: 1px solid var(--border-color);
      padding: 10px 20px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.15s ease;
    }

    .nav-btn:hover:not(:disabled) {
      background: var(--accent-color);
      color: #000;
    }

    .nav-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .timer-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: monospace;
      font-size: 15px;
      font-weight: 700;
      color: var(--subtext-color);
      background: var(--card-bg);
      padding: 6px 14px;
      border-radius: 10px;
      border: 1px solid var(--border-color);
    }

    /* Print Styles (PDF Ready) */
    @media print {
      @page {
        size: landscape;
        margin: 0;
      }
      body {
        background: #fff !important;
        color: #000 !important;
        overflow: visible !important;
        height: auto !important;
      }
      #progress-bar, header, footer, #speaker-notes-prompter {
        display: none !important;
      }
      main {
        display: block !important;
        padding: 0 !important;
        height: auto !important;
      }
      .slide-viewport {
        page-break-after: always !important;
        break-after: page !important;
        width: 100vw !important;
        height: 100vh !important;
        max-width: none !important;
        border: none !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        margin: 0 !important;
        background: #fff !important;
        color: #111 !important;
      }
      .slide-title { color: #1e3a8a !important; }
      .bullet-marker { background: #2563eb !important; }
    }
  </style>
</head>
<body data-theme="${defaultTheme}">
  <div id="progress-bar" style="width: 0%;"></div>

  <header>
    <div class="brand-block">
      <span class="brand-badge">STUDYHUB AI</span>
      <span style="max-width: 450px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
        ${safeTitle}
      </span>
    </div>

    <div class="header-actions">
      <select id="theme-selector" class="theme-select" onchange="changeTheme(this.value)">
        <option value="sapphire">Qorong‘u (Sapphire)</option>
        <option value="academic">Akademik (Oq)</option>
        <option value="executive">Biznes (Oltin)</option>
        <option value="emerald">Emerald (Yashil)</option>
      </select>

      <button class="action-btn" onclick="toggleNotes()">
        <span>🎙️ Notiq nutqi (N)</span>
      </button>

      <button class="action-btn" onclick="toggleFullscreen()">
        <span>⛶ Katta ekran (F)</span>
      </button>

      <button class="action-btn" onclick="window.print()">
        <span>🖨️ PDF ga chiqarish (P)</span>
      </button>
    </div>
  </header>

  <main>
    <div class="slide-viewport" id="slide-stage"></div>
  </main>

  <div id="speaker-notes-prompter">
    <div style="font-weight: 800; margin-bottom: 4px; color: #fbbf24;">🎙️ NOTIQ UCHUN TAYYOR NUTQ MATNI:</div>
    <div id="speaker-notes-content"></div>
  </div>

  <footer>
    <button id="prev-btn" class="nav-btn" onclick="prevSlide()">
      <span>← Oldingi slayd</span>
    </button>

    <div style="display: flex; align-items: center; gap: 16px;">
      <div class="timer-badge">
        <span>⏱️</span>
        <span id="presentation-timer">00:00</span>
      </div>
      <span style="font-size: 13px; color: var(--subtext-color);">
        Klaviatura: <kbd>←</kbd> <kbd>→</kbd> <kbd>Bo‘sh joy</kbd> | <kbd>F</kbd> Katta ekran
      </span>
    </div>

    <button id="next-btn" class="nav-btn" onclick="nextSlide()">
      <span>Keyingi slayd →</span>
    </button>
  </footer>

  <script>
    const slides = ${slidesJson};
    let current = 0;
    let timerSeconds = 0;
    let timerInterval = null;

    function startTimer() {
      if (timerInterval) return;
      timerInterval = setInterval(() => {
        timerSeconds++;
        const mins = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
        const secs = String(timerSeconds % 60).padStart(2, '0');
        document.getElementById('presentation-timer').innerText = mins + ':' + secs;
      }, 1000);
    }

    function renderSlide() {
      const s = slides[current];
      const isFirst = current === 0;
      const isLast = current === slides.length - 1;

      // Progress bar
      const progressPercent = ((current + 1) / slides.length) * 100;
      document.getElementById('progress-bar').style.width = progressPercent + '%';

      // Buttons state
      document.getElementById('prev-btn').disabled = current === 0;
      document.getElementById('next-btn').disabled = current === slides.length - 1;

      const stage = document.getElementById('slide-stage');

      let inner = '';
      if (isFirst) {
        inner = \`
          <div class="title-slide-layout">
            <div class="slide-meta">
              <span class="category-tag">AKADEMIK TAQDIMOT • STUDYHUB AI</span>
              <span class="slide-counter">SLAYD 1 / \${slides.length}</span>
            </div>
            <h1 class="slide-title">\${s.title}</h1>
            \${s.subtitle ? \`<p class="slide-subtitle">\${s.subtitle}</p>\` : ''}
            
            <div class="bullets-list" style="margin-top: 18px;">
              \${s.bullets.slice(0, 3).map(b => \`
                <div class="bullet-item">
                  <div class="bullet-marker"></div>
                  <span>\${formatBullet(b)}</span>
                </div>
              \`).join('')}
            </div>

            <div class="presenter-pill">
              <span>🎓 <strong>Ma'ruzachi:</strong> Talaba</span>
              <span>📅 <strong>Sana:</strong> \${new Date().toLocaleDateString('uz-UZ')}</span>
              <span>📑 <strong>Jami:</strong> \${slides.length} ta slayd</span>
            </div>
          </div>
        \`;
      } else {
        const hasHighlight = !!s.highlightFact;
        inner = \`
          <div>
            <div class="slide-meta">
              <span class="category-tag">\${s.category || 'Mavzu Tahlili'}</span>
              <span class="slide-counter">SLAYD \${s.number} / \${slides.length}</span>
            </div>
            <h2 class="slide-title">\${s.title}</h2>
            \${s.subtitle ? \`<p class="slide-subtitle">\${s.subtitle}</p>\` : ''}

            <div class="slide-content-grid \${hasHighlight ? 'with-highlight' : ''}">
              <div class="bullets-list">
                \${s.bullets.map(b => \`
                  <div class="bullet-item">
                    <div class="bullet-marker"></div>
                    <span>\${formatBullet(b)}</span>
                  </div>
                \`).join('')}
              </div>

              \${hasHighlight ? \`
                <div class="highlight-card">
                  <span class="highlight-label">ASOSIY KO'RSATKICH</span>
                  <div class="highlight-value">\${s.highlightFact}</div>
                </div>
              \` : ''}
            </div>
          </div>

          \${s.visualCue ? \`
            <div class="slide-visual-cue">
              <strong>🎨 Vizual tavsiya:</strong> \${s.visualCue}
            </div>
          \` : ''}
        \`;
      }

      stage.innerHTML = inner;

      // Update speaker notes
      const notesEl = document.getElementById('speaker-notes-content');
      notesEl.innerText = s.speakerNote || "Ushbu slayd bo'yicha asosiy tezislarni ta'kidlab o'ting.";
    }

    function formatBullet(str) {
      if (!str) return '';
      const parts = str.split(':');
      if (parts.length > 1) {
        return '<strong>' + parts[0] + ':</strong>' + parts.slice(1).join(':');
      }
      return str;
    }

    function nextSlide() {
      if (current < slides.length - 1) {
        current++;
        renderSlide();
      }
    }

    function prevSlide() {
      if (current > 0) {
        current--;
        renderSlide();
      }
    }

    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
    }

    function toggleNotes() {
      const prompter = document.getElementById('speaker-notes-prompter');
      prompter.classList.toggle('visible');
    }

    function changeTheme(theme) {
      document.body.setAttribute('data-theme', theme);
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Home') {
        e.preventDefault();
        current = 0;
        renderSlide();
      } else if (e.key === 'End') {
        e.preventDefault();
        current = slides.length - 1;
        renderSlide();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'n' || e.key === 'N') {
        toggleNotes();
      } else if (e.key === 'p' || e.key === 'P') {
        if (!e.ctrlKey && !e.metaKey) {
          window.print();
        }
      }
    });

    startTimer();
    renderSlide();
  </script>
</body>
</html>`;
}
