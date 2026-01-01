// 3. ΕΚΤΕΛΕΣΗ ΟΤΑΝ ΦΟΡΤΩΣΕΙ Η ΣΕΛΙΔΑ
document.addEventListener("DOMContentLoaded", () => {
    // 🟢 ΕΝΕΡΓΟΠΟΙΗΣΗ CAROUSEL (Μην το παραλείψεις!)
    initializeCarouselLogic();

    const recipeModal = document.getElementById("recipeModal");
    const recipeCloseBtn = document.getElementById("recipeClose");
    const recipeImages = document.querySelectorAll(".recipe-img");

    // --- ΔΙΟΡΘΩΜΕΝΗ ΛΟΓΙΚΗ MODAL (STOP RENDERING ISSUES) ---
    if (recipeModal) {
        const closeRecipe = () => {
            recipeModal.classList.remove("active");
            setTimeout(() => {
                const imgElem = document.getElementById("modalImage");
                if (imgElem) imgElem.src = "";
            }, 300);
        };

        recipeImages.forEach(img => {
            img.addEventListener("click", (e) => {
                if (isScrolling) return; // Προστασία από το swipe του carousel
                e.preventDefault();

                const titleElem = document.getElementById("modalTitle");
                const imgElem = document.getElementById("modalImage");
                const descElem = document.getElementById("modalDescription");

                // 1. ΠΡΟΕΤΟΙΜΑΣΙΑ ΠΕΡΙΕΧΟΜΕΝΟΥ (Ενώ είναι ακόμα κρυφό)
                if (imgElem) imgElem.style.opacity = "0"; // Κρύβουμε την εικόνα για να μην "αναβοσβήνει"
                if (titleElem) titleElem.textContent = img.dataset.title || img.alt;
                if (descElem) descElem.textContent = img.dataset.description || "";
                if (imgElem) imgElem.src = img.src;

                // 2. FORCE REFLOW (Το "μαγικό" για το Rendering)
                // Αναγκάζει τον browser να υπολογίσει τα μεγέθη κειμένου/διαστάσεων 
                // ΠΡΙΝ δείξει το modal στον χρήστη.
                void recipeModal.offsetWidth; 

                // 3. ΕΜΦΑΝΙΣΗ
                recipeModal.classList.add("active");

                // 4. ΟΜΑΛΗ ΕΜΦΑΝΙΣΗ ΕΙΚΟΝΑΣ
                if (imgElem) {
                    if (imgElem.complete) {
                        imgElem.style.opacity = "1";
                    } else {
                        imgElem.onload = () => { imgElem.style.opacity = "1"; };
                    }
                }
            });
        });

        if (recipeCloseBtn) recipeCloseBtn.onclick = closeRecipe;
        window.addEventListener("click", (e) => { 
            if (e.target === recipeModal) closeRecipe(); 
        });
    }

    // --- ΛΟΓΙΚΗ LOGIN ---
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
