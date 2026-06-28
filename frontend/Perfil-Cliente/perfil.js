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

    const containerAlerta       = document.getElementById("containerAlerta");
    const containerAlertaSenha  = document.getElementById("containerAlertaSenha");
    const containerAlertaLocais = document.getElementById("containerAlertaLocais");
    const containerAlertaModal  = document.getElementById("containerAlertaModal");

    // ── Carregar dados do perfil ───────────────────────────────────────────
    try {
        const resp  = await fetch(`../../backend/api/me/get.php?id_usuario=${id_usuario}`);
        const dados = await resp.json();

        if (dados.erro) { mostrarAlerta(containerAlerta, dados.erro, "danger"); return; }

        document.getElementById("inputEmail").value    = dados.email;
        document.getElementById("inputNome").value     = dados.nome;
        document.getElementById("inputTelefone").value = dados.telefone;
    } catch {
        mostrarAlerta(containerAlerta, "Erro ao carregar perfil.", "danger");
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

    // ── Locais ─────────────────────────────────────────────────────────────

    async function carregarLocais() {
        try {
            const resp  = await fetch(`../../backend/api/me/locais/list.php?id_usuario=${id_usuario}`);
            const dados = await resp.json();
            const lista = document.getElementById("listaLocais");

            if (dados.erro || !Array.isArray(dados) || dados.length === 0) {
                lista.innerHTML = '<p class="text-secondary small mb-0">Nenhum local cadastrado.</p>';
                return;
            }

            lista.innerHTML = dados.map(local => `
                <div class="d-flex justify-content-between align-items-start border rounded p-3 mb-2">
                    <div>
                        <strong>${local.nome}</strong>
                        <div class="text-secondary small">
                            ${local.logradouro}, ${local.numero}${local.complemento ? ` – ${local.complemento}` : ''}<br>
                            ${local.bairro} · ${local.cidade}/${local.estado} · CEP ${local.cep}
                        </div>
                    </div>
                    <button class="btn btn-outline-danger btn-sm ms-3 flex-shrink-0"
                            data-id="${local.id_local}">Remover</button>
                </div>
            `).join("");

            lista.querySelectorAll("[data-id]").forEach(btn => {
                btn.addEventListener("click", () => removerLocal(btn.dataset.id));
            });
        } catch {
            mostrarAlerta(containerAlertaLocais, "Erro ao carregar locais.", "danger");
        }
    }

    async function removerLocal(id_local) {
        const formData = new FormData();
        formData.append("id_local", id_local);

        try {
            const resp  = await fetch("../../backend/api/me/locais/delete.php", { method: "POST", body: formData });
            const dados = await resp.json();

            if (dados.sucesso) {
                carregarLocais();
            } else {
                mostrarAlerta(containerAlertaLocais, dados.erro, "danger");
            }
        } catch {
            mostrarAlerta(containerAlertaLocais, "Erro ao conectar com o servidor.", "danger");
        }
    }

    // CEP auto-fill via ViaCEP
    document.getElementById("localCep").addEventListener("blur", async function () {
        const cep = this.value.replace(/\D/g, "");
        if (cep.length !== 8) return;

        try {
            const resp  = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const dados = await resp.json();

            if (dados.erro) {
                mostrarAlerta(containerAlertaModal, "CEP não encontrado.", "warning");
                return;
            }

            document.getElementById("localLogradouro").value = dados.logradouro;
            document.getElementById("localBairro").value     = dados.bairro;
            document.getElementById("localCidade").value     = dados.localidade;
            document.getElementById("localEstado").value     = dados.uf;
            document.getElementById("localNumero").focus();
        } catch {
            mostrarAlerta(containerAlertaModal, "Erro ao consultar CEP.", "danger");
        }
    });

    // Salvar novo local
    document.getElementById("btnSalvarLocal").addEventListener("click", async function () {
        const nome        = document.getElementById("localNome").value.trim();
        const cep         = document.getElementById("localCep").value.trim();
        const numero      = document.getElementById("localNumero").value.trim();
        const logradouro  = document.getElementById("localLogradouro").value.trim();
        const bairro      = document.getElementById("localBairro").value.trim();
        const cidade      = document.getElementById("localCidade").value.trim();
        const estado      = document.getElementById("localEstado").value.trim();
        const complemento = document.getElementById("localComplemento").value.trim();

        if (!nome || !cep || !numero || !logradouro) {
            mostrarAlerta(containerAlertaModal, "Preencha nome, CEP e número.", "warning");
            return;
        }

        const formData = new FormData();
        formData.append("id_usuario",  id_usuario);
        formData.append("nome",        nome);
        formData.append("cep",         cep);
        formData.append("logradouro",  logradouro);
        formData.append("numero",      numero);
        formData.append("bairro",      bairro);
        formData.append("complemento", complemento);
        formData.append("cidade",      cidade);
        formData.append("estado",      estado);

        try {
            const resp  = await fetch("../../backend/api/me/locais/create.php", { method: "POST", body: formData });
            const dados = await resp.json();

            if (dados.sucesso) {
                bootstrap.Modal.getInstance(document.getElementById("modalAdicionarLocal")).hide();
                document.getElementById("formAdicionarLocal").reset();
                ["localLogradouro","localBairro","localCidade","localEstado"].forEach(id => {
                    document.getElementById(id).value = "";
                });
                containerAlertaModal.innerHTML = "";
                carregarLocais();
            } else {
                mostrarAlerta(containerAlertaModal, dados.erro, "danger");
            }
        } catch {
            mostrarAlerta(containerAlertaModal, "Erro ao conectar com o servidor.", "danger");
        }
    });

    carregarLocais();

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
