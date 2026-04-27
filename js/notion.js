/**
 * Notion CMS 数据渲染
 * 从本地 JSON 文件读取 Notion 数据并渲染到页面
 * 数据通过 notion-sync.sh 脚本从 Notion API 同步
 */

(function () {
    'use strict';

    /* ===== 工具函数 ===== */
    async function loadJson(path) {
        try {
            const res = await fetch(path, { cache: 'no-cache' });
            if (!res.ok) return null;
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
        if (!posts || !posts.length) return;

        const grid = document.querySelector('.blog-grid');
        if (!grid) return;

        const delayClasses = ['d3', 'd4', 'd5', 'd6'];
        const sideClasses = ['rv-l', 'rv-r', 'rv-l', 'rv-r'];

        grid.innerHTML = posts.slice(0, 4).map((post, i) => {
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
    }

    /* ===== AI 工具导航 ===== */
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
    document.addEventListener('DOMContentLoaded', () => {
        loadBlogPosts();
        loadAiTools();
    });

})();
