
function initializeCarouselLogic() {
    // ... (Ο κώδικας του Carousel που έχετε παραθέσει) ...
    const carouselSection = document.querySelector(".todays-specials");
    if (!carouselSection) return;

    const track = carouselSection.querySelector(".carousel-track");
    const container = carouselSection.querySelector(".carousel-container");
    const dotsContainer = carouselSection.querySelector(".carousel-dots");
    const cards = track ? Array.from(track.children) : [];

    if (!track || cards.length === 0 || !dotsContainer || !container) {
        console.warn("Carousel: Δεν βρέθηκαν τα απαραίτητα στοιχεία για την λειτουργία του Carousel.");
        return;
    }

    const originalCardsCount = cards.length;
    let currentSlide = 0;
    
    const GAP = 20; // Το ίδιο με το CSS gap: 20px
    const FIXED_CARD_WIDTH = 250; // Η σταθερή τιμή πλάτους από το CSS (min-width)
    let carouselMetrics = {}; 

    function calculateCarouselMetrics() {
        const slideDistance = FIXED_CARD_WIDTH + GAP; 
        
        const cardsPerView = Math.floor(container.clientWidth / slideDistance);
        const totalPages = Math.max(1, originalCardsCount - cardsPerView + 1);

        carouselMetrics = { slideDistance, totalPages, cardsPerView };
    }

    // Δημιουργία των Dots
    function createDots(totalPages) {
        dotsContainer.innerHTML = '';
        const dotsToShow = totalPages;

        for (let i = 0; i < dotsToShow; i++) {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            dot.dataset.index = i;
            dot.addEventListener('click', () => {
                moveToSlide(i);
            });
            dotsContainer.appendChild(dot);
        }
    }

    // Μετακίνηση του Carousel
    function moveToSlide(index) {
        const { slideDistance, totalPages } = carouselMetrics; 

        // 1. Έλεγχος ορίων
        if (index < 0) {
            currentSlide = 0;
        } else if (index >= totalPages) {
            currentSlide = totalPages - 1;
        } else {
            currentSlide = index;
        }

        let offset = 0;
        const maxScrollablePosition = Math.max(0, track.scrollWidth - container.clientWidth); 
        
        if (currentSlide === totalPages - 1 && totalPages > 1) {
            offset = -maxScrollablePosition;
        } else {
            offset = -currentSlide * slideDistance;
        }
        
        offset = Math.min(0, offset); 
        
        track.style.transition = 'transform 0.5s ease';
        track.style.transform = `translateX(${Math.round(offset)}px)`; 

        updateDots();
    }

    // Ενημέρωση ενεργού dot
    function updateDots() {
        const dots = dotsContainer.querySelectorAll('.dot');
        const { totalPages } = carouselMetrics; 
        
        let activeDotIndex = currentSlide;
        if (activeDotIndex >= totalPages) {
            activeDotIndex = totalPages - 1;
        }

        dots.forEach((dot, index) => {
            dot.classList.remove('active');
            if (index === activeDotIndex && index < dots.length) { 
                dot.classList.add('active');
            }
        });
    }

    // Συνάρτηση Εκκίνησης και Επανεκκίνησης (για Responsive)
    function initializeCarousel() {
        // ΠΡΩΤΑ υπολογίζουμε τα metrics
        calculateCarouselMetrics(); 
        
        // 2. Μετά δημιουργούμε τα dots
        createDots(carouselMetrics.totalPages); 
        
        // 3. Μετακινούμε στο σωστό slide
        moveToSlide(currentSlide);
    }
    
    // Προσθήκη event listener για αλλαγή μεγέθους
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            initializeCarousel();
        }, 300); // Debounce
    });

    // Αρχική εκκίνηση του carousel
    initializeCarousel();
}

