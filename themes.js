// =================================================================================
// THEMES.JS - Advanced Animation Logic for Meditative Quadra
// =================================================================================

// A helper function for random numbers in a range
function random(min, max) {
    return Math.random() * (max - min) + min;
}

// =================================================================================
// 🌲 FOREST THEME
// =================================================================================

let forestAnimationFrameId = null;

function startForestAnimations() {
    if (forestAnimationFrameId) cancelAnimationFrame(forestAnimationFrameId);

    const themeContainer = document.getElementById('forest-theme');
    const firefliesContainer = document.getElementById('fireflies');
    const particleContainer = document.getElementById('forest-particles');

    if (!themeContainer || !firefliesContainer || !particleContainer) {
        console.error("Forest theme containers not found for animation!");
        return;
    }

    const fireflies = [];
    firefliesContainer.innerHTML = '';
    for (let i = 0; i < 25; i++) {
        const el = document.createElement('div');
        el.className = 'firefly';
        firefliesContainer.appendChild(el);
        fireflies.push(new Firefly(el, themeContainer.offsetWidth, themeContainer.offsetHeight));
    }

    // This check prevents re-populating particles on theme re-entry
    if (particleContainer.children.length === 0) {
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'forest-particle';
            const size = random(1, 3);
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.setProperty('--x-start', `${random(0, 100)}vw`);
            particle.style.setProperty('--y-start', `${random(0, 100)}vh`);
            particle.style.setProperty('--x-end', `${random(0, 100)}vw`);
            particle.style.setProperty('--y-end', `${random(0, 100)}vh`);
            particle.style.animationDuration = `${random(15, 30)}s`;
            particle.style.animationDelay = `-${random(0, 30)}s`;
            particleContainer.appendChild(particle);
        }
    }

    function animateForest() {
        if (document.getElementById('forest-theme')?.classList.contains('active')) {
            fireflies.forEach(f => f.update());
            forestAnimationFrameId = requestAnimationFrame(animateForest);
        } else {
            stopForestAnimations();
        }
    }
    animateForest();
}

function stopForestAnimations() {
    if (forestAnimationFrameId) {
        cancelAnimationFrame(forestAnimationFrameId);
        forestAnimationFrameId = null;
    }
}

class Firefly {
    constructor(element, boundsX, boundsY) {
        this.element = element; this.boundsX = boundsX; this.boundsY = boundsY;
        this.x = random(0, this.boundsX || window.innerWidth);
        this.y = random(0, this.boundsY || window.innerHeight);
        this.vx = 0; this.vy = 0; this.wanderAngle = random(0, Math.PI * 2);
        this.lastBlink = Date.now();
        this.blinkDuration = random(100, 300);
        this.nextBlink = random(2000, 5000);
    }
    update() {
        if (this.boundsX === 0) {
            const container = this.element.parentElement?.parentElement;
            if(container) {
                this.boundsX = container.offsetWidth;
                this.boundsY = container.offsetHeight;
            }
        }
        this.wanderAngle += random(-0.4, 0.4);
        this.vx += Math.cos(this.wanderAngle) * 0.08;
        this.vy += Math.sin(this.wanderAngle) * 0.08;
        this.vx *= 0.96; this.vy *= 0.96;
        this.x += this.vx; this.y += this.vy;

        if (this.x < 0) { this.x = 0; this.vx *= -1; }
        if (this.x > this.boundsX) { this.x = this.boundsX; this.vx *= -1; }
        if (this.y < 0) { this.y = 0; this.vy *= -1; }
        if (this.y > this.boundsY) { this.y = this.boundsY; this.vy *= -1; }

        const now = Date.now();
        if (now - this.lastBlink > this.nextBlink) {
            this.element.style.opacity = '1';
            this.element.style.boxShadow = '0 0 18px #f0f0aa, 0 0 28px #f0f0aa';
            setTimeout(() => {
                this.element.style.opacity = '0.5';
                this.element.style.boxShadow = '0 0 12px #f0f0aa, 0 0 20px #f0f0aa';
            }, this.blinkDuration);
            this.lastBlink = now;
            this.nextBlink = random(2000, 8000);
        }

        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
    }
}