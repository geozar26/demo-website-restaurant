// --- TYPESCRIPT COMPATIBLE JAVASCRIPT (SAFE MODE) ---

// 1. Διασφάλιση ότι το GSAP υπάρχει πριν ξεκινήσει οτιδήποτε
const safeGsap = () => window.gsap || null;

// --- COOKIE LOGIC ---
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

// --- CAROUSEL TOOLTIP LOGIC ---
document.addEventListener("DOMContentLoaded", () => {
    const carouselCards = document.querySelectorAll(".carousel-card, [data-dish]");
    carouselCards.forEach(card => {
        card.style.cursor = "pointer";
        card.addEventListener("click", (e) => {
            e.stopPropagation();
            const dishId = card.getAttribute("data-dish");
            const tooltip = document.getElementById(`modal-${dishId}`);
            if (tooltip) {
                const isOpen = tooltip.getAttribute('data-open') === 'true';
                document.querySelectorAll('[id^="modal-"]').forEach(t => {
                    t.style.display = "none";
                    t.setAttribute('data-open', 'false');
                });
                if (!isOpen) {
                    tooltip.style.display = "block";
                    tooltip.setAttribute('data-open', 'true');
                }
            }
        });
    });
});

// --- CAROUSEL LOGIC (FIXED) ---
function setupCarousel(selector) {
    const section = document.querySelector(selector);
    if (!section) return;

    const track = section.querySelector(".carousel-track");
    const container = section.querySelector(".carousel-container");
    const dotsContainer = section.querySelector(".carousel-dots");
    if (!track || !container) return;

    const cards = Array.from(track.children);
    let currentSlide = 0;

    function updateDimensions() {
        const containerWidth = container.offsetWidth;
        const cardWidth = containerWidth < 360 ? containerWidth - 20 : 300;
        const gap = containerWidth < 360 ? 20 : 30;
        
        track.style.gap = `${gap}px`;
        cards.forEach(card => {
            card.style.flex = `0 0 ${cardWidth}px`;
            card.style.width = `${cardWidth}px`;
        });
        return cardWidth + gap;
    }

    function moveToSlide(index) {
        const slideDistance = updateDimensions();
        const maxTranslate = track.scrollWidth - container.offsetWidth;
        const totalSteps = Math.ceil(maxTranslate / slideDistance);

        if (index < 0) currentSlide = 0;
        else if (index > totalSteps) currentSlide = totalSteps;
        else currentSlide = index;

        const translateValue = Math.min(currentSlide * slideDistance, maxTranslate);
        track.style.transform = `translateX(${-translateValue}px)`;
        
        // Update Dots
        if (dotsContainer) {
            const dots = dotsContainer.querySelectorAll('.dot');
            dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
        }
    }

    // Initialization
    track.style.display = "flex";
    track.style.transition = "transform 0.5s ease-out";
    
    // Εμφάνιση μετά το φόρτωμα
    setTimeout(() => {
        updateDimensions();
        track.style.visibility = "visible";
        track.style.opacity = "1";
    }, 100);

    window.addEventListener('resize', () => moveToSlide(currentSlide));
}

// --- GSAP ANIMATIONS (SAFE TRIGGER) ---
function initAnimations() {
    if (!window.gsap || !window.ScrollTrigger) return;

    gsap.registerPlugin(ScrollTrigger);

    const animConfig = (trigger) => ({
        scrollTrigger: {
            trigger: trigger,
            start: "top 85%",
            toggleActions: "play none none none"
        },
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out"
    });

    if (document.querySelector(".items")) gsap.from(".items .item", animConfig(".items"));
    if (document.querySelector(".testimonials-section")) gsap.from(".testimonial-card", animConfig(".testimonials-section"));
    if (document.querySelector(".gallery")) gsap.from(".gallery-container .box", animConfig(".gallery"));
}

// --- CENTRAL INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    setupCarousel(".todays-specials");
    setupCarousel(".gallery-section");
    initAnimations();
});
