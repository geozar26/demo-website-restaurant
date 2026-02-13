/**
 * @file main.ts / main.js
 * Πλήρως συμβατό με TypeScript ορισμούς αλλά σε καθαρή JS για να παίζει παντού.
 */

// --- 1. COOKIE LOGIC ---
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/;SameSite=Lax";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// --- 2. CAROUSEL TOOLTIP LOGIC ---
function initTooltips() {
    const carouselCards = document.querySelectorAll(".carousel-card, [data-dish]");
    carouselCards.forEach(card => {
        card.style.cursor = "pointer";
        card.style.webkitTapHighlightColor = "transparent";

        card.addEventListener("click", (e) => {
            e.stopPropagation();
            const dishId = card.getAttribute("data-dish");
            if (!dishId) return;
            
            const tooltip = document.getElementById(`modal-${dishId}`);
            if (tooltip) {
                const isOpen = tooltip.getAttribute('data-open') === 'true';
                if (isOpen) {
                    tooltip.style.display = "none";
                    tooltip.setAttribute('data-open', 'false');
                } else {
                    document.querySelectorAll('[id^="modal-"]').forEach(t => {
                        t.style.display = "none";
                        t.setAttribute('data-open', 'false');
                    });
                    tooltip.style.display = "block";
                    tooltip.setAttribute('data-open', 'true');
                    tooltip.style.backfaceVisibility = "hidden";
                }
            }
        });
    });
}

// --- 3. CAROUSEL ENGINE (ORIGINAL LOGIC RESTORED) ---
function setupCarousel(selector) {
    const section = document.querySelector(selector);
    if (!section) return;

    const track = section.querySelector(".carousel-track");
    const container = section.querySelector(".carousel-container");
    const dotsContainer = section.querySelector(".carousel-dots");
    const cards = track ? Array.from(track.children) : [];

    if (!track || cards.length === 0) return;

    // Reset initial styles
    track.style.display = "flex";
    track.style.flexWrap = "nowrap";
    track.style.visibility = "hidden";
    track.style.opacity = "0";

    let currentSlide = 0;
    let cardWidth, gap, slideDistance;

    function updateDimensions() {
        const containerWidth = container.offsetWidth;
        if (containerWidth < 360) {
            cardWidth = containerWidth - 20; 
            gap = 20;
        } else {
            cardWidth = 300;
            gap = 30;
        }
        slideDistance = cardWidth + gap;
        track.style.gap = `${gap}px`;

        cards.forEach(card => {
            card.style.flex = `0 0 ${cardWidth}px`;
            card.style.width = `${cardWidth}px`;
            const img = card.querySelector("img");
            if (img) {
                img.style.width = "100%";
                img.style.height = "160px";
                img.style.objectFit = "cover";
            }
        });
    }

    function getMaxTranslate() {
        return Math.max(0, track.scrollWidth - container.offsetWidth);
    }

    function getTotalSteps() {
        const maxT = getMaxTranslate();
        if (maxT <= 0) return 0;
        return Math.ceil(maxT / slideDistance);
    }

    function moveToSlide(index) {
        const maxSteps = getTotalSteps();
        const maxTranslate = getMaxTranslate();

        if (index < 0) currentSlide = 0;
        else if (index > maxSteps) currentSlide = maxSteps;
        else currentSlide = index;

        let translateValue = Math.min(currentSlide * slideDistance, maxTranslate);

        track.style.transition = 'transform 0.5s ease-out';
        track.style.transform = `translateX(${-translateValue}px)`;

        updateDots();
    }

    function createDots() {
        if (!dotsContainer) return;
        dotsContainer.innerHTML = '';
        const totalSteps = getTotalSteps();
        if (totalSteps === 0) return;

        for (let i = 0; i <= totalSteps; i++) {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (i === currentSlide) dot.classList.add('active');
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                moveToSlide(i);
            });
            dotsContainer.appendChild(dot);
        }
    }

    function updateDots() {
        if (!dotsContainer) return;
        const dots = dotsContainer.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }

    // Touch Logic
    let startX = 0, startY = 0, isMoving = false;
    container.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isMoving = true;
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
        if (!isMoving) return;
        const diffX = startX - e.changedTouches[0].clientX;
        const diffY = startY - e.changedTouches[0].clientY;
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            if (diffX > 0) moveToSlide(currentSlide + 1);
            else moveToSlide(currentSlide - 1);
        }
        isMoving = false;
    }, { passive: true });

    function revealCarousel() {
        updateDimensions();
        createDots();
        moveToSlide(currentSlide);
        requestAnimationFrame(() => {
            track.style.visibility = "visible";
            track.style.opacity = "1";
            track.style.transition = "opacity 0.4s ease";
        });
    }

    // Image Load Check
    const allImages = track.querySelectorAll("img");
    let loadedCount = 0;
    if (allImages.length === 0) revealCarousel();
    else {
        allImages.forEach(img => {
            if (img.complete) {
                loadedCount++;
                if (loadedCount === allImages.length) revealCarousel();
            } else {
                img.addEventListener('load', () => {
                    loadedCount++;
                    if (loadedCount === allImages.length) revealCarousel();
                });
            }
        });
    }

    window.addEventListener('resize', () => {
        updateDimensions();
        createDots();
        moveToSlide(currentSlide);
    });
}

// --- 4. GSAP ANIMATIONS ---
function initGSAP() {
    if (typeof gsap === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const commonScroll = (trigger) => ({
        trigger: trigger,
        start: "top 80%",
        toggleActions: "play none none none"
    });

    if (document.querySelector(".items")) {
        gsap.from(".items .item", {
            scrollTrigger: commonScroll(".items"),
            opacity: 0, y: 40, scale: 0.9, duration: 0.6, stagger: 0.35, ease: "power2.out"
        });
    }

    if (document.querySelector(".testimonials-section")) {
        gsap.from(".testimonial-card", {
            scrollTrigger: commonScroll(".testimonials-section"),
            opacity: 0, y: 40, scale: 0.9, duration: 0.6, stagger: 0.4, ease: "power2.out"
        });
    }

    if (document.querySelector(".gallery")) {
        gsap.from(".gallery-container .box", {
            scrollTrigger: commonScroll(".gallery"),
            opacity: 0, y: 30, scale: 0.9, duration: 0.5, stagger: 0.2, ease: "power2.out"
        });
    }
}

// --- 5. INITIALIZE EVERYTHING ---
document.addEventListener("DOMContentLoaded", () => {
    initTooltips();
    setupCarousel(".todays-specials");
    setupCarousel(".gallery-section");
    initGSAP();

    // Global click for tooltips/modals
    window.addEventListener("click", (e) => {
        const recipeModal = document.getElementById("recipeModal");
        if (recipeModal && e.target === recipeModal) {
            recipeModal.classList.remove("active");
            setTimeout(() => recipeModal.style.display = "none", 300);
        }
        if (!e.target.closest('.carousel-card') && !e.target.closest('[data-dish]')) {
            document.querySelectorAll('[id^="modal-"]').forEach(t => {
                t.style.display = "none";
                t.setAttribute('data-open', 'false');
            });
        }
    });
});
