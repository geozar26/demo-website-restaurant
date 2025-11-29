// ------------------------------------------------------------------
// ---- 1. LOGIN MODAL (POP-UP) ----
// ------------------------------------------------------------------
window.addEventListener("load", () => {
    // 1. Δήλωση Στοιχείων
    const overlay = document.getElementById("loginOverlay");
    const popup = document.getElementById("loginPopup");
    const closeBtn = document.getElementById("loginClose");
    const loginButton = document.getElementById("loginButton");

    // Στοιχεία του Modal
    const usernameInput = document.getElementById("usernameInput");
    // ΠΡΟΣΘΗΚΗ: Το passwordInput, για πληρότητα, αν και δεν χρησιμοποιείται ακόμα
    const passwordInput = document.getElementById("passwordInput"); 
    const rememberMeCheck = document.getElementById("rememberMeCheck");

    // ΕΛΕΓΧΟΣ: Διακοπή αν λείπουν τα βασικά στοιχεία στο HTML
    if (!overlay || !popup || !closeBtn || !loginButton || !usernameInput || !rememberMeCheck) {
        console.error("Login Modal: Ένα ή περισσότερα απαραίτητα IDs (overlay/popup/button/inputs) δεν βρέθηκαν στο HTML. Διακόπτεται η λειτουργία του modal.");
        return; // Διακόπτει την εκτέλεση του υπόλοιπου κώδικα του modal
    }

    // ΚΛΕΙΔΙ Local Storage
    const LS_KEY = "userWantsToStayLogged";

    // ΛΕΙΤΟΥΡΓΙΑ: Άνοιγμα Modal
    const openModal = () => {
        overlay.style.display = "block";
        popup.style.display = "block";

        // FOCUS MANAGEMENT: Τοποθέτηση focus στο πρώτο input
        setTimeout(() => {
            try {
                usernameInput.focus();
            } catch (e) {
                // Χειρισμός σφάλματος αν το focus αποτύχει (π.χ. αν το input είναι κρυφό)
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
        setTimeout(openModal, 4000);
    }

    // ------------------------------------------------------------------

    // Κλείσιμο με το 'x' και με κλικ στο overlay
    closeBtn.addEventListener("click", closeModal);
    overlay.addEventListener("click", closeModal);

    // 1.1 LOCAL STORAGE MANAGEMENT
    loginButton.addEventListener("click", () => {
        const username = usernameInput.value.trim();

        if (username !== "") {
            // Αν το checkbox είναι τσεκαρισμένο, αποθηκεύουμε την επιλογή.
            if (rememberMeCheck.checked) {
                localStorage.setItem(LS_KEY, "true");
            } else {
                // Αν δεν είναι τσεκαρισμένο, σβήνουμε τυχόν παλιά τιμή.
                localStorage.removeItem(LS_KEY);
            }

            closeModal();
            // (Εδώ θα γινόταν κανονικά η σύνδεση ή redirect)
        } else {
            alert("Παρακαλώ εισάγετε το όνομα ή το email σας.");
        }
    });

    // 1.2 ΠΡΟΣΘΗΚΗ ΣΥΝΤΟΜΕΥΣΕΩΝ (ESC Key)
    document.addEventListener("keydown", (e) => {
        // Κλείνει αν πατηθεί ESC ΚΑΙ το modal είναι ορατό.
        if (e.key === "Escape" && popup.style.display === "block") {
            closeModal();
        }
    });
});


// ----------------------------------------------------
// ---- 2. RECIPE MODAL (MODAL ΣΥΝΤΑΓΩΝ) ----
// ----------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    // Αρχικοποίηση μεταβλητών για το Recipe Modal
    const modal = document.getElementById("recipeModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalImage = document.getElementById("modalImage");
    const modalDescription = document.getElementById("modalDescription");
    // Χρησιμοποιούμε querySelector για να βρούμε το πρώτο span.close μέσα στο #recipeModal
  // Αρχικοποίηση μεταβλητών για το Recipe Modal
// ...
const recipeCloseBtn = document.getElementById("recipeClose"); // ΨΑΧΝΟΥΜΕ ΤΟ ΝΕΟ ID
const images = document.querySelectorAll(".recipe-img");
    
    // ΕΛΕΓΧΟΣ: Διακοπή αν λείπουν τα βασικά στοιχεία
    if (!modal || !modalTitle || !modalImage || !modalDescription) {
         console.error("Recipe Modal: Ένα ή περισσότερα απαραίτητα IDs (modal/title/image/description) δεν βρέθηκαν στο HTML.");
         return; 
    }

    // Συνάρτηση για άνοιγμα του Recipe Modal
    function openRecipeModal(title, imageSrc, description) {
        modalTitle.textContent = title;
        modalImage.src = imageSrc;
        modalDescription.textContent = description;
        modal.style.display = "block";
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

    // Κλείσιμο του Modal με το 'x'
    if (recipeCloseBtn) {
        recipeCloseBtn.addEventListener("click", () => {
            modal.style.display = "none";
        });
    }

    // Κλείσιμο του Modal με κλικ εκτός του πλαισίου
    window.addEventListener("click", e => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });
});

// ----------------------------------------------------
// ---- 3. CAROUSEL (TODAY'S SPECIALS) ----
// ----------------------------------------------------
// ----------------------------------------------------
// ---- 3. CAROUSEL (TODAY'S SPECIALS) ----
// ----------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {

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
    let carouselMetrics = {}; // ΝΕΑ ΜΕΤΑΒΛΗΤΗ: Αποθηκεύει τους υπολογισμούς

    // Υπολογισμός Καρτών, Απόστασης και Σελίδων (Responsive)
    function calculateCarouselMetrics() {
        // Αυτή η λειτουργία καλείται μόνο στο init και στο resize
        const cardWidth = cards[0].offsetWidth; 
        const slideDistance = cardWidth + GAP;
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
        // Χρησιμοποιούμε την αποθηκευμένη τιμή (ΑΠΟΦΥΓΗ REFOW)
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

        // 2. Υπολογισμός μέγιστης μετατόπισης (για την τελευταία σελίδα)
        // ΣΗΜΕΙΩΣΗ: track.scrollWidth και container.clientWidth δεν προκαλούν Forced Reflow
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
        // Χρησιμοποιούμε την αποθηκευμένη τιμή (ΑΠΟΦΥΓΗ REFOW)
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

    // 1. Έναρξη
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
});