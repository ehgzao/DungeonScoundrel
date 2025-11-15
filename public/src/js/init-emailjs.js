// public/src/js/init-emailjs.js
// Initialize EmailJS safely (non-module script)

document.addEventListener("DOMContentLoaded", function () {
  // Garantir que emailjs está disponível
  if (window.emailjs && typeof emailjs.init === "function") {
    // Inicializa com o USER ID correto (fornecido por você)
    emailjs.init("JhH3cSIF6g3y73-Yk");
    console.log("EmailJS inicializado com sucesso.");
  } else {
    console.error("EmailJS NÃO carregou corretamente.");
  }
});

/*
  Funções utilitárias para envio dos templates.
  Exemplos de uso (no client):
    window.sendBugReport({ from_name: "Gabriel", message: "Encontrei um bug" });
    window.sendWaitlist({ user_email: "teste@gmail.com" });
*/

// não usar `export` — atribuímos ao window
function sendBugReport(data) {
  return window.emailjs.send("service_default", "template_x3cplm6", data);
}

function sendWaitlist(data) {
  return window.emailjs.send("service_default", "template_hif1mc1", data);
}

window.sendBugReport = sendBugReport;
window.sendWaitlist = sendWaitlist;
