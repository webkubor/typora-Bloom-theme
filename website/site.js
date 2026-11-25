// 动态生成主题菜单
if (window.THEME_CONFIG) {
  const menu = document.getElementById('theme-menu');
  if (menu) {
    menu.innerHTML = '';
    Object.keys(window.THEME_CONFIG).forEach(key => {
      const theme = window.THEME_CONFIG[key];
      const btn = document.createElement('button');
      btn.className = 'theme-item';
      btn.dataset.theme = key;
      btn.textContent = theme.name;
      menu.appendChild(btn);
    });
  }
}

const themeLink = document.getElementById('theme-css');
const themeTrigger = document.getElementById('theme-trigger');
const themeMenu = document.getElementById('theme-menu');
const themeItems = document.querySelectorAll('.theme-item');
const currentThemeDisplay = document.getElementById('current-theme-name');

let currentTheme = window.THEME_DEFAULT || 'petal';

// Initialize with default theme
document.addEventListener('DOMContentLoaded', () => {
  // Determine active theme (prioritize window.THEME_DEFAULT if available)
  // If logic above set currentTheme, we just use it.
  if (currentTheme) {
    setTheme(currentTheme);
  }
});

// 修改后的设置函数
function setTheme(themeName) {
  const write = document.getElementById('write');
  // 触发重新渲染动画
  if (write) {
    write.style.animation = 'none';
    void write.offsetWidth;
    write.style.animation = null;
  }

  // 根据主题名动态加载对应的 CSS 文件
  if (themeLink) {
    themeLink.setAttribute('href', `dist/bloom-${themeName}.css`);
  }

  // 更新界面文本与状态
  updateThemeUI(themeName);

  // 设置系统的 color-scheme
  // 简单的启发式：名字包含 'dark' 的就是深色主题
  const isDark = themeName.includes('dark');
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';

  currentTheme = themeName;
  updateDynamicFavicon();

  // Reload page to re-initialize Mermaid with new theme if needed
  // (Mermaid doesn't support easy theme switching without re-init)
  if (window.mermaid && document.querySelector('.mermaid')) {
    // Check if we switched from light to dark or vice versa
    const oldIsDark = document.documentElement.style.colorScheme === 'dark';
    const newIsDark = themeName.includes('dark');
    if (oldIsDark !== newIsDark) {
      // Ideally we would just re-render, but mermaid.initialize only works once per load usually.
      // For now, let's just accept that dynamic switch might need reload, 
      // OR we try to reset. But simple approach: 
      // Let's just update colorScheme. Users can refresh if they want perfect diagrams.
      // Actually, user expects "preview" to work.
      // Let's try to set attribute on body and let CSS variables handle it if we used 'base' theme?
      // But we used 'dark' theme for dark mode.
      // Let's stick with current approach of init on load.
    }
  }
}

/**
 * 根据当前主题动态生成并更新浏览器 Favicon
 */
