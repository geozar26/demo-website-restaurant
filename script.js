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

    // --- ΒΕΛΤΙΩΜΕΝΗ ΛΟΓΙΚΗ ΓΙΑ ΑΜΕΣΟ ΚΛΙΚ ---
    let startX = 0;
    let startY = 0;

    container.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        // Επαναφέρουμε ΠΑΝΤΑ το isScrolling σε false με το που ακουμπάει το δάχτυλο
        isScrolling = false; 
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
        const moveX = Math.abs(e.touches[0].clientX - startX);
        const moveY = Math.abs(e.touches[0].clientY - startY);
        
        // Αν η κίνηση είναι μικρότερη από 10px, δεν τη θεωρούμε swipe (βοηθάει στα ασταθή δάχτυλα)
        if (moveX > 10 || moveY > 10) {
            isScrolling = true;
        }
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
        // Αν δεν υπήρξε κίνηση (swipe), σταματάμε εδώ και αφήνουμε το Click event να δουλέψει
        if (!isScrolling) return; 

        const endX = e.changedTouches[0].clientX;
        const distance = startX - endX;
        
        if (Math.abs(distance) > 40) { 
            if (distance > 0) moveToSlide(currentSlide + 1);
            else moveToSlide(currentSlide - 1);
        }
        
        // Μικρή καθυστέρηση για να προλάβει να εκτελεστεί το click event πριν το reset
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
        const closeRecipe = () => recipeModal.classList.remove("active");

        recipeImages.forEach(img => {
            img.addEventListener("click", (e) => {
                // Ελέγχουμε αν όντως ο χρήστης κάνει scroll. 
                // Με τη νέα λογική, το isScrolling θα είναι false αν το πάτημα ήταν σύντομο.
                if (isScrolling) return;

                e.preventDefault();
                // Αφαιρέθηκε το stopPropagation για καλύτερη συμβατότητα

                const isAlreadyActive = recipeModal.classList.contains("active");
                const currentModalImg = document.getElementById("modalImage");
                
                if (isAlreadyActive && currentModalImg && currentModalImg.src === img.src) {
                    closeRecipe();
                } else {
                    const titleElem = document.getElementById("modalTitle");
                    const imgElem = document.getElementById("modalImage");
                    const descElem = document.getElementById("modalDescription");

                    if(titleElem) titleElem.textContent = img.dataset.title || img.alt;
                    if(imgElem) imgElem.src = img.src;
                    if(descElem) descElem.textContent = img.dataset.description || "";
                    
                    recipeModal.classList.add("active");
                }
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

            // --- ΠΡΟΣΘΗΚΗ ΑΥΤΟΜΑΤΗΣ ΕΣΤΙΑΣΗΣ ΕΔΩ ---
            // Επιλέγει το πρώτο input (text ή email) μέσα στη φόρμα
            const firstInput = loginForm.querySelector('input[type="text"], input[type="email"]');
            if (firstInput) {
                setTimeout(() => {
                    firstInput.focus();
                }, 100); // 100ms καθυστέρηση για να προλάβει να φανεί το popup
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
    // Λογική Login
   
});
