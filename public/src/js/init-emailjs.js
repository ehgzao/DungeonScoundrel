// public/src/js/init-emailjs.js

document.addEventListener("DOMContentLoaded", function () {
    // Garantir que emailjs está disponível
    if (window.emailjs && emailjs.init) {
        // Inicializa com o USER ID correto
        emailjs.init("JhH3cSIF6g3y73-Yk");
        console.log("EmailJS inicializado com sucesso.");
    } else {
        console.error("EmailJS NÃO carregou corretamente.");
    }
});

/*
Funções utilitárias para envio dos templates.
Use assim:

sendBugReport({
  from_name: "Gabriel",
  message: "Encontrei um bug na tela X"
});

sendWaitlist({
  user_email: "teste@gmail.com"
});
*/

function sendBugReport(data) {
    return emailjs.send("service_default", "template_x3cplm6", data);
}

function sendWaitlist(data) {
    return emailjs.send("service_default", "template_hif1mc1", data);
}

window.sendBugReport = sendBugReport;
window.sendWaitlist = sendWaitlist;
