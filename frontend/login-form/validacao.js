document.addEventListener("DOMContentLoaded", function () {
    // 1. Captura os elementos usando os IDs corretos do seu HTML
    const formLogin = document.getElementById("formLogin");
    const formRegistrarCliente = document.getElementById("formRegistrarCliente");
    const formRegistrarPrestador = document.getElementById("formRegistrarPrestador");
    const containerAlerta = document.getElementById("containerAlerta");

    // 2. Função de alerta melhorada (aceita mensagem e tipo de cor do Bootstrap)
    function mostrarAlerta(mensagem, tipo = "warning") {
        if (containerAlerta) {
            containerAlerta.innerHTML = `
                <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
                    <strong>${tipo === 'success' ? 'Sucesso!' : 'Atenção!'}</strong> ${mensagem}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            `;
        }
    }

    // ==========================================
    // VALIDAR LOGIN (Integrado com Back-end)
    // ==========================================
    if (formLogin) {
        formLogin.addEventListener("submit", async function (evento) {
            evento.preventDefault();

            const email = formLogin.querySelector(".login-email").value.trim();
            const senha = formLogin.querySelector(".login-senha").value.trim();

            if (email === "" || senha === "") {
                mostrarAlerta("Preencha todos os campos.", "warning");
                return;
            }

            const formData = new FormData();
            formData.append('email', email);
            formData.append('senha', senha);

            try {
                const resposta = await fetch('../../backend/api/auth/login.php', {
                    method: 'POST',
                    body: formData
                });

                const dados = await resposta.json();

                if (dados.sucesso) {
                    mostrarAlerta(`Bem-vindo(a), ${dados.nome}!`, "success");

                    localStorage.setItem('id_usuario', dados.id_usuario);
                    localStorage.setItem('nome_usuario', dados.nome);
                    localStorage.setItem('tipo_usuario', dados.tipo);

                    setTimeout(() => {
                        if (dados.tipo === 'cliente') {
                            window.location.href = '../Busca-Servicos/servicos.html';
                        } else if (dados.tipo === 'prestador') {
                            window.location.href = '../Agenda - Prestador/agenda.html';
                        } else {
                            window.location.href = '../index.html';
                        }
                    }, 1500);
                } else {
                    mostrarAlerta(dados.erro, "danger");
                }
            } catch (erro) {
                console.error('Erro na requisição:', erro);
                mostrarAlerta("Erro ao conectar com o servidor. Verifique o console.", "danger");
            }
        });
    }

    // ==========================================
    // CADASTRAR CLIENTE (Integrado com Back-end)
    // ==========================================

    // CEP auto-fill na página de registro de cliente
    const regCepInput = document.getElementById("regCep");
    if (regCepInput) {
        regCepInput.addEventListener("blur", async function () {
            const cep = this.value.replace(/\D/g, "");
            if (cep.length !== 8) return;
            try {
                const resp  = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const dados = await resp.json();
                if (dados.erro) { mostrarAlerta("CEP não encontrado.", "warning"); return; }
                document.getElementById("regLogradouro").value = dados.logradouro ?? "";
                document.getElementById("regCidade").value     = dados.localidade ?? "";
                document.getElementById("regEstado").value     = dados.uf ?? "";
                document.getElementById("regEnderecoContainer").style.display      = "";
                document.getElementById("regEnderecoCidadeContainer").style.display = "";
                document.getElementById("regNumero").focus();
            } catch {
                mostrarAlerta("Erro ao consultar CEP.", "danger");
            }
        });
    }

    if (formRegistrarCliente) {
        formRegistrarCliente.addEventListener("submit", async function (evento) {
            evento.preventDefault();

            const nome           = formRegistrarCliente.querySelector(".reg-nome").value.trim();
            const email          = formRegistrarCliente.querySelector(".reg-email").value.trim();
            const senha          = formRegistrarCliente.querySelector(".reg-senha").value.trim();
            const confirmarSenha = formRegistrarCliente.querySelector(".reg-confirmar-senha").value.trim();
            const cep            = formRegistrarCliente.querySelector(".reg-cep").value.trim();
            const numero         = formRegistrarCliente.querySelector(".reg-numero")?.value.trim() ?? "";
            const complemento    = formRegistrarCliente.querySelector(".reg-complemento")?.value.trim() ?? "";
            const nome_local     = formRegistrarCliente.querySelector(".reg-nome-local")?.value.trim() || "Casa";
            const telefone       = formRegistrarCliente.querySelector(".reg-telefone")?.value.trim() ?? "";
            const termosCheck    = document.getElementById("flexCheckDefault")?.checked ?? false;

            if (!nome || !email || !senha || !confirmarSenha || !cep || !numero || !termosCheck) {
                mostrarAlerta("Preencha todos os campos obrigatórios e aceite os termos.", "warning");
                return;
            }

            if (senha !== confirmarSenha) {
                mostrarAlerta("As senhas não coincidem!", "danger");
                return;
            }

            const formData = new FormData();
            formData.append('nome', nome);
            formData.append('email', email);
            formData.append('telefone', telefone);
            formData.append('senha', senha);
            formData.append('cep', cep);
            formData.append('numero', numero);
            formData.append('complemento', complemento);
            formData.append('nome_local', nome_local);

            try {
                const resposta = await fetch('../../backend/api/auth/cadastro_cliente.php', {
                    method: 'POST',
                    body: formData
                });
                const texto = await resposta.text();
                let dados;
                try { dados = JSON.parse(texto); } catch {
                    mostrarAlerta("Ocorreu um erro inesperado no servidor. Tente novamente.", "danger");
                    return;
                }

                if (dados.sucesso) {
                    mostrarAlerta(dados.mensagem, "success");
                    setTimeout(() => { window.location.href = '../login-form/login.html'; }, 2000);
                } else {
                    mostrarAlerta(dados.erro, "danger");
                }
            } catch {
                mostrarAlerta("Não foi possível conectar ao servidor.", "danger");
            }
        });
    }

    // ==========================================
    // CADASTRAR PRESTADOR (Integrado com Back-end)
    // ==========================================

    // Carrega categorias no select ao abrir a página de registro
    const selectCategoria = document.querySelector(".reg-opcao");
    if (selectCategoria) {
        fetch('../../backend/api/catalogo/categorias_list.php')
            .then(r => r.json())
            .then(dados => {
                if (Array.isArray(dados)) {
                    selectCategoria.innerHTML = '<option selected disabled value="">Selecione uma categoria...</option>' +
                        dados.map(c => `<option value="${c.id_categoria}">${c.nome}</option>`).join('');
                }
            })
            .catch(() => {});
    }

    if (formRegistrarPrestador) {
        formRegistrarPrestador.addEventListener("submit", async function (evento) {
            evento.preventDefault();

            const nome           = formRegistrarPrestador.querySelector(".reg-nome").value.trim();
            const email          = formRegistrarPrestador.querySelector(".reg-email").value.trim();
            const telefone       = formRegistrarPrestador.querySelector(".reg-telefone")?.value.trim() ?? "";
            const senha          = formRegistrarPrestador.querySelector(".reg-senha").value.trim();
            const confirmarSenha = formRegistrarPrestador.querySelector(".reg-confirmar-senha").value.trim();
            const cep            = formRegistrarPrestador.querySelector(".reg-cep").value.trim();
            const id_categoria   = formRegistrarPrestador.querySelector(".reg-opcao").value;
            const descricao      = formRegistrarPrestador.querySelector(".reg-descricao").value.trim();
            const termosCheck    = document.getElementById("flexCheckDefault")?.checked ?? false;

            if (!nome || !email || !telefone || !senha || !confirmarSenha || !cep || !id_categoria || !descricao || !termosCheck) {
                mostrarAlerta("Preencha todos os campos e aceite os termos.", "warning");
                return;
            }

            if (senha !== confirmarSenha) {
                mostrarAlerta("As senhas não coincidem!", "danger");
                return;
            }

            const formData = new FormData();
            formData.append('nome', nome);
            formData.append('email', email);
            formData.append('telefone', telefone);
            formData.append('senha', senha);
            formData.append('cep', cep);
            formData.append('id_categoria', id_categoria);
            formData.append('descricao_profissional', descricao);

            try {
                const resposta = await fetch('../../backend/api/auth/cadastro_prestador.php', {
                    method: 'POST',
                    body: formData
                });
                const texto = await resposta.text();
                let dados;
                try { dados = JSON.parse(texto); } catch {
                    mostrarAlerta("Ocorreu um erro inesperado no servidor. Tente novamente.", "danger");
                    return;
                }

                if (dados.sucesso) {
                    mostrarAlerta(dados.mensagem, "success");
                    setTimeout(() => { window.location.href = 'login.html'; }, 2000);
                } else {
                    mostrarAlerta(dados.erro, "danger");
                }
            } catch {
                mostrarAlerta("Não foi possível conectar ao servidor.", "danger");
            }
        });
    }
});