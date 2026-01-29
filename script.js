/**
 * Kitchen Grid - Ultimate Version (No Reload Bug & Modal Swipe)
 * -----------------------------------------------------------
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

// --- 🍲 MODAL LOGIC ΜΕ SWIPE SUPPORT ---
function initializeAllModals() {
    const recipeModal = document.getElementById("recipeModal");
    const mImg = document.getElementById("modalImage");
    
    // Συλλογή όλων των εικόνων της Gallery για εναλλαγή μέσα στο Modal
    const galleryImages = Array.from(document.querySelectorAll(".gallery-section .recipe-img"));
    let currentIndex = 0;

    if (recipeModal && galleryImages.length > 0) {
        galleryImages.forEach((img, index) => {
            img.style.cursor = "pointer";
            img.style.webkitTapHighlightColor = "transparent";

            img.addEventListener("click", (e) => {
                // Αν ο χρήστης κάνει swipe στο grid, μην ανοίξεις το modal
                if (img.parentElement.dataset.isSwiping === "true") return;
                
                e.preventDefault();
                e.stopPropagation();

                currentIndex = index;
                updateModalContent(galleryImages[currentIndex]);

                recipeModal.style.display = "block";
                requestAnimationFrame(() => {
                    recipeModal.classList.add("active");
                });
            });
        });

        function updateModalContent(imgEl) {
            const mTitle = document.getElementById("modalTitle");
            const mDesc = document.getElementById("modalDescription");
            if (mTitle) mTitle.textContent = imgEl.dataset.title || imgEl.alt;
            if (mDesc) mDesc.textContent = imgEl.dataset.description || "";
            if (mImg) mImg.src = imgEl.src;
        }

        // --- 📱 SWIPE LOGIC ΜΕΣΑ ΣΤΟ MODAL ---
        let modalStartX = 0;
        recipeModal.addEventListener('touchstart', (e) => {
            modalStartX = e.touches[0].clientX;
        }, { passive: true });

        recipeModal.addEventListener('touchend', (e) => {
            const modalEndX = e.changedTouches[0].clientX;
            const diff = modalStartX - modalEndX;

            if (Math.abs(diff) > 50) { // Threshold για αλλαγή
                if (diff > 0) { // Swipe αριστερά -> Επόμενη
                    currentIndex = (currentIndex + 1) % galleryImages.length;
                } else { // Swipe δεξιά -> Προηγούμενη
                    currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
                }
                updateModalContent(galleryImages[currentIndex]);
            }
        }, { passive: true });

        const recipeCloseBtn = document.getElementById("recipeClose");
        if (recipeCloseBtn) {
            recipeCloseBtn.onclick = (e) => {
                e.stopPropagation();
                recipeModal.classList.remove("active");
                setTimeout(() => recipeModal.style.display = "none", 300);
            };
        }
    }

    // Carousel Tooltip Logic (Specials)
    const carouselCards = document.querySelectorAll(".carousel-card, [data-dish]");
    carouselCards.forEach(card => {
        card.addEventListener("click", (e) => {
            if (card.dataset.isSwiping === "true") return;
            e.stopPropagation();
            const dishId = card.getAttribute("data-dish");
            if (dishId) {
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
            }
        });
    });

    window.addEventListener("click", (e) => {
        if (e.target === recipeModal) {
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
}

// --- 🎡 CAROUSEL LOGIC (Specials) ---
function setupCarousel(selector) {
    const section = document.querySelector(selector);
    if (!section) return;
    const track = section.querySelector(".carousel-track");
    const container = section.querySelector(".carousel-container");
    if (!track || !container) return;

    let currentSlide = 0;
    function update() {
        const containerWidth = container.offsetWidth;
        const cardWidth = containerWidth < 500 ? containerWidth * 0.8 : 300;
        const gap = 20;
        const slideDistance = cardWidth + gap;
        Array.from(track.children).forEach(card => card.style.flex = `0 0 ${cardWidth}px`);
        const maxT = Math.max(0, track.scrollWidth - containerWidth);
        track.style.transform = `translateX(${-Math.min(currentSlide * slideDistance, maxT)}px)`;
    }
    window.addEventListener('resize', update);
    update();
}

// --- 🖼️ GALLERY SPECIFIC LOGIC (FIXED SWIPE & NO-RELOAD) ---
function setupGallerySwipe() {
    const section = document.querySelector(".gallery-section");
    if (!section) return;
    const track = section.querySelector(".carousel-track");
    const container = section.querySelector(".carousel-container");
    const dotsContainer = section.querySelector(".carousel-dots");
    if (!track || !container) return;

    container.style.touchAction = "pan-y";
    let currentSlide = 0;
    let startX = 0;

    function updateGallery() {
        const containerWidth = container.getBoundingClientRect().width || container.offsetWidth;
        if (containerWidth === 0) return;
        const cardWidth = containerWidth < 600 ? containerWidth * 0.85 : 300;
        const gap = containerWidth < 600 ? 15 : 30;
        const slideDistance = cardWidth + gap;

        Array.from(track.children).forEach(card => {
            card.style.flex = `0 0 ${cardWidth}px`;
            card.style.width = `${cardWidth}px`;
        });

        const maxTranslate = Math.max(0, track.scrollWidth - container.offsetWidth);
        track.style.transition = "none";
        track.style.transform = `translateX(${-Math.min(currentSlide * slideDistance, maxTranslate)}px)`;
        
        // Render Dots
        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            const count = Math.ceil(maxTranslate / slideDistance) + 1;
            if (count > 1) {
                for (let i = 0; i < count; i++) {
                    const dot = document.createElement('span');
                    dot.className = `dot ${i === currentSlide ? 'active' : ''}`;
                    dot.onclick = () => moveGallery(i);
                    dotsContainer.appendChild(dot);
                }
            }
        }
    }

    function moveGallery(index) {
        const containerWidth = container.offsetWidth;
        const cardWidth = containerWidth < 600 ? containerWidth * 0.85 : 300;
        const slideDistance = cardWidth + (containerWidth < 600 ? 15 : 30);
        const maxTranslate = Math.max(0, track.scrollWidth - containerWidth);
        const maxIndex = Math.ceil(maxTranslate / slideDistance);

        if (index < 0) index = 0;
        if (index > maxIndex) index = maxIndex;
        currentSlide = index;

        track.style.transition = 'transform 0.4s ease-out';
        track.style.transform = `translateX(${-Math.min(currentSlide * slideDistance, maxTranslate)}px)`;
        
        const dots = dotsContainer.querySelectorAll('.dot');
        dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
    }

    // Touch Events για το Grid
    container.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
        Array.from(track.children).forEach(c => c.dataset.isSwiping = "false");
    }, {passive: true});

    container.addEventListener('touchend', e => {
        const dx = startX - e.changedTouches[0].clientX;
        if (Math.abs(dx) > 50) {
            Array.from(track.children).forEach(c => c.dataset.isSwiping = "true");
            dx > 0 ? moveGallery(currentSlide + 1) : moveGallery(currentSlide - 1);
        }
    }, {passive: true});

    const observer = new ResizeObserver(() => updateGallery());
    observer.observe(container);
    updateGallery();
}

function initializeCarouselLogic() {
    setupCarousel(".todays-specials");
    setupGallerySwipe(); 
}

// --- 🔐 LOGIN & INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    setupSmartPreload();
    initializeCarouselLogic();
    initializeAllModals();

    // Login Logic
    const overlay = document.getElementById("loginOverlay");
    const popup = document.getElementById("loginPopup");
    const loginForm = document.getElementById("loginForm");
    
    const hasToken = localStorage.getItem("userToken") || getCookie("userToken");
    const hideLogin = getCookie("hideLogin");

    if (!hideLogin && !hasToken && overlay && popup) {
        setTimeout(() => {
            overlay.style.display = "block";
            popup.style.display = "block";
        }, 4000);
    }

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const val = loginForm.querySelector("input").value;
            setCookie("userToken", "auth_" + Date.now(), 30);
            setCookie("hideLogin", "true", 30);
            localStorage.setItem("savedUser", val);
            overlay.style.display = "none";
            popup.style.display = "none";
        });
    }

    const loginClose = document.getElementById("loginClose");
    if (loginClose) {
        loginClose.onclick = () => {
            overlay.style.display = "none";
            popup.style.display = "none";
        };
    }
});