function updateDynamicFavicon() {
  // Use global configuration or fallback to empty object if not loaded
  const config = window.THEME_CONFIG || {};

  // Fallback defaults if config is missing (e.g. if script failed to load)
  const defaultColors = { accent: '#e8859b', bg: '#fdf9fa' };

  const themeData = config[currentTheme] || config['petal'] || defaultColors;
  const colors = {
    accent: themeData.accent || defaultColors.accent,
    bg: themeData.bg || defaultColors.bg
  };

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <defs>
        <linearGradient id="f" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${colors.accent}"/>
          <stop offset="1" stop-color="${colors.accent}"/>
        </linearGradient>
      </defs>
      <g transform="translate(10,10)">
        <g fill="url(#f)">
          <path d="M30 12c7 0 12 6 12 12 0 7-6 14-12 14S18 31 18 24c0-6 5-12 12-12Z"/>
          <path d="M16 28c6-4 14-3 18 2 5 6 2 16-6 20-8 4-17 1-20-7-2-6 2-12 8-15Z" opacity="0.92"/>
          <path d="M44 28c6 3 10 9 8 15-3 8-12 11-20 7-8-4-11-14-6-20 4-5 12-6 18-2Z" opacity="0.92"/>
        </g>
        <circle cx="30" cy="32" r="5" fill="${colors.bg}" opacity="0.92"/>
      </g>
    </svg>`.trim();

  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  let link = document.querySelector("link[rel*='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = url;
}

// 统一管理主题 UI 状态
function updateThemeUI(activeTheme) {
  const config = window.THEME_CONFIG || {};
  const currentData = config[activeTheme];
  const label = currentData ? currentData.name : activeTheme;

  // 更新触发器文字
  if (currentThemeDisplay) {
    currentThemeDisplay.textContent = label;
  }

  // 更新菜单项选中状态
  themeItems.forEach(item => {
    item.classList.toggle('active', item.dataset.theme === activeTheme);
  });
}

// 下拉菜单交互
if (themeTrigger && themeMenu) {
  themeTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    themeMenu.classList.toggle('show');
    themeTrigger.classList.toggle('active');
  });

  document.addEventListener('click', () => {
    themeMenu.classList.remove('show');
    themeTrigger.classList.remove('active');
  });

  themeItems.forEach(item => {
    item.addEventListener('click', () => {
      const theme = item.dataset.theme;
      setTheme(theme);
    });
  });
}





// Button hover effects
const cards = document.querySelectorAll('.sidebar-card a');
cards.forEach(btn => {
  btn.onmouseenter = () => {
    btn.style.transform = 'translateY(-2px)';
    btn.style.boxShadow = '0 8px 20px var(--accent-2)';
  };
  btn.onmouseleave = () => {
    btn.style.transform = 'translateY(0)';
    btn.style.boxShadow = 'none';
  };
});



function getCodeLanguage(codeEl, preEl) {
  const preLang = preEl?.getAttribute('lang') || preEl?.getAttribute('data-lang');
  if (preLang) return preLang;

  const m = (codeEl.className || '').match(/language-([a-z0-9_-]+)/i);
  if (m && m[1]) return m[1];
  return '';
}

async function copyText(text) {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    await navigator.clipboard.writeText(text);
    return;
  }

  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.top = '-9999px';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  ta.remove();
}

function enhanceCodeBlocks() {
  const pres = document.querySelectorAll('#write pre');
  pres.forEach(pre => {
    if (pre.dataset.enhanced === 'true') return;
    const code = pre.querySelector('code');
    if (!code) return;

    const lang = getCodeLanguage(code, pre);
    pre.dataset.lang = lang;
    pre.classList.add('has-toolbar');
    pre.classList.add('md-fences'); // 注入类名以匹配 Typora 原生样式（如彩色圆点）

    const toolbar = document.createElement('div');
    toolbar.className = 'code-toolbar';

    const langEl = document.createElement('span');
    langEl.className = 'code-lang';
    langEl.textContent = lang ? lang.toUpperCase() : 'CODE';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'code-copy-btn';
    copyBtn.type = 'button';
    copyBtn.textContent = '复制';

    copyBtn.addEventListener('click', async () => {
      const raw = code.textContent || '';
      try {
        await copyText(raw);
        copyBtn.textContent = '已复制';
        copyBtn.dataset.state = 'copied';
        window.setTimeout(() => {
          copyBtn.textContent = '复制';
          delete copyBtn.dataset.state;
        }, 1400);
      } catch {
        copyBtn.textContent = '失败';
        window.setTimeout(() => {
          copyBtn.textContent = '复制';
        }, 1400);
      }
    });

    toolbar.appendChild(langEl);
    toolbar.appendChild(copyBtn);
    pre.insertBefore(toolbar, pre.firstChild);
    pre.dataset.enhanced = 'true';
  });
}

enhanceCodeBlocks();

// --- Advanced Interactions ---

// 1. Scroll Reveal Observer
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal-on-scroll').forEach(el => revealObserver.observe(el));

// 2. 3D Card Tilt Effect (Optimized with rAF)
const premiumCards = document.querySelectorAll('.premium-card');
premiumCards.forEach(card => {
  let ticking = false;

  card.addEventListener('mousemove', e => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        // Reduce rotation intensity for smoother feel
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        ticking = false;
      });
      ticking = true;
    }
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
  });
});

// 3. Magnetic Download Button (Optimized with rAF)
const magneticBtn = document.getElementById('btn-download');
if (magneticBtn) {
  let ticking = false;

  document.addEventListener('mousemove', e => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const rect = magneticBtn.getBoundingClientRect();
        const mX = e.clientX;
        const mY = e.clientY;
        const bX = rect.left + rect.width / 2;
        const bY = rect.top + rect.height / 2;
        const dist = Math.sqrt(Math.pow(mX - bX, 2) + Math.pow(mY - bY, 2));

        // Only animate if close enough (performance optimization)
        if (dist < 150) {
          const x = (mX - bX) * 0.3;
          const y = (mY - bY) * 0.3;
          magneticBtn.style.transform = `translate(${x}px, ${y}px) scale(1.05)`;
          magneticBtn.style.boxShadow = `0 12px 30px var(--accent-2)`;
        } else {
          // Only reset if currently transformed (check style presence to avoid unnecessary layout thrashing)
          if (magneticBtn.style.transform) {
            magneticBtn.style.transform = '';
            magneticBtn.style.boxShadow = '';
          }
        }
        ticking = false;
      });
      ticking = true;
    }
  });
}

// 4. Parallax Hero Badge
const hero = document.querySelector('.hero');
if (hero) {
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const badge = document.querySelector('.hero-badge');
    if (badge) {
      badge.style.transform = `translateY(${scrolled * 0.1}px)`;
    }
  });
}

// ===== 色卡墙 + GitHub Reactions 投票 =====
const PALETTE_VOTE_ISSUE = 22;

(function initPaletteWall() {
  const grid = document.getElementById('palette-grid');
  if (!grid || !window.THEME_CONFIG) return;
  const config = window.THEME_CONFIG;
  const groups = Object.keys(config).filter((key) => !key.endsWith('-dark'));

  grid.innerHTML = groups.map((key) => {
    const light = config[key];
    const dark = config[`${key}-dark`] || light;
    return `<article class="palette-card" data-palette="${key}">
      <div class="palette-swatches">
        <button class="swatch" data-theme="${key}" title="预览 ${light.name}" style="background:${light.bg}">
          <i style="background:${light.accent}"></i><small style="color:${light.text}">浅</small>
        </button>
        <button class="swatch" data-theme="${key}-dark" title="预览 ${dark.name}" style="background:${dark.bg}">
          <i style="background:${dark.accent}"></i><small style="color:${dark.text}">暗</small>
        </button>
      </div>
      <div class="palette-meta">
        <span class="palette-name">${light.name}</span>
        <a class="palette-vote" data-vote="${key}" target="_blank" rel="noopener"
          href="https://github.com/webkubor/typora-Bloom-theme/issues/${PALETTE_VOTE_ISSUE}"
          title="去 GitHub 为这组配色点赞">👍 <b>·</b></a>
      </div>
    </article>`;
  }).join('');

  grid.addEventListener('click', (event) => {
    const swatch = event.target.closest('.swatch');
    if (!swatch) return;
    setTheme(swatch.dataset.theme);
    const preview = document.querySelector('.preview-container');
    if (preview) preview.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  loadPaletteVotes();
})();

async function loadPaletteVotes() {
  const CACHE_KEY = 'bloom-palette-votes-v1';
  const TTL = 10 * 60 * 1000;
  let votes = null;

  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (cached && Date.now() - cached.t < TTL) votes = cached.votes;
  } catch (_) { /* ignore broken cache */ }

  if (!votes) {
    try {
      const res = await fetch(
        `https://api.github.com/repos/webkubor/typora-Bloom-theme/issues/${PALETTE_VOTE_ISSUE}/comments?per_page=30`
      );
      if (!res.ok) return;
      const comments = await res.json();
      votes = {};
      comments.forEach((comment) => {
        const marker = (comment.body || '').match(/<!--\s*vote:([a-z-]+)\s*-->/);
        if (marker) {
          votes[marker[1]] = {
            count: comment.reactions ? comment.reactions['+1'] || 0 : 0,
            url: comment.html_url,
          };
        }
      });
      localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), votes }));
    } catch (_) {
      return; // offline / rate limited — keep placeholder
    }
  }

  Object.entries(votes).forEach(([key, vote]) => {
    const el = document.querySelector(`[data-vote="${key}"]`);
    if (el) {
      el.href = vote.url;
      el.querySelector('b').textContent = vote.count;
    }
  });
}
