// --- Restaurant Website Type Definitions ---

// 1. Τύποι για τα Cookies και το LocalStorage
export type AuthCookieName = "userToken" | "savedUser" | "hideLogin";

// 2. Interface για τα πιάτα του Carousel (data-dish)
export interface Dish {
    id: string;
    title: string;
    description: string;
    imageSrc: string;
    category?: 'specials' | 'gallery';
}

// 3. Types για τη διαχείριση του DOM
export type DOMElement = HTMLElement | null;
export type CarouselTrack = HTMLDivElement | null;

// 4. Interface για την κατάσταση της παραγγελίας (Modal logic)
export interface OrderState {
    currentQty: number;
    isActive: boolean;
}

// Παράδειγμα χρήσης στον κώδικά σου:
// function getCookie(name: AuthCookieName): string | null;
