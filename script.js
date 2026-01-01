// ======================================================
// 1. COOKIES
// ======================================================
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
        let c = ca[i].trim();
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
    }
    return null;
}

// ======================================================
// 2. CAROUSEL LOGIC (ΜΟΝΟ swipe / scroll)
// ======================================================
let isScrolling = false;

function initializeCarouselLogic() {
    const section = document.querySelector(".todays-specials");
    if (!section) return;

    const track = section.querySelector(".carousel-track");
    const container = section.querySelector(".carousel-container");
    const dotsContainer = section.querySelector(".carousel-dots");
    const cards = track ? Array.from(track.children) : [];

    if (!track || !container || !dotsContainer || cards.length === 0) return;

    const GAP = 30;
    let currentSlide = 0;
    let metrics = {};

    function calculateMetrics() {
        const cardWidth = cards[0].getBoundingClientRect().width;
        const slideDistance = cardWidth + GAP;
        const containerWidth = container.clientWidth;
        const cardsPerView = Math.floor(containerWidth / slideDistance) || 1;
        const totalPages = Math.max(1, cards.length - cardsPerView + 1);
        metrics = { slideDistance, totalPages };
    }

    function moveToSlide(index) {
        const { slideDistance, totalPages } = metrics;
        currentSlide = Math.max(0, Math.min(index, totalPages - 1));
        track.style.transform = `translateX(${-currentSlide * slideDistance}px)`;
        updateDots();
    }

    function updateDots() {
        dotsContainer.querySelectorAll(".dot").forEach((dot, i) => {
            dot.classList.togg
