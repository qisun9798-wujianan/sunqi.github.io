/**
 * 孙琦个人网站 — 滚动特效与鼠标拖尾
 * 功能：Canvas 粉色粒子拖尾
 */

(function () {
    'use strict';

    /* ========================================
       1. Canvas 鼠标拖尾（粉色粒子）
       ======================================== */
    const canvas = document.getElementById('cursorTrail');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const MAX_PARTICLES = 60;
    let mouseX = -1000, mouseY = -1000;
    let lastMouseX = -1000, lastMouseY = -1000;

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }

    window.addEventListener('resize', resize);
    resize();

    // 鼠标/触摸追踪
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        spawnParticles();
    });

    document.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            mouseX = e.touches[0].clientX;
            mouseY = e.touches[0].clientY;
            spawnParticles();
        }
    }, { passive: true });

    function spawnParticles() {
        const dx = mouseX - lastMouseX;
        const dy = mouseY - lastMouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // 只在鼠标移动足够距离时生成粒子
        if (dist < 4) return;

        const count = Math.min(3, Math.floor(dist / 8));
        for (let i = 0; i < count; i++) {
            particles.push(createParticle());
        }
        lastMouseX = mouseX;
        lastMouseY = mouseY;
    }

    function createParticle() {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.5 + 0.5;
        return {
            x: mouseX + (Math.random() - 0.5) * 12,
            y: mouseY + (Math.random() - 0.5) * 12,
            vx: Math.cos(angle) * speed * 0.4,
            vy: Math.sin(angle) * speed * 0.4,
            size: Math.random() * 3 + 1.5,
            alpha: Math.random() * 0.35 + 0.15,
            decay: Math.random() * 0.015 + 0.008,
            color: pickColor()
        };
    }

    function pickColor() {
        const colors = [
            '232, 120, 138',   // blush
            '181, 170, 214',   // wisteria-mid
            '160, 217, 190',   // pistachio-mid
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    function updateParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay;
            p.size *= 0.98;

            if (p.alpha <= 0 || p.size < 0.3) {
                particles.splice(i, 1);
            }
        }
        // 限制总数
        if (particles.length > MAX_PARTICLES) {
            particles = particles.slice(-MAX_PARTICLES);
        }
    }

    function drawParticles() {
        ctx.clearRect(0, 0, width, height);
        for (const p of particles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
            ctx.fill();
        }
    }

    function animate() {
        updateParticles();
        drawParticles();
        requestAnimationFrame(animate);
    }

    animate();

    /* ========================================
       2. 装饰元素视差（可选增强）
       ======================================== */
    const blobs = document.querySelectorAll('.blob');
    if (blobs.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.addEventListener('mousemove', (e) => {
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            const dx = (e.clientX - cx) / cx;
            const dy = (e.clientY - cy) / cy;

            blobs.forEach((blob, i) => {
                const factor = (i + 1) * 8;
                blob.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
            });
        });
    }

})();
