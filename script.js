// --- 1. TYPES & INTERFACES ---
interface Window {
    gsap: any;
    ScrollTrigger: any;
}

// Δηλώσεις για εξωτερικές βιβλιοθήκες
declare var gsap: any;
declare var ScrollTrigger: any;

// --- 2. COOKIE LOGIC ---
function setCookie(name: string, value: string, days: number): void {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires: string = "expires=" + date.toUTCString();
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
}

function getCookie(name: string): string | null {
    const nameEQ: string = name + "=";
    const ca: string[] = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c: string = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// --- 3. CAROUSEL TOOLTIP LOGIC ---
function initTooltips(): void {
    const carouselCards = document.querySelectorAll<HTMLElement>(".carousel-card, [data-dish]");
    carouselCards.forEach((card: HTMLElement) => {
        card.style.cursor = "pointer";
        card.style.webkitTapHighlightColor = "transparent";

        card.addEventListener("click", (e: MouseEvent) => {
            e.stopPropagation();
            const dishId: string | null = card.getAttribute("data-dish");
            if (!dishId) return;
            
            const tooltip = document.getElementById(`modal-${dishId}`);
            if (tooltip) {
                const isOpen: boolean = tooltip.getAttribute('data-open') === 'true';
                if (isOpen) {
                    tooltip.style.display = "none";
                    tooltip.setAttribute('data-open', 'false');
                } else {
                    document.querySelectorAll<HTMLElement>('[id^="modal-"]').forEach((t: HTMLElement) => {
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

// --- 4. CAROUSEL ENGINE ---
function setupCarousel(selector: string): void {
    const section = document.querySelector(selector) as HTMLElement;
    if (!section) return;

    const track = section.querySelector(".carousel-track") as HTMLElement;
    const container = section.querySelector(".carousel-container") as HTMLElement;
    const dotsContainer = section.querySelector(".carousel-dots") as HTMLElement;
    const cards = track ? Array.from(track.children) as HTMLElement[] : [];

    if (!track || cards.length === 0 || !container) return;

    track.style.display = "flex";
    track.style.flexWrap = "nowrap";
    track.style.visibility = "hidden";
    track.style.opacity = "0";

    let currentSlide: number = 0;
    let cardWidth: number, gap: number, slideDistance: number;

    function updateDimensions(): void {
        const containerWidth: number = container.offsetWidth;
        if (containerWidth < 360) {
            cardWidth = containerWidth - 20; 
            gap = 20;
        } else {
            cardWidth = 300;
            gap = 30;
        }
        slideDistance = cardWidth + gap;
        track.style.gap = `${gap}px`;

        cards.forEach((card: HTMLElement) => {
            card.style.flex = `0 0 ${cardWidth}px`;
            card.style.width = `${cardWidth}px`;
            const img = card.querySelector("img") as HTMLImageElement;
            if (img) {
                img.style.width = "100%";
                img.style.height = "160px";
                img.style.objectFit = "cover";
            }
        });
    }

    function getMaxTranslate(): number {
        return Math.max(0, track.scrollWidth - container.offsetWidth);
    }

    function getTotalSteps(): number {
        const maxT: number = getMaxTranslate();
        return maxT <= 0 ? 0 : Math.ceil(maxT / slideDistance);
    }

    function moveToSlide(index: number): void {
        const maxSteps: number = getTotalSteps();
        const maxTranslate: number = getMaxTranslate();

        if (index < 0) currentSlide = 0;
        else if (index > maxSteps) currentSlide = maxSteps;
        else currentSlide = index;

        const translateValue: number = Math.min(currentSlide * slideDistance, maxTranslate);
        track.style.transition = 'transform 0.5s ease-out';
        track.style.transform = `translateX(${-translateValue}px)`;

        updateDots();
    }

    function createDots(): void {
        if (!dotsContainer) return;
        dotsContainer.innerHTML = '';
        const totalSteps: number = getTotalSteps();
        if (totalSteps === 0) return;

        for (let i = 0; i <= totalSteps; i++) {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (i === currentSlide) dot.classList.add('active');
            dot.addEventListener('click', (e: MouseEvent) => {
                e.stopPropagation();
                moveToSlide(i);
            });
            dotsContainer.appendChild(dot);
        }
    }

    function updateDots(): void {
        if (!dotsContainer) return;
        const dots = dotsContainer.querySelectorAll('.dot');
        dots.forEach((dot: Element, index: number) => {
            (dot as HTMLElement).classList.toggle('active', index === currentSlide);
        });
    }

    // Touch Logic
    let startX: number = 0, startY: number = 0, isMoving: boolean = false;
    container.addEventListener('touchstart', (e: TouchEvent) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isMoving = true;
    }, { passive: true });

    container.addEventListener('touchend', (e: TouchEvent) => {
        if (!isMoving) return;
        const diffX: number = startX - e.changedTouches[0].clientX;
        const diffY: number = startY - e.changedTouches[0].clientY;
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            if (diffX > 0) moveToSlide(currentSlide + 1);
            else moveToSlide(currentSlide - 1);
        }
        isMoving = false;
    }, { passive: true });

    function revealCarousel(): void {
        updateDimensions();
        createDots();
        moveToSlide(currentSlide);
        requestAnimationFrame(() => {
            track.style.visibility = "visible";
            track.style.opacity = "1";
            track.style.transition = "opacity 0.4s ease";
        });
    }

    const allImages = track.querySelectorAll("img");
    let loadedCount: number = 0;
    if (allImages.length === 0) revealCarousel();
    else {
        allImages.forEach((img: HTMLImageElement) => {
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

// --- GSAP ANIMATIONS (REFINED & CUSTOM) ---

function initGSAP(): void {
    if (typeof gsap === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    // 1. ANIMATION ΓΙΑ ΤΑ ΠΙΑΤΑ (Classic Fade Up)
    if (document.querySelector(".items")) {
        gsap.from(".items .item", {
            scrollTrigger: {
                trigger: ".items",
                start: "top 80%",
            },
            opacity: 0,
            y: 50,
            duration: 0.8,
            stagger: 0.2,
            ease: "power3.out"
        });
    }

    // 2. ANIMATION ΓΙΑ ΤΑ TESTIMONIALS (Custom Slide-In με Φυσικό Scale)
    // Εδώ βγάζουμε το scale 0.9 για να παραμείνουν στο μέγεθος που ορίζει το CSS σου
    if (document.querySelector(".testimonials-section")) {
        gsap.from(".testimonial-card", {
            scrollTrigger: {
                trigger: ".testimonials-section",
                start: "top 75%",
            },
            opacity: 0,
            x: -100,            // Έρχονται από αριστερά
            rotation: -5,       // Μια μικρή κλίση που ισιώνει καθώς εμφανίζονται
            duration: 1,
            stagger: 0.3,       // Ένα-ένα με καθυστέρηση
            ease: "back.out(1.7)" // Εφέ "ελατηρίου" για πιο επαγγελματικό look
        });
    }

    // 3. ANIMATION ΓΙΑ ΤΟ GALLERY (Zoom-In εφέ)
    if (document.querySelector(".gallery")) {
        gsap.from(".gallery-container .box", {
            scrollTrigger: {
                trigger: ".gallery",
                start: "top 80%",
            },
            opacity: 0,
            scale: 0.5,         // Ξεκινάνε από πολύ μικρά
            duration: 0.7,
            stagger: 0.1,
            ease: "expo.out"
        });
    }
}
