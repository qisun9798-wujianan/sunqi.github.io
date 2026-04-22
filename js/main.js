/**
 * 孙琦个人网站 — 主交互逻辑
 * 功能：导航、进度条、视频弹层、GitHub 数据获取
 */

(function () {
    'use strict';

    /* ========================================
       1. 导航与进度条
       ======================================== */
    const slides = document.querySelectorAll('.slide');
    const navDotsContainer = document.getElementById('navDots');
    const progressBar = document.getElementById('progressBar');
    let currentSlide = 0;
    let isScrolling = false;
    let scrollTimeout;

    // 创建导航点
    slides.forEach((slide, i) => {
        const dot = document.createElement('button');
        dot.className = 'nav-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => scrollToSlide(i));
        navDotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.nav-dot');

    function scrollToSlide(index) {
        if (index < 0 || index >= slides.length) return;
        isScrolling = true;
        slides[index].scrollIntoView({ behavior: 'smooth' });
        currentSlide = index;
        updateNav();
        setTimeout(() => { isScrolling = false; }, 800);
    }

    function updateNav() {
        dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
        if (progressBar) {
            progressBar.style.width = ((currentSlide + 1) / slides.length * 100) + '%';
        }
    }

    // 键盘导航
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ') {
            e.preventDefault();
            scrollToSlide(currentSlide + 1);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            scrollToSlide(currentSlide - 1);
        }
    });

    /* ========================================
       2. 滚动监听（与 scroll-effects.js 配合）
       ======================================== */
    const observerOptions = { threshold: 0.45 };
    const slideObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const idx = Array.from(slides).indexOf(entry.target);
                currentSlide = idx;
                updateNav();
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    slides.forEach(slide => slideObserver.observe(slide));

    /* ========================================
       3. 视频弹层
       ======================================== */
    const videoModal = document.getElementById('videoModal');
    const videoFrame = document.getElementById('videoFrame');
    const videoClose = document.getElementById('videoClose');

    document.querySelectorAll('.work-card').forEach(card => {
        card.addEventListener('click', () => {
            const bvid = card.dataset.bvid;
            if (!bvid) return;
            // B站嵌入链接
            videoFrame.src = `//player.bilibili.com/player.html?bvid=${bvid}&autoplay=1`;
            videoModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    function closeVideo() {
        videoModal.classList.remove('active');
        // 延迟清空 src，避免关闭时闪烁
        setTimeout(() => { videoFrame.src = ''; }, 400);
        document.body.style.overflow = '';
    }

    videoClose.addEventListener('click', closeVideo);
    videoModal.addEventListener('click', (e) => {
        if (e.target === videoModal) closeVideo();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && videoModal.classList.contains('active')) closeVideo();
    });

    /* ========================================
       4. GitHub 数据获取（公开 API）
       ======================================== */
    const GITHUB_USERNAME = 'sunqi'; // GitHub 用户名

    async function fetchGitHubStats() {
        if (GITHUB_USERNAME === 'YOUR_GITHUB_USERNAME') return;
        try {
            const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
            if (!res.ok) throw new Error('GitHub API 请求失败');
            const data = await res.json();

            const reposEl = document.getElementById('ghRepos');
            const followersEl = document.getElementById('ghFollowers');
            if (reposEl) reposEl.textContent = data.public_repos || 0;
            if (followersEl) followersEl.textContent = data.followers || 0;
        } catch (err) {
            console.log('GitHub 数据获取失败:', err);
        }
    }

    fetchGitHubStats();

    /* ========================================
       5. 平滑滚动到锚点（内部链接）
       ======================================== */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

})();
