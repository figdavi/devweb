document.addEventListener("DOMContentLoaded", function () {
    // 1. Captura os elementos usando os IDs corretos do seu HTML (# significa ID)
    const formLogin = document.getElementById("formLogin");
    const formRegistrarCliente = document.getElementById("formRegistrarCliente");
    const formRegistrarPrestador = document.getElementById("formRegistrarPrestador");
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

    // Validar Login
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

    // Cadastrar Cliente 
    if (formRegistrarCliente) {
        formRegistrarCliente.addEventListener("submit", function (evento) {
            // Busca as classes específicas que você colocou nos inputs do registro
            const nome = formRegistrarCliente.querySelector(".reg-nome").value.trim();
            const email = formRegistrarCliente.querySelector(".reg-email").value.trim();
            const senha = formRegistrarCliente.querySelector(".reg-senha").value.trim();
            const confirmarSenha = formRegistrarCliente.querySelector(".reg-confirmar-senha").value.trim();
            const cep = formRegistrarCliente.querySelector(".reg-cep").value.trim();
            
            // Como seu checkbox usa o ID padrão do Bootstrap, capturamos por ele aqui
            const termosCheck = document.getElementById("flexCheckDefault") ? document.getElementById("flexCheckDefault").checked : false;

            if (nome === "" || email === "" || senha === "" || confirmarSenha === "" || cep === "" || !termosCheck) {
                evento.preventDefault(); // Impede o envio do formulário
                mostrarAlerta();
            }
        });
    }

    if(formRegistrarPrestador) {
        formRegistrarPrestador.addEventListener("submit", function (evento){
            const nome = formRegistrarPrestador.querySelector(".reg-nome").value.trim();
            const email = formRegistrarPrestador.querySelector(".reg-email").value.trim();
            const senha = formRegistrarPrestador.querySelector(".reg-senha").value.trim();
            const confirmarSenha = formRegistrarPrestador.querySelector(".reg-confirmar-senha").value.trim();
            const cep = formRegistrarPrestador.querySelector(".reg-cep").value.trim();
            const opcaoSelecionada = formRegistrarPrestador.querySelector(".reg-opcao").value;
            const descricao = formRegistrarPrestador.querySelector(".reg-descricao").value.trim();
            const termosCheck = document.getElementById("flexCheckDefault") ? document.getElementById("flexCheckDefault").checked : false;
            if (nome === "" || email === "" || senha === "" || confirmarSenha === "" || cep === "" || opcaoSelecionada === "" || descricao === "" || !termosCheck) {
                    evento.preventDefault(); // Impede o envio do formulário
                    mostrarAlerta();
                }
        });
    }
});