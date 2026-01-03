// 1. ΣΥΝΑΡΤΗΣΕΙΣ COOKIES
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
}

function getCookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// 2. ΛΟΓΙΚΗ CAROUSEL
let isScrolling = false;

function initializeCarouselLogic() {
    const carouselSection = document.querySelector(".todays-specials");
    if (!carouselSection) return;

    const track = carouselSection.querySelector(".carousel-track");
    const container = carouselSection.querySelector(".carousel-container");
    const dotsContainer = carouselSection.querySelector(".carousel-dots");
    const cards = track ? Array.from(track.children) : [];

    if (!track || cards.length === 0 || !dotsContainer || !container) return;

    const originalCardsCount = cards.length;
    let currentSlide = 0;
    const GAP = 30; 
    let carouselMetrics = {}; 

    function calculateCarouselMetrics() {
        if (cards.length === 0) return;
        const cardWidth = cards[0].getBoundingClientRect().width; 
        const slideDistance = cardWidth + GAP; 
        const containerWidth = container.clientWidth;
        const cardsPerView = Math.floor(containerWidth / slideDistance) || 1;
        const totalPages = Math.max(1, originalCardsCount - cardsPerView + 1);
        carouselMetrics = { slideDistance, totalPages, containerWidth };
    }

    function moveToSlide(index) {
        const { slideDistance, totalPages } = carouselMetrics; 
        if (index < 0) currentSlide = 0;
        else if (index >= totalPages) currentSlide = totalPages - 1;
        else currentSlide = index;

        const maxScroll = track.scrollWidth - container.clientWidth;
        let offset = -(currentSlide * slideDistance);
        if (Math.abs(offset) > maxScroll) offset = -maxScroll;

        track.style.transition = 'transform 0.5s ease-out';
        track.style.transform = `translateX(${offset}px)`; 
        updateDots();
    }

    let startX = 0;
    let startY = 0;

    container.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isScrolling = false; 
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
        const moveX = Math.abs(e.touches[0].clientX - startX);
        const moveY = Math.abs(e.touches[0].clientY - startY);
        if (moveX > 10 || moveY > 10) {
            isScrolling = true;
        }
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
        if (!isScrolling) return; 

        const endX = e.changedTouches[0].clientX;
        const distance = startX - endX;
        
        if (Math.abs(distance) > 40) { 
            if (distance > 0) moveToSlide(currentSlide + 1);
            else moveToSlide(currentSlide - 1);
        }
        
        setTimeout(() => { isScrolling = false; }, 50);
    }, { passive: true });

    function updateDots() {
        const dots = dotsContainer.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }

    function createDots(totalPages) {
        dotsContainer.innerHTML = '';
        for (let i = 0; i < totalPages; i++) {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (i === currentSlide) dot.classList.add('active');
            dot.addEventListener('click', () => moveToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }

    function initializeCarousel() {
        calculateCarouselMetrics(); 
        createDots(carouselMetrics.totalPages); 
        moveToSlide(currentSlide);
    }

    initializeCarousel();
    window.addEventListener('resize', initializeCarousel);
}

// 3. ΕΚΤΕΛΕΣΗ ΟΤΑΝ ΦΟΡΤΩΣΕΙ Η ΣΕΛΙΔΑ
document.addEventListener("DOMContentLoaded", () => {
    initializeCarouselLogic();

    const recipeModal = document.getElementById("recipeModal");
    const recipeCloseBtn = document.getElementById("recipeClose");
    const recipeImages = document.querySelectorAll(".recipe-img");

    if (recipeModal) {
        const closeRecipe = () => {
            recipeModal.classList.remove("active");
            // Επαναφορά opacity για την επόμενη φορά
            const imgElem = document.getElementById("modalImage");
            if(imgElem) imgElem.style.opacity = "0";
        };

        recipeImages.forEach(img => {
            img.addEventListener("click", (e) => {
                if (isScrolling) return;
                e.preventDefault();

                const titleElem = document.getElementById("modalTitle");
                const imgElem = document.getElementById("modalImage");
                const descElem = document.getElementById("modalDescription");

                // --- ΔΙΟΡΘΩΣΗ RENDERING ΓΙΑ VERCEL ---
                // 1. Κρύβουμε την εικόνα πριν αλλάξει το src
                if(imgElem) {
                    imgElem.style.transition = "none";
                    imgElem.style.opacity = "0";
                }

                // 2. Ενημερώνουμε τα δεδομένα
                if(titleElem) titleElem.textContent = img.dataset.title || img.alt;
                if(descElem) descElem.textContent = img.dataset.description || "";
                
                // 3. Θέτουμε το src και περιμένουμε το load
                if(imgElem) {
                    imgElem.src = img.src;
                    imgElem.onload = () => {
                        imgElem.style.transition = "opacity 0.3s ease-in-out";
                        imgElem.style.opacity = "1";
                    };
                }

                // 4. Εμφανίζουμε το modal container
                recipeModal.classList.add("active");
            });
        });

        if (recipeCloseBtn) recipeCloseBtn.onclick = closeRecipe;
        window.addEventListener("click", (e) => { 
            if (e.target === recipeModal) closeRecipe(); 
        });
    }

    // Λογική Login
    const LS_KEY = "userWantsToStayLogged";
    const AUTH_TOKEN = "session_token_xyz_12345"; 
    const isUserLogged = () => getCookie(LS_KEY) === AUTH_TOKEN || localStorage.getItem(LS_KEY) === AUTH_TOKEN;
    const saveLoginState = () => { setCookie(LS_KEY, AUTH_TOKEN, 30); localStorage.setItem(LS_KEY, AUTH_TOKEN); };

    const overlay = document.getElementById("loginOverlay");
    const popup = document.getElementById("loginPopup");
    const closeBtn = document.getElementById("loginClose");
    const loginForm = document.getElementById("loginForm");

    if (overlay && popup) {
        const openModal = () => {
            overlay.style.display = "block";
            popup.style.display = "block";

            const firstInput = loginForm.querySelector('input[type="text"], input[type="email"]');
            if (firstInput) {
                setTimeout(() => {
                    firstInput.focus();
                }, 100);
            }
        };

        const closeModal = () => {
            overlay.style.display = "none";
            popup.style.display = "none";
        };

        if (!isUserLogged()) setTimeout(openModal, 4000);
        if (closeBtn) closeBtn.onclick = closeModal;
        overlay.onclick = closeModal;

        if (loginForm) {
            loginForm.addEventListener("submit", (e) => {
                e.preventDefault();
                if (document.getElementById("rememberMeCheck")?.checked) saveLoginState();
                closeModal();
            });
        }
    }
});
