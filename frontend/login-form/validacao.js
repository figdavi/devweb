document.addEventListener("DOMContentLoaded", function () {
    // 1. Captura os elementos usando os IDs corretos do seu HTML (# significa ID)
    const formLogin = document.getElementById("formLogin");
    const formRegistrar = document.getElementById("formRegistrar");
    const containerAlerta = document.getElementById("containerAlerta");

    // Função para renderizar o alerta do Bootstrap dentro da div #containerAlerta
    function mostrarAlerta() {
        if (containerAlerta) {
            containerAlerta.innerHTML = `
                <div class="alert alert-warning alert-dismissible fade show" role="alert">
                    <strong>Atenção!</strong> Preencha todos os campos.
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            `;
        }
    }

    // ================= VALIDAÇÃO LOGIN =================
    if (formLogin) {
        formLogin.addEventListener("submit", function (evento) {
            // Busca as classes específicas que você colocou nos inputs (. significa classe)
            const email = formLogin.querySelector(".login-email").value.trim();
            const senha = formLogin.querySelector(".login-senha").value.trim();

            if (email === "" || senha === "") {
                evento.preventDefault(); // Impede a página de recarregar
                mostrarAlerta();
            }
        });
    }

    // ================= VALIDAÇÃO REGISTRAR =================
    if (formRegistrar) {
        formRegistrar.addEventListener("submit", function (evento) {
            // Busca as classes específicas que você colocou nos inputs do registro
            const nome = formRegistrar.querySelector(".reg-nome").value.trim();
            const email = formRegistrar.querySelector(".reg-email").value.trim();
            const senha = formRegistrar.querySelector(".reg-senha").value.trim();
            const confirmarSenha = formRegistrar.querySelector(".reg-confirmar-senha").value.trim();
            
            // Como seu checkbox usa o ID padrão do Bootstrap, capturamos por ele aqui
            const termosCheck = document.getElementById("flexCheckDefault") ? document.getElementById("flexCheckDefault").checked : false;

            if (nome === "" || email === "" || senha === "" || confirmarSenha === "" || !termosCheck) {
                evento.preventDefault(); // Impede o envio do formulário
                mostrarAlerta();
            }
        });
    }
});