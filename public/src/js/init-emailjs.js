document.addEventListener('DOMContentLoaded', () => {
    try {
        if (window.emailjs && emailjs.init) {
            emailjs.init("JhH3cSIF6g3y73-Yk");
        } else {
            console.warn("emailjs not ready");
        }
    } catch (e) {
        console.error("emailjs init failed:", e);
    }
});
