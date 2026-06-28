document.addEventListener("DOMContentLoaded", async function () {
    const id_usuario = localStorage.getItem("id_usuario");

    function mostrarAlerta(container, mensagem, tipo = "warning") {
        container.innerHTML = `
            <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
                <strong>${tipo === "success" ? "Sucesso!" : "Atenção!"}</strong> ${mensagem}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
    }

    const containerAlerta          = document.getElementById("containerAlerta");
    const containerAlertaProfissional = document.getElementById("containerAlertaProfissional");
    const containerAlertaEndereco  = document.getElementById("containerAlertaEndereco");
    const containerAlertaSenha     = document.getElementById("containerAlertaSenha");

    // ── Carregar dados ─────────────────────────────────────────────────────
    const [respUser, respPrestador, respCategorias] = await Promise.all([
        fetch(`../../backend/api/me/get.php?id_usuario=${id_usuario}`),
        fetch(`../../backend/api/me/prestador_get.php?id_usuario=${id_usuario}`),
        fetch("../../backend/api/catalogo/categorias_list.php")
    ]).catch(() => {
        mostrarAlerta(containerAlerta, "Erro ao carregar dados.", "danger");
        return [];
    });

    try {
        const user = await respUser.json();
        document.getElementById("inputEmail").value    = user.email;
        document.getElementById("inputNome").value     = user.nome;
        document.getElementById("inputTelefone").value = user.telefone;
    } catch {
        mostrarAlerta(containerAlerta, "Erro ao carregar perfil.", "danger");
    }

    let categorias = [];
    try {
        categorias = await respCategorias.json();
        const select = document.getElementById("inputCategoria");
        select.innerHTML = categorias.map(c =>
            `<option value="${c.id_categoria}">${c.nome}</option>`
        ).join("");
    } catch {
        mostrarAlerta(containerAlertaProfissional, "Erro ao carregar categorias.", "danger");
    }

    try {
        const prestador = await respPrestador.json();
        document.getElementById("inputCategoria").value  = prestador.id_categoria;
        document.getElementById("inputDescricao").value  = prestador.descricao_profissional ?? "";
        document.getElementById("inputCep").value        = prestador.cep;
        document.getElementById("inputLogradouro").value = prestador.logradouro;
        document.getElementById("inputBairro").value     = prestador.bairro;
        document.getElementById("inputCidade").value     = prestador.cidade;
        document.getElementById("inputEstado").value     = prestador.estado;
    } catch {
        mostrarAlerta(containerAlertaProfissional, "Erro ao carregar dados profissionais.", "danger");
    }

    // ── Salvar informações pessoais ────────────────────────────────────────
    document.getElementById("formPerfil").addEventListener("submit", async function (e) {
        e.preventDefault();

        const nome     = document.getElementById("inputNome").value.trim();
        const telefone = document.getElementById("inputTelefone").value.trim();

        if (!nome || !telefone) {
            mostrarAlerta(containerAlerta, "Nome e telefone são obrigatórios.", "warning");
            return;
        }

        const formData = new FormData();
        formData.append("id_usuario", id_usuario);
        formData.append("nome", nome);
        formData.append("telefone", telefone);

        try {
            const resp  = await fetch("../../backend/api/me/update.php", { method: "POST", body: formData });
            const dados = await resp.json();
            if (dados.sucesso) {
                localStorage.setItem("nome_usuario", nome);
                mostrarAlerta(containerAlerta, dados.mensagem, "success");
            } else {
                mostrarAlerta(containerAlerta, dados.erro, "danger");
            }
        } catch {
            mostrarAlerta(containerAlerta, "Erro ao conectar com o servidor.", "danger");
        }
    });

    // ── Salvar informações profissionais ───────────────────────────────────
    document.getElementById("formProfissional").addEventListener("submit", async function (e) {
        e.preventDefault();

        const id_categoria = document.getElementById("inputCategoria").value;
        const descricao    = document.getElementById("inputDescricao").value.trim();

        const formData = new FormData();
        formData.append("id_usuario",             id_usuario);
        formData.append("id_categoria",           id_categoria);
        formData.append("descricao_profissional", descricao);

        try {
            const resp  = await fetch("../../backend/api/me/prestador.php", { method: "POST", body: formData });
            const dados = await resp.json();
            if (dados.sucesso) {
                mostrarAlerta(containerAlertaProfissional, dados.mensagem, "success");
            } else {
                mostrarAlerta(containerAlertaProfissional, dados.erro, "danger");
            }
        } catch {
            mostrarAlerta(containerAlertaProfissional, "Erro ao conectar com o servidor.", "danger");
        }
    });

    // ── CEP auto-fill ──────────────────────────────────────────────────────
    document.getElementById("inputCep").addEventListener("blur", async function () {
        const cep = this.value.replace(/\D/g, "");
        if (cep.length !== 8) return;

        try {
            const resp  = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const dados = await resp.json();

            if (dados.erro) {
                mostrarAlerta(containerAlertaEndereco, "CEP não encontrado.", "warning");
                return;
            }

            document.getElementById("inputLogradouro").value = dados.logradouro;
            document.getElementById("inputBairro").value     = dados.bairro;
            document.getElementById("inputCidade").value     = dados.localidade;
            document.getElementById("inputEstado").value     = dados.uf;
        } catch {
            mostrarAlerta(containerAlertaEndereco, "Erro ao consultar CEP.", "danger");
        }
    });

    // ── Salvar endereço ────────────────────────────────────────────────────
    document.getElementById("formEndereco").addEventListener("submit", async function (e) {
        e.preventDefault();

        const cep        = document.getElementById("inputCep").value.trim();
        const logradouro = document.getElementById("inputLogradouro").value.trim();
        const bairro     = document.getElementById("inputBairro").value.trim();
        const cidade     = document.getElementById("inputCidade").value.trim();
        const estado     = document.getElementById("inputEstado").value.trim();

        if (!cep || !logradouro) {
            mostrarAlerta(containerAlertaEndereco, "Informe um CEP válido.", "warning");
            return;
        }

        const formData = new FormData();
        formData.append("id_usuario", id_usuario);
        formData.append("cep",        cep);
        formData.append("logradouro", logradouro);
        formData.append("bairro",     bairro);
        formData.append("cidade",     cidade);
        formData.append("estado",     estado);

        try {
            const resp  = await fetch("../../backend/api/me/prestador.php", { method: "POST", body: formData });
            const dados = await resp.json();
            if (dados.sucesso) {
                mostrarAlerta(containerAlertaEndereco, dados.mensagem, "success");
            } else {
                mostrarAlerta(containerAlertaEndereco, dados.erro, "danger");
            }
        } catch {
            mostrarAlerta(containerAlertaEndereco, "Erro ao conectar com o servidor.", "danger");
        }
    });

    // ── Alterar senha ──────────────────────────────────────────────────────
    document.getElementById("formSenha").addEventListener("submit", async function (e) {
        e.preventDefault();

        const senha     = document.getElementById("inputSenhaNova").value.trim();
        const confirmar = document.getElementById("inputSenhaConfirmar").value.trim();

        if (!senha || !confirmar) {
            mostrarAlerta(containerAlertaSenha, "Preencha os dois campos.", "warning");
            return;
        }
        if (senha !== confirmar) {
            mostrarAlerta(containerAlertaSenha, "As senhas não coincidem.", "danger");
            return;
        }

        const formData = new FormData();
        formData.append("id_usuario", id_usuario);
        formData.append("senha", senha);

        try {
            const resp  = await fetch("../../backend/api/me/update.php", { method: "POST", body: formData });
            const dados = await resp.json();
            if (dados.sucesso) {
                mostrarAlerta(containerAlertaSenha, "Senha alterada com sucesso!", "success");
                document.getElementById("formSenha").reset();
            } else {
                mostrarAlerta(containerAlertaSenha, dados.erro, "danger");
            }
        } catch {
            mostrarAlerta(containerAlertaSenha, "Erro ao conectar com o servidor.", "danger");
        }
    });

    // ── Excluir conta ──────────────────────────────────────────────────────
    const modalExcluir = new bootstrap.Modal(document.getElementById("modalExcluir"));

    document.getElementById("btnExcluirConta").addEventListener("click", () => modalExcluir.show());

    document.getElementById("btnConfirmarExclusao").addEventListener("click", async function () {
        const formData = new FormData();
        formData.append("id_usuario", id_usuario);

        try {
            const resp  = await fetch("../../backend/api/me/delete.php", { method: "POST", body: formData });
            const dados = await resp.json();
            if (dados.sucesso) {
                localStorage.clear();
                window.location.href = "../index.html";
            } else {
                modalExcluir.hide();
                mostrarAlerta(containerAlerta, dados.erro, "danger");
            }
        } catch {
            modalExcluir.hide();
            mostrarAlerta(containerAlerta, "Erro ao conectar com o servidor.", "danger");
        }
    });
});