// Τρέχει τη λογική του carousel
document.addEventListener("DOMContentLoaded", initializeCarouselLogic);
// ΑΛΛΑΓΗ ΕΔΩ: Χρησιμοποιούμε DOMContentLoaded για ταχύτερη εμφάνιση του modal
document.addEventListener("DOMContentLoaded", () => { 
    // 1. Δήλωση Στοιχείων
    const overlay = document.getElementById("loginOverlay");
    const popup = document.getElementById("loginPopup");
    const closeBtn = document.getElementById("loginClose");
    const loginButton = document.getElementById("loginButton");

    // Στοιχεία του Modal
    const usernameInput = document.getElementById("usernameInput");
    const passwordInput = document.getElementById("passwordInput"); 
    const rememberMeCheck = document.getElementById("rememberMeCheck");

    // Ελέγχουμε την ύπαρξη όλων των στοιχείων πριν συνεχίσουμε
    if (!overlay || !popup || !closeBtn || !loginButton || !usernameInput || !passwordInput || !rememberMeCheck) { 
        console.error("Login Modal: Ένα ή περισσότερα απαραίτητα IDs δεν βρέθηκαν. Διακόπτεται η λειτουργία του modal.");
        return;
    }

    const LS_KEY = "userWantsToStayLogged";


    const openModal = () => {
        overlay.style.display = "block";
        popup.style.display = "block";

        // FOCUS MANAGEMENT: Τοποθέτηση focus στο πρώτο input
        setTimeout(() => {
            try {
                usernameInput.focus();
            } catch (e) {
                console.error("Could not set focus on username input:", e);
            }
        }, 100);
    };


    const closeModal = () => {
        overlay.style.display = "none";
        popup.style.display = "none";
    };


    // Έλεγχος Local Storage για εμφάνιση
    const isRemembered = localStorage.getItem(LS_KEY) === "true";

    // Αν ο χρήστης δεν επέλεξε "Μην το ξαναδείξεις", εμφανίζεται το modal μετά από 4 δευτερόλεπτα
    if (!isRemembered) {
        setTimeout(openModal, 4000); // Το modal θα εμφανιστεί μετά από 4 δευτερόλεπτα
    }

    

    // Κλείσιμο με το 'x' και με κλικ στο overlay
    closeBtn.addEventListener("click", closeModal);
    overlay.addEventListener("click", closeModal);

// 1.1 FORM SUBMISSION AND LOCAL STORAGE (ΔΙΟΡΘΩΜΕΝΟ)

// Βήμα 2: Ακούστε το SUBMIT event της ΦΟΡΜΑΣ
loginForm.addEventListener("submit", (e) => {
    
    // 1. ΑΠΑΡΑΙΤΗΤΟ: Σταματάμε το reload της σελίδας
    e.preventDefault(); 
    
    // Λογική Remember Me
    if (rememberMeCheck.checked) {
        localStorage.setItem(LS_KEY, "true");
        // console.log("Αποθήκευση: Να με θυμάσαι"); // Μπορείτε να το σβήσετε
    } else {
        localStorage.removeItem(LS_KEY);
        // console.log("Αφαίρεση: Μην με θυμάσαι"); // Μπορείτε να το σβήσετε
    }

    // 3. Κλείσιμο Popup
    closeModal(); // Καλέστε τη συνάρτηση που κλείνει το modal
    
    // 4. (Εδώ θα γινόταν η AJAX κλήση για τη σύνδεση)
    
});
});

// ----------------------------------------------------
// ---- 2. RECIPE MODAL (MODAL ΣΥΝΤΑΓΩΝ) ----
// ----------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    // Αρχικοποίηση μεταβλητών για το Recipe Modal
    const modal = document.getElementById("recipeModal");
    
    // Ελέγχουμε αν υπάρχει το modal πριν συνεχίσουμε
    if (!modal) {
        console.warn("Recipe Modal: Το στοιχείο με ID 'recipeModal' δεν βρέθηκε.");
        return;
    }

    const modalTitle = document.getElementById("modalTitle");
    const modalImage = document.getElementById("modalImage");
    const modalDescription = document.getElementById("modalDescription");
    
    const recipeCloseBtn = document.getElementById("recipeClose");
    // 🔴 Σημαντικό: Βεβαιωθείτε ότι η κλάση στις εικόνες σας είναι '.recipe-img' ή αλλάξτε το σε '.item img' αν χρειάζεται
    const images = document.querySelectorAll(".recipe-img");
    
    // Συνάρτηση για άνοιγμα του Recipe Modal
    function openRecipeModal(title, imageSrc, description) {
        
        // 1. Ενημέρωση Περιεχομένου ΠΡΙΝ την εμφάνιση (για αποφυγή Reflow/Lag)
        if (modalTitle) modalTitle.textContent = title;
        if (modalImage) modalImage.src = imageSrc;
        if (modalDescription) modalDescription.textContent = description;
        
        // 2. Εμφάνιση Modal με την κλάση active
        // 🔴 Η ΔΙΟΡΘΩΣΗ: Χρήση classList.add('active')
        modal.classList.add("active");
    }

    // Event Listener για τις εικόνες των συνταγών
    images.forEach(img => {
        img.addEventListener("click", function() {
            const title = this.getAttribute('data-title') || this.alt;
            const imageSrc = this.src;
            const description = this.getAttribute('data-description') || "Δεν υπάρχει διαθέσιμη περιγραφή.";
            openRecipeModal(title, imageSrc, description);
        });
    });

    // Συνάρτηση για κλείσιμο του Recipe Modal
    function closeRecipeModal() {
        // 🔴 Η ΔΙΟΡΘΩΣΗ: Χρήση classList.remove('active')
        modal.classList.remove("active");
    }

    // Κλείσιμο του Modal με το 'x'
    if (recipeCloseBtn) {
        recipeCloseBtn.addEventListener("click", closeRecipeModal);
    }

    // Κλείσιμο του Modal με κλικ εκτός του πλαισίου
    window.addEventListener("click", e => {
        if (e.target === modal) {
            closeRecipeModal();
        }
    });

    // Προσθήκη Κλεισίματος με ESC
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("active")) {
            closeRecipeModal();
        }
    });
});


