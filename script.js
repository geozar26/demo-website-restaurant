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

// --- 2. GSAP ANIMATIONS (MODERN & SEPARATE) ---
function initAnimations() {
    if (typeof gsap === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    // Α) ΠΙΑΤΑ & GALLERY: Εμφάνιση με ελαφρύ ανέβασμα (Classic)
    gsap.from(".items .item, [data-dish], .gallery-container .box", {
        scrollTrigger: {
            trigger: ".items",
            start: "top 85%",
            toggleActions: "play none none none"
        },
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out"
    });

    // Β) TESTIMONIALS: Διαφορετικό Animation (Slide & Scale)
    // Εδώ οι κάρτες μένουν στο μέγεθός τους αλλά έρχονται "γλυκά" από το πλάι
    gsap.from(".testimonial-card", {
        scrollTrigger: {
            trigger: ".testimonials-section",
            start: "top 80%",
        },
        opacity: 0,
        x: 80, 
        duration: 1.2,
        stagger: 0.4,
        ease: "back.out(1.4)"
    });
}


