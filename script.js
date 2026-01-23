/**
 * Kitchen Grid - Ultra Fast & Clean Version (No Warnings)
 * --------------------------------
 * 1. Smart Preloading: Φορτώνει την εικόνα στο hover/touch για 0ms καθυστέρηση.
 * 2. Instant Modal: Εμφάνιση περιεχομένου χωρίς "πήδημα" στο layout.
 * 3. Stable Logic: Login, Modals, Carousel, Cookies παραμένουν άθικτα.
 */

// --- 🍪 ΣΥΝΑΡΤΗΣΕΙΣ COOKIES ---
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

// --- 🚀 SMART PRELOAD (Εξαφανίζει τα Warnings) ---
function setupSmartPreload() {
    const images = document.querySelectorAll(".recipe-img");
    images.forEach(img => {
        // Προφόρτωση στο Hover (Desktop)
        img.addEventListener("mouseenter", () => {
            if (!img.dataset.preloaded) {
                const preloader = new Image();
                preloader.src = img.src;
                img.dataset.preloaded = "true";
            }
        }, { once: true });

        // Προφόρτωση στο Touch (Mobile)
        img.addEventListener("touchstart", () => {
            if (!img.dataset.preloaded) {
                const preloader = new Image();
                preloader.src = img.src;
                img.dataset.preloaded = "true";
            }
        }, { passive: true, once: true });
    });
}

// --- 🍲 MODAL LOGIC & GALLERY FIX ---
function initializeAllModals() {
    const recipeModal = document.getElementById("recipeModal");

    if (recipeModal) {
        const recipeImages = document.querySelectorAll(".recipe-img");
        recipeImages.forEach(img => {
            img.style.cursor = "pointer";
            img.style.webkitTapHighlightColor = "transparent";

            img.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();

                const mTitle = document.getElementById("modalTitle");
                const mImg = document.getElementById("modalImage");
                const mDesc = document.getElementById("modalDescription");

                // Ενημέρωση περιεχομένου
                if (mTitle) mTitle.textContent = img.dataset.title || img.alt;
                if (mDesc) mDesc.textContent = img.dataset.description || "";
                if (mImg) mImg.src = img.src;

                // Εμφάνιση Modal
                recipeModal.style.display = "block";
                requestAnimationFrame(() => {
                    recipeModal.classList.add("active");
                });
            });
        });

        const recipeCloseBtn = document.getElementById("recipeClose");
        if (recipeCloseBtn) {
            recipeCloseBtn.onclick = (e) => {
                e.stopPropagation();
                recipeModal.classList.remove("active");
                setTimeout(() => recipeModal.style.display = "none", 300);
            };
        }
    }

    // --- 🎡 CAROUSEL TOOLTIP TOGGLE LOGIC ---
    const carouselCards = document.querySelectorAll(".carousel-card, [data-dish]");
    carouselCards.forEach(card => {
        card.style.cursor = "pointer";
        card.style.webkitTapHighlightColor = "transparent";

        card.addEventListener("click", (e) => {
            e.stopPropagation();
            const dishId = card.getAttribute("data-dish");
            if (dishId) {
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
            }
        });
    });

    window.addEventListener("click", (e) => {
        if (e.target === recipeModal) {
            recipeModal.classList.remove("active");
            setTimeout(() => recipeModal.style.display = "none", 300);
        }
        if (e.target.classList.contains('modal')) {
            e.target.style.display = "none";
        }
        if (!e.target.closest('.carousel-card') && !e.target.closest('[data-dish]')) {
            document.querySelectorAll('[id^="modal-"]').forEach(t => {
                t.style.display = "none";
                t.setAttribute('data-open', 'false');
            });
        }
    });
}

// --- 🎡 CAROUSEL LOGIC (Specials & Gallery) ---
function setupCarousel(selector) {
    const section = document.querySelector(selector);
    if (!section) return;

    const track = section.querySelector(".carousel-track");
    const container = section.querySelector(".carousel-container");
    const dotsContainer = section.querySelector(".carousel-dots");
    const cards = track ? Array.from(track.children) : [];

    if (!track || cards.length === 0) return;

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

    let startX = 0;
    let startY = 0;
    let isMoving = false;

    container.addEventListener('touchstart', (e) => {
        if (!e.touches || e.touches.length === 0) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isMoving = true;
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
        if (!isMoving || !e.changedTouches || e.changedTouches.length === 0) {
            isMoving = false;
            return;
        }
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const diffX = startX - endX;
        const diffY = startY - endY;

        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            const totalSteps = getTotalSteps();
            if (totalSteps > 0) {
                 if (diffX > 0) moveToSlide(currentSlide + 1);
                 else moveToSlide(currentSlide - 1);
            }
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

    window.addEventListener('load', revealCarousel);
}

function initializeCarouselLogic() {
    setupCarousel(".todays-specials");
    setupCarousel(".gallery-section"); 
}

// --- 🔐 LOGIN & AUTH LOGIC ---
document.addEventListener("DOMContentLoaded", () => {
    setupSmartPreload(); // Ενεργοποίηση έξυπνης προφόρτωσης
    initializeCarouselLogic();
    initializeAllModals();

    const overlay = document.getElementById("loginOverlay");
    const popup = document.getElementById("loginPopup");
    const loginForm = document.getElementById("loginForm");
    const loginCloseBtn = document.getElementById("loginClose");

    const hasToken = localStorage.getItem("userToken") || getCookie("userToken");
    const hideLogin = getCookie("hideLogin");
    const savedUser = localStorage.getItem("savedUser") || getCookie("savedUser");

    if (loginForm && savedUser) {
        const input = loginForm.querySelector("input");
        if (input) input.value = savedUser;
    }

    if (!hideLogin && !hasToken) {
        if (overlay && popup) {
            setTimeout(() => {
                overlay.style.display = "block";
                popup.style.display = "block";
                popup.setAttribute("aria-hidden", "false"); 
                const firstInput = popup.querySelector("input");
                if (firstInput) firstInput.focus();
            }, 4000);
        }
    }

    const closeLoginPopup = () => {
        if (overlay && popup) {
            overlay.style.display = "none";
            popup.style.display = "none";
            popup.setAttribute("aria-hidden", "true");
        }
    };

    if (loginCloseBtn) {
        loginCloseBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeLoginPopup();
        });
    }

    if (overlay) {
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                closeLoginPopup();
            }
        };
    }

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const val = loginForm.querySelector("input").value;
            const token = "auth_" + Math.random().toString(36).substr(2);
            
            localStorage.setItem("userToken", token);
            localStorage.setItem("savedUser", val);
            setCookie("savedUser", val, 30);
            setCookie("userToken", token, 30);
            setCookie("hideLogin", "true", 30);
            
            closeLoginPopup();
        });
    }
});
