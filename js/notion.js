/**
 * Notion CMS 数据渲染
 * 从本地 JSON 文件读取 Notion 数据并渲染到页面
 */

(function () {
    'use strict';

    // 本地 file:// 协议下 fetch 会被浏览器拦截，跳过动态加载
    if (window.location.protocol === 'file:') {
        console.log('[Notion CMS] file:// 协议 detected，跳过 JSON 加载，使用页面内联数据');
        return;
    }

    /* ===== 工具函数 ===== */
    async function loadJson(path) {
        try {
            const res = await fetch(path, { cache: 'no-cache' });
            if (!res.ok) { console.error('HTTP', res.status, path); return null; }
            return res.json();
        } catch (err) {
            console.error('加载 JSON 失败:', path, err);
            return null;
        }
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[m]));
    }

    /* ===== 博客文章 ===== */
    async function loadBlogPosts() {
        const posts = await loadJson('data/blog.json');
        const grid = document.querySelector('.blog-grid');
        if (!grid) return;

        // 最多取 3 篇，第 4 个位置留给 AI 工具导航
        const validPosts = (posts || []).slice(0, 3);
        const delayClasses = ['d3', 'd4', 'd5'];
        const sideClasses = ['rv-l', 'rv-r', 'rv-l'];

        const postHtml = validPosts.map((post, i) => {
            const delay = delayClasses[i] || 'd3';
            const side = sideClasses[i] || 'rv-l';
            const dateStr = post.date ? post.date.replace(/-/g, '.') : '';
            return `
                <a class="blog-card glass ${side} ${delay}" href="${post.url}" target="_blank" rel="noopener">
                    <div class="blog-date">${dateStr}</div>
                    <div class="blog-title">${escapeHtml(post.title)}</div>
                    <div class="blog-excerpt">${escapeHtml(post.excerpt)}</div>
                    <div class="blog-tag">${escapeHtml(post.category)} →</div>
                </a>
            `;
        }).join('');

        // AI 工具导航入口卡片
        const toolsCard = `
            <a class="blog-card glass rv-r d6" href="ai-tools.html">
                <div class="blog-date">AI NAV</div>
                <div class="blog-title">AI 工具导航</div>
                <div class="blog-excerpt">精选实用 AI 工具，提升创作效率。图像、视频、写作、代码...</div>
                <div class="blog-tag">工具导航 →</div>
            </a>
        `;

        grid.innerHTML = postHtml + toolsCard;
    }

    /* ===== AI 工具导航（独立页面用） ===== */
    async function loadAiTools() {
        const tools = await loadJson('data/tools.json');
        if (!tools || !tools.length) return;

        const container = document.getElementById('aiToolsGrid');
        if (!container) return;

        container.innerHTML = tools.map(tool => `
            <a class="ai-tool-card" href="${tool.url}" target="_blank" rel="noopener">
                <div class="ai-tool-header">
                    <span class="ai-tool-name">${escapeHtml(tool.name)}</span>
                    <span class="ai-tool-rating">${tool.rating}</span>
                </div>
                <div class="ai-tool-desc">${escapeHtml(tool.description)}</div>
                <div class="ai-tool-meta">
                    <span class="ai-tool-cat">${escapeHtml(tool.category)}</span>
                    ${tool.tags.map(t => `<span class="ai-tool-tag">${escapeHtml(t)}</span>`).join('')}
                </div>
            </a>
        `).join('');
    }

    /* ===== 初始化 ===== */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            loadBlogPosts();
            loadAiTools();
        });
    } else {
        loadBlogPosts();
        loadAiTools();
    }

})();
