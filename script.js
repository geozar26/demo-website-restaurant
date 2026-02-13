// --- 1. CAROUSEL ENGINE (ORIGINAL FORMAT RESTORED) ---
function setupCarousel(selector) {
    const section = document.querySelector(selector);
    if (!section) return;

    const track = section.querySelector(".carousel-track");
    const container = section.querySelector(".carousel-container");
    const dotsContainer = section.querySelector(".carousel-dots");
    const cards = track ? Array.from(track.children) : [];

    if (!track || cards.length === 0) return;

    // Αρχικές ρυθμίσεις μορφής
    track.style.display = "flex";
    track.style.flexWrap = "nowrap";
    track.style.transition = "transform 0.5s ease-out";

    let currentSlide = 0;
    let cardWidth, gap, slideDistance;

    function updateDimensions() {
        const containerWidth = container.offsetWidth;
        
        // Ακριβείς διαστάσεις όπως τις είχες αρχικά
        if (containerWidth < 360) {
            cardWidth = containerWidth - 20; 
            gap = 20;
        } else {
            cardWidth = 300; 
            gap = 30;
        }
        
        slideDistance = cardWidth + gap;
        track.style.gap = gap + "px";

        cards.forEach(card => {
            card.style.flex = "0 0 " + cardWidth + "px";
            card.style.width = cardWidth + "px";
            
            // Επαναφορά μορφής εικόνας
            const img = card.querySelector("img");
            if (img) {
                img.style.width = "100%";
                img.style.height = "160px";
                img.style.objectFit = "cover";
            }
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
        const maxT = Math.max(0, track.scrollWidth - container.offsetWidth);
        const steps = Math.ceil(maxT / slideDistance);

        for (let i = 0; i <= steps; i++) {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (i === currentSlide) dot.classList.add('active');
            dot.onclick = (e) => {
                e.stopPropagation();
                moveToSlide(i);
            };
            dotsContainer.appendChild(dot);
        }
    }

    function updateDots() {
        if (!dotsContainer) return;
        const dots = dotsContainer.querySelectorAll('.dot');
        dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
    }

    // Swipe Logic
    let startX = 0;
    container.addEventListener('touchstart', (e) => startX = e.touches[0].clientX, {passive: true});
    container.addEventListener('touchend', (e) => {
        const diffX = startX - e.changedTouches[0].clientX;
        if (Math.abs(diffX) > 50) {
            if (diffX > 0) moveToSlide(currentSlide + 1);
            else moveToSlide(currentSlide - 1);
        }
    }, {passive: true});

    // Εμφάνιση
    updateDimensions();
    createDots();
    
    window.addEventListener('resize', () => {
        updateDimensions();
        createDots();
        moveToSlide(currentSlide);
    });
}
// --- GSAP ANIMATIONS (UNIFIED FAST & STAGGERED) ---
document.addEventListener("DOMContentLoaded", () => {
    // Register GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Κοινές ρυθμίσεις για ομοιομορφία
    const commonSettings = {
        opacity: 0,
        y: 30,
        duration: 0.5, // Γρήγορο animation
        stagger: 0.1,  // Σταδιακή εμφάνιση (το ένα μετά το άλλο γρήγορα)
        ease: "power2.out"
    };

    // 1. Προτάσεις Γεύσεων (Menu Items)
    gsap.from(".items .item", {
        scrollTrigger: {
            trigger: ".items",
            start: "top 85%",
            toggleActions: "play none none none"
        },
        ...commonSettings
    });

    // 2. Κριτικές Πελατών (Testimonials)
    gsap.from(".testimonial-card", {
        scrollTrigger: {
            trigger: ".testimonials-section",
            start: "top 85%",
            toggleActions: "play none none none"
        },
        ...commonSettings
    });

    // 3. Gallery Images (Boxes)
    gsap.from(".gallery-container .box", {
        scrollTrigger: {
            trigger: ".gallery",
            start: "top 85%",
            toggleActions: "play none none none"
        },
        ...commonSettings
    });
});

