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

// --- 2. CAROUSEL ENGINE (ORIGINAL SIZE & LOGIC) ---
function setupCarousel(selector) {
    const section = document.querySelector(selector);
    if (!section) return;

    const track = section.querySelector(".carousel-track");
    const container = section.querySelector(".carousel-container");
    const dotsContainer = section.querySelector(".carousel-dots");
    const cards = track ? Array.from(track.children) : [];

    if (!track || cards.length === 0) return;

    let currentSlide = 0;
    let cardWidth, gap, slideDistance;

    function updateDimensions() {
        const containerWidth = container.offsetWidth;
        if (containerWidth < 360) {
            cardWidth = containerWidth - 20; 
            gap = 20;
        } else {
            cardWidth = 300; // Επαναφορά στο σωστό μέγεθος
            gap = 30;
        }
        slideDistance = cardWidth + gap;
        track.style.gap = gap + "px";

        cards.forEach(card => {
            card.style.flex = "0 0 " + cardWidth + "px";
            card.style.width = cardWidth + "px";
        });
    }

    function moveToSlide(index) {
        updateDimensions();
        const maxTranslate = Math.max(0, track.scrollWidth - container.offsetWidth);
        const totalSteps = Math.ceil(maxTranslate / slideDistance);

        if (index < 0) currentSlide = 0;
        else if (index > totalSteps) currentSlide = totalSteps;
        else currentSlide = index;

        const translateValue = Math.min(currentSlide * slideDistance, maxTranslate);
        track.style.transform = "translateX(" + (-translateValue) + "px)";
        
        updateDots();
    }

    function createDots() {
        if (!dotsContainer) return;
        dotsContainer.innerHTML = '';
        const maxTranslate = Math.max(0, track.scrollWidth - container.offsetWidth);
        const totalSteps = Math.ceil(maxTranslate / slideDistance);

        for (let i = 0; i <= totalSteps; i++) {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (i === currentSlide) dot.classList.add('active');
            dot.onclick = () => moveToSlide(i);
            dotsContainer.appendChild(dot);
        }
    }

    function updateDots() {
        if (!dotsContainer) return;
        const dots = dotsContainer.querySelectorAll('.dot');
        dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
    }

    // Touch Support
    let startX = 0;
    container.ontouchstart = (e) => startX = e.touches[0].clientX;
    container.ontouchend = (e) => {
        const diffX = startX - e.changedTouches[0].clientX;
        if (Math.abs(diffX) > 50) {
            if (diffX > 0) moveToSlide(currentSlide + 1);
            else moveToSlide(currentSlide - 1);
        }
    };

    // Εμφάνιση Carousel
    updateDimensions();
    createDots();
    track.style.opacity = "1";
    track.style.visibility = "visible";

    window.addEventListener('resize', () => {
        updateDimensions();
        moveToSlide(currentSlide);
    });
}

// --- 3. GSAP ANIMATIONS (CUSTOM FOR TESTIMONIALS) ---
function initAnimations() {
    if (typeof gsap === "undefined") return;

    // Πιάτα & Gallery: Classic Fade Up
    gsap.from(".items .item, .gallery-container .box", {
        scrollTrigger: {
            trigger: ".items",
            start: "top 85%"
        },
        opacity: 0,
        y: 30,
        duration: 0.6,
        stagger: 0.2,
        ease: "power2.out"
    });

    // Testimonials: ΔΙΑΦΟΡΕΤΙΚΟ Animation (Slide-in από δεξιά)
    // Δεν επηρεάζει το scale/μέγεθος
    gsap.from(".testimonial-card", {
        scrollTrigger: {
            trigger: ".testimonials-section",
            start: "top 80%"
        },
        opacity: 0,
        x: 50,             // Έρχεται από τα πλάγια
        duration: 1,
        stagger: 0.3,      // Ένα-ένα stagerred
        ease: "back.out(1.5)"
    });
}

// --- 4. INITIALIZE ---
document.addEventListener("DOMContentLoaded", () => {
    setupCarousel(".todays-specials");
    setupCarousel(".gallery-section");
    
    // Μικρή καθυστέρηση για το GSAP ώστε να βρει τα σωστά ύψη
    setTimeout(initAnimations, 200);

    // Tooltip Logic
    document.querySelectorAll(".carousel-card, [data-dish]").forEach(card => {
        card.onclick = (e) => {
            e.stopPropagation();
            const id = card.getAttribute("data-dish");
            const tooltip = document.getElementById("modal-" + id);
            if (tooltip) {
                const isOpen = tooltip.style.display === "block";
                document.querySelectorAll('[id^="modal-"]').forEach(t => t.style.display = "none");
                tooltip.style.display = isOpen ? "none" : "block";
            }
        };
    });
});

window.onclick = () => {
    document.querySelectorAll('[id^="modal-"]').forEach(t => t.style.display = "none");
};
