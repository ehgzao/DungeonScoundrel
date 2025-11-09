/**
 * EMAIL INITIALIZATION
 * Inicializa o EmailJS com a chave pública
 */

(function initEmailJS() {
    if (window.emailjs) {
        emailjs.init('JhH3cSIF6g3y73-Yk');
        console.log('✅ EmailJS initialized');
    } else {
        console.error('❌ EmailJS not loaded');
    }
})();
