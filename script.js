/**
 * Kitchen Grid - Ultra Fast & Clean Version
 * --------------------------------
 * 1. Smart Preloading: Φορτώνει την εικόνα στο hover/touch.
 * 2. Instant Modal: Εμφάνιση περιεχομένου χωρίς "πήδημα".
 * 3. Stable Logic: Login, Modals, Cookies.
 * 4. Gallery Fix: Διορθώθηκε το Swipe χωρίς να χρειάζεται reload.
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

// --- 🚀 SMART PRELOAD ---
function setupSmartPreload() {
    const images = document.querySelectorAll(".recipe-img");
    images.forEach(img => {
        img.addEventListener("mouseenter", () => {
            if (!img.dataset.preloaded) {
                const preloader = new Image();
                preloader.src = img.src;
                img.dataset.preloaded = "true";
            }
        }, { once: true });

        img.addEventListener("touchstart", () => {
            if (!img.dataset.preloaded) {
                const preloader = new Image();
                preloader.src = img.src;
                img.dataset.preloaded = "true";
            }
        }, { passive: true, once: true });
    });
}

// --- 🍲 MODAL LOGIC & RECIPE GALLERY ---
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

                if (mTitle) mTitle.textContent = img.dataset.title || img.alt;
                if (mDesc) mDesc.textContent = img.dataset.description || "";
                if (mImg) mImg.src = img.src;

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

    // Carousel Tooltip Logic
    const carouselCards = document.querySelectorAll(".carousel-card, [data-dish]");
    carouselCards.forEach(card => {
        card.style.cursor = "pointer";
        card.style.webkitTapHighlightColor = "transparent";

        card.addEventListener("click", (e) => {
            // Αν είναι σε εξέλιξη swipe, μην ανοίξεις το tooltip
            if (card.dataset.isSwiping === "true") return;

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

// --- 🎡 CAROUSEL LOGIC (Γενικό για τα Specials) ---
function setupCarousel(selector) {
    const section = document.querySelector(selector);
    if (!section) return;

    const track = section.querySelector(".carousel-track");
    const container = section.querySelector(".carousel-container");
    const dotsContainer = section.querySelector(".carousel-dots");
    if (!track || !container) return;

    let currentSlide = 0;
    
    function update() {
        const containerWidth = container.offsetWidth;
        const cardWidth = containerWidth < 500 ? containerWidth * 0.8 : 300;
        const gap = 20;
        const slideDistance = cardWidth + gap;
        
        Array.from(track.children).forEach(card => {
            card.style.flex = `0 0 ${cardWidth}px`;
        });

        const maxTranslate = Math.max(0, track.scrollWidth - containerWidth);
        let translateValue = Math.min(currentSlide * slideDistance, maxTranslate);
        track.style.transform = `translateX(${-translateValue}px)`;
    }

    window.addEventListener('resize', update);
    update();
}

// --- 🖼️ GALLERY SPECIFIC LOGIC (FIXED SWIPE) ---
function setupGallerySwipe() {
    const section = document.querySelector(".gallery-section");
    if (!section) return;

    const track = section.querySelector(".carousel-track");
    const container = section.querySelector(".carousel-container");
    const dotsContainer = section.querySelector(".carousel-dots");
    if (!track || !container) return;

    // Mobile Fixes
    container.style.touchAction = "pan-y";
    container.style.overflow = "hidden";
    
    let currentSlide = 0;
    let startX = 0, startY = 0;
    let isDragging = false;
    let isSwipingHorizontal = false;

    function getDimensions() {
        const containerWidth = container.getBoundingClientRect().width || container.offsetWidth;
        const cardWidth = containerWidth < 600 ? containerWidth * 0.85 : 300;
        const gap = containerWidth < 600 ? 15 : 30;
        return { containerWidth, cardWidth, gap, slideDistance: cardWidth + gap };
    }

    function updateGallery() {
        const { containerWidth, cardWidth, gap, slideDistance } = getDimensions();
        if (containerWidth === 0) return;

        Array.from(track.children).forEach(card => {
            card.style.flex = `0 0 ${cardWidth}px`;
            card.style.width = `${cardWidth}px`;
        });

        const maxTranslate = Math.max(0, track.scrollWidth - container.offsetWidth);
        let translateValue = Math.min(currentSlide * slideDistance, maxTranslate);
        track.style.transition = "none";
        track.style.transform = `translateX(${-translateValue}px)`;
        
        renderDots();
    }

    function moveGallery(index) {
        const { slideDistance } = getDimensions();
        const maxTranslate = Math.max(0, track.scrollWidth - container.offsetWidth);
        const maxIndex = Math.ceil(maxTranslate / slideDistance);

        if (index < 0) index = 0;
        if (index > maxIndex) index = maxIndex;
        
        currentSlide = index;
        let translateValue = Math.min(currentSlide * slideDistance, maxTranslate);

        track.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
        track.style.transform = `translateX(${-translateValue}px)`;
        
        const dots = dotsContainer.querySelectorAll('.dot');
        dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
    }

    function renderDots() {
        if (!dotsContainer) return;
        dotsContainer.innerHTML = '';
        const { slideDistance } = getDimensions();
        const maxTranslate = Math.max(0, track.scrollWidth - container.offsetWidth);
        const count = Math.ceil(maxTranslate / slideDistance) + 1;

        if (count <= 1) return;

        for (let i = 0; i < count; i++) {
            const dot = document.createElement('span');
            dot.className = `dot ${i === currentSlide ? 'active' : ''}`;
            dot.onclick = () => moveGallery(i);
            dotsContainer.appendChild(dot);
        }
    }

    // Swipe Events
    container.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isDragging = true;
        isSwipingHorizontal = false;
        Array.from(track.children).forEach(c => c.dataset.isSwiping = "false");
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const dx = startX - e.touches[0].clientX;
        const dy = startY - e.touches[0].clientY;
        if (Math.abs(dx) > Math.abs(dy)) {
            isSwipingHorizontal = true;
            if (Math.abs(dx) > 10) {
                Array.from(track.children).forEach(c => c.dataset.isSwiping = "true");
            }
        }
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
        if (!isDragging || !isSwipingHorizontal) { isDragging = false; return; }
        const dx = startX - e.changedTouches[0].clientX;
        if (Math.abs(dx) > 50) {
            dx > 0 ? moveGallery(currentSlide + 1) : moveGallery(currentSlide - 1);
        }
        isDragging = false;
    }, { passive: true });

    // Fix for first load
    const observer = new ResizeObserver(() => updateGallery());
    observer.observe(container);
    
    updateGallery();
    setTimeout(updateGallery, 500); // Double-check after images load
}

function initializeCarouselLogic() {
    setupCarousel(".todays-specials");
    setupGallerySwipe(); 
}

// --- 🔐 LOGIN & DOM READY ---
document.addEventListener("DOMContentLoaded", () => {
    setupSmartPreload();
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
            closeLoginPopup();
        });
    }

    if (overlay) {
        overlay.onclick = (e) => { if (e.target === overlay) closeLoginPopup(); };
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