function initializeCarouselLogic() {

    const carouselSection = document.querySelector(".todays-specials");
    if (!carouselSection) return;

    const track = carouselSection.querySelector(".carousel-track");
    const container = carouselSection.querySelector(".carousel-container");
    const dotsContainer = carouselSection.querySelector(".carousel-dots");
    const cards = track ? Array.from(track.children) : [];

    if (!track || cards.length === 0 || !dotsContainer || !container) {
        console.warn("Carousel: Δεν βρέθηκαν τα απαραίτητα στοιχεία για την λειτουργία του Carousel.");
        return;
    }}

    function initializeCarouselLogic() {

    const carouselSection = document.querySelector(".todays-specials");
    if (!carouselSection) return;

    const track = carouselSection.querySelector(".carousel-track");
    const container = carouselSection.querySelector(".carousel-container");
    const dotsContainer = carouselSection.querySelector(".carousel-dots");
    const cards = track ? Array.from(track.children) : [];

    if (!track || cards.length === 0 || !dotsContainer || !container) {
        console.warn("Carousel: Δεν βρέθηκαν τα απαραίτητα στοιχεία για την λειτουργία του Carousel.");
        return;
    }

    const originalCardsCount = cards.length;
    let currentSlide = 0;
    
    // 🟢 1. ΣΤΑΘΕΡΕΣ ΜΕΤΡΗΣΕΙΣ (ΓΙΑ ΝΑ ΕΙΝΑΙ ΣΤΑΘΕΡΑ ΤΑ DOTS ΣΤΟ RELOAD)
    const GAP = 20; // Το ίδιο με το CSS gap: 20px
    const FIXED_CARD_WIDTH = 250; // Η σταθερή τιμή πλάτους από το CSS (min-width)
    let carouselMetrics = {}; 
    // -----------------------------------------------------------------

    // Υπολογισμός Καρτών, Απόστασης και Σελίδων (Responsive)
    function calculateCarouselMetrics() {
        // ❌ ΔΕΝ ΧΡΗΣΙΜΟΠΟΙΟΥΜΕ πια το cards[0].offsetWidth
        const slideDistance = FIXED_CARD_WIDTH + GAP; 
        
        const cardsPerView = Math.floor(container.clientWidth / slideDistance);
        const totalPages = Math.max(1, originalCardsCount - cardsPerView + 1);

        carouselMetrics = { slideDistance, totalPages, cardsPerView };
    }

    // Δημιουργία των Dots
    function createDots(totalPages) {
        dotsContainer.innerHTML = '';
        const dotsToShow = totalPages;

        for (let i = 0; i < dotsToShow; i++) {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            dot.dataset.index = i;
            dot.addEventListener('click', () => {
                moveToSlide(i);
            });
            dotsContainer.appendChild(dot);
        }
    }

    // Μετακίνηση του Carousel
    function moveToSlide(index) {
        const { slideDistance, totalPages } = carouselMetrics; 

        // 1. Έλεγχος ορίων
        if (index < 0) {
            currentSlide = 0;
        } else if (index >= totalPages) {
            currentSlide = totalPages - 1;
        } else {
            currentSlide = index;
        }

        let offset = 0;
        const maxScrollablePosition = Math.max(0, track.scrollWidth - container.clientWidth); 
        
        if (currentSlide === totalPages - 1 && totalPages > 1) {
            offset = -maxScrollablePosition;
        } else {
            offset = -currentSlide * slideDistance;
        }
        
        offset = Math.min(0, offset); 
        
        track.style.transition = 'transform 0.5s ease';
        track.style.transform = `translateX(${Math.round(offset)}px)`; 

        updateDots();
    }

    // Ενημέρωση ενεργού dot
    function updateDots() {
        const dots = dotsContainer.querySelectorAll('.dot');
        const { totalPages } = carouselMetrics; 
        
        let activeDotIndex = currentSlide;
        if (activeDotIndex >= totalPages) {
            activeDotIndex = totalPages - 1;
        }

        dots.forEach((dot, index) => {
            dot.classList.remove('active');
            if (index === activeDotIndex && index < dots.length) { 
                dot.classList.add('active');
            }
        });
    }

    // Συνάρτηση Εκκίνησης και Επανεκκίνησης (για Responsive)
    function initializeCarousel() {
        // ΠΡΩΤΑ υπολογίζουμε τα metrics
        calculateCarouselMetrics(); 
        
        // ΜΕΤΑ χρησιμοποιούμε τα metrics για να δημιουργήσουμε/μετακινήσουμε
        const { totalPages } = carouselMetrics;
        createDots(totalPages);
        moveToSlide(currentSlide);
    }

    // 1. Έναρξη του Carousel
    initializeCarousel();

    // 2. Επανεκκίνηση σε αλλαγή μεγέθους οθόνης (ΚΡΙΣΙΜΟ)
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            currentSlide = 0; 
            track.style.transition = 'none'; 
            initializeCarousel(); // Επανυπολογισμός και εκτέλεση
        }, 200); 
    });
} // Τέλος της συνάρτησης initializeCarouselLogic

// ----------------------------------------------------
// ΚΑΛΕΣΜΑ ΤΗΣ ΣΥΝΑΡΤΗΣΗΣ
// ----------------------------------------------------
window.addEventListener('load', initializeCarouselLogic);

