// 3. ΕΚΤΕΛΕΣΗ ΟΤΑΝ ΦΟΡΤΩΣΕΙ Η ΣΕΛΙΔΑ
document.addEventListener("DOMContentLoaded", () => {
    initializeCarouselLogic();

    const recipeModal = document.getElementById("recipeModal");
    const recipeCloseBtn = document.getElementById("recipeClose");
    const recipeImages = document.querySelectorAll(".recipe-img");

    // --- ΔΙΟΡΘΩΜΕΝΗ ΛΟΓΙΚΗ MODAL (ΠΡΟΤΑΣΕΙΣ ΓΕΥΣΕΩΝ) ---
    if (recipeModal) {
        const closeRecipe = () => {
            recipeModal.classList.remove("active");
            // Καθαρισμός src μετά το κλείσιμο για να μην "πετάγεται" η παλιά εικόνα την επόμενη φορά
            setTimeout(() => {
                const imgElem = document.getElementById("modalImage");
                if (imgElem) imgElem.src = "";
            }, 300);
        };

       recipeImages.forEach(img => {
            img.addEventListener("click", (e) => {
                if (isScrolling) return;
                e.preventDefault();

                const titleElem = document.getElementById("modalTitle");
                const imgElem = document.getElementById("modalImage");
                const descElem = document.getElementById("modalDescription");

                // 1. ΑΜΕΣΟΣ ΚΑΘΑΡΙΣΜΟΣ
                if (imgElem) imgElem.src = ""; 
                
                // 2. Χρησιμοποιούμε requestAnimationFrame για να βεβαιωθούμε 
                // ότι ο browser "είδε" ότι η εικόνα σβήστηκε.
                requestAnimationFrame(() => {
                    if (titleElem) titleElem.textContent = img.dataset.title || img.alt;
                    if (descElem) descElem.textContent = img.dataset.description || "";
                    
                    // 3. Βάζουμε τη νέα εικόνα
                    if (imgElem) imgElem.src = img.src;

                    // 4. Εμφανίζουμε το modal
                    recipeModal.classList.add("active");
                });
            });
        });

        if (recipeCloseBtn) recipeCloseBtn.onclick = closeRecipe;
        
        // Κλείσιμο με κλικ έξω από το περιεχόμενο
        window.addEventListener("click", (e) => { 
            if (e.target === recipeModal) closeRecipe(); 
        });
    }

    // Λογική Login (Το υπόλοιπο παραμένει ως έχει...)
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
