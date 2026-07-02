document.addEventListener("DOMContentLoaded", async function () {
    const id_usuario = localStorage.getItem("id_usuario");

    function alerta(container, mensagem, tipo = "warning") {
        container.innerHTML = `<div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
            <strong>${tipo === "success" ? "Sucesso!" : "Atenção!"}</strong> ${mensagem}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
    }

    const containerAlerta      = document.getElementById("containerAlerta");
    const containerAlertaModal = document.getElementById("containerAlertaModal");
    const containerAlertaEditar = document.getElementById("containerAlertaEditar");
    const labels = { hora: "Por hora", diaria: "Por diária", servico: "Por serviço" };

    // ── Carregar serviços do prestador ─────────────────────────────────────
    async function carregarServicos() {
        const lista = document.getElementById("listaServicos");
        try {
            const resp  = await fetch(`../../backend/api/me/servicos/list.php?id_usuario=${id_usuario}`);
            const dados = await resp.json();

            if (dados.erro || !Array.isArray(dados) || dados.length === 0) {
                lista.innerHTML = '<p class="text-secondary">Nenhum serviço cadastrado. Adicione serviços que você oferece.</p>';
                return;
            }

            lista.innerHTML = dados.map(s => `
                <div class="col-12 col-sm-6 col-lg-4">
                  <div class="card h-100 shadow-sm">
                    <div class="card-body d-flex flex-column justify-content-between">
                      <div>
                        <h5 class="card-title">${s.titulo}</h5>
                        <p class="card-text text-secondary small">${s.descricao ?? ""}</p>
                        <p class="mb-1"><span class="badge bg-secondary">${labels[s.tipo_cobranca] ?? s.tipo_cobranca}</span></p>
                        <p class="fw-bold">R$ ${parseFloat(s.preco_base).toFixed(2).replace(".", ",")}</p>
                      </div>
                      <div class="d-flex gap-2 mt-3">
                        <button class="btn btn-outline-primary btn-sm w-100 btn-editar"
                                data-id="${s.id_servico}" data-tipo="${s.tipo_cobranca}" data-preco="${s.preco_base}">Editar</button>
                        <button class="btn btn-outline-danger btn-sm w-100 btn-remover"
                                data-id="${s.id_servico}">Remover</button>
                      </div>
                    </div>
                  </div>
                </div>`).join("");

            lista.querySelectorAll(".btn-remover").forEach(btn =>
                btn.addEventListener("click", () => removerServico(btn.dataset.id)));

            lista.querySelectorAll(".btn-editar").forEach(btn =>
                btn.addEventListener("click", () => abrirEditar(btn.dataset.id, btn.dataset.tipo, btn.dataset.preco)));
        } catch {
            alerta(containerAlerta, "Erro ao carregar serviços.", "danger");
        }
    }

    async function removerServico(id_servico) {
        const fd = new FormData();
        fd.append("id_usuario", id_usuario);
        fd.append("id_servico", id_servico);
        try {
            const resp  = await fetch("../../backend/api/me/servicos/delete.php", { method: "POST", body: fd });
            const dados = await resp.json();
            if (dados.sucesso) carregarServicos();
            else alerta(containerAlerta, dados.erro, "danger");
        } catch { alerta(containerAlerta, "Erro ao conectar com o servidor.", "danger"); }
    }

    // ── Modal Adicionar ────────────────────────────────────────────────────
    document.getElementById("modalAdicionarServico").addEventListener("show.bs.modal", async function () {
        const select = document.getElementById("servicoSelect");
        select.innerHTML = '<option value="" disabled selected>Carregando...</option>';
        containerAlertaModal.innerHTML = "";

        try {
            const prestador = await (await fetch(`../../backend/api/me/prestador_get.php?id_usuario=${id_usuario}`)).json();
            const servicos  = await (await fetch(`../../backend/api/catalogo/categorias_servicos.php?id_categoria=${prestador.id_categoria}`)).json();

            if (servicos.erro || !Array.isArray(servicos)) {
                select.innerHTML = '<option value="" disabled selected>Nenhum serviço disponível</option>';
                return;
            }
            select.innerHTML = '<option value="" disabled selected>Selecione um serviço</option>' +
                servicos.map(s => `<option value="${s.id_servico}">${s.titulo}</option>`).join("");
        } catch { alerta(containerAlertaModal, "Erro ao carregar serviços.", "danger"); }
    });

    document.getElementById("btnSalvarServico").addEventListener("click", async function () {
        const id_servico    = document.getElementById("servicoSelect").value;
        const tipo_cobranca = document.getElementById("servicoTipoCobranca").value;
        const preco_base    = document.getElementById("servicoPreco").value;

        if (!id_servico || !preco_base) {
            alerta(containerAlertaModal, "Selecione um serviço e informe o preço.", "warning");
            return;
        }

        const fd = new FormData();
        fd.append("id_usuario", id_usuario);
        fd.append("id_servico", id_servico);
        fd.append("tipo_cobranca", tipo_cobranca);
        fd.append("preco_base", preco_base);

        try {
            const dados = await (await fetch("../../backend/api/me/servicos/create.php", { method: "POST", body: fd })).json();
            if (dados.sucesso) {
                bootstrap.Modal.getInstance(document.getElementById("modalAdicionarServico")).hide();
                document.getElementById("servicoSelect").value = "";
                document.getElementById("servicoPreco").value  = "";
                containerAlertaModal.innerHTML = "";
                carregarServicos();
            } else { alerta(containerAlertaModal, dados.erro, "danger"); }
        } catch { alerta(containerAlertaModal, "Erro ao conectar com o servidor.", "danger"); }
    });

    // ── Modal Editar ───────────────────────────────────────────────────────
    const modalEditar = new bootstrap.Modal(document.getElementById("modalEditarServico"));

    function abrirEditar(id_servico, tipo_cobranca, preco_base) {
        document.getElementById("editarIdServico").value      = id_servico;
        document.getElementById("editarTipoCobranca").value   = tipo_cobranca;
        document.getElementById("editarPreco").value          = preco_base;
        containerAlertaEditar.innerHTML = "";
        modalEditar.show();
    }

    document.getElementById("btnSalvarEdicao").addEventListener("click", async function () {
        const id_servico    = document.getElementById("editarIdServico").value;
        const tipo_cobranca = document.getElementById("editarTipoCobranca").value;
        const preco_base    = document.getElementById("editarPreco").value;

        if (!preco_base) {
            alerta(containerAlertaEditar, "Informe o preço.", "warning");
            return;
        }

        const fd = new FormData();
        fd.append("id_usuario",    id_usuario);
        fd.append("id_servico",    id_servico);
        fd.append("tipo_cobranca", tipo_cobranca);
        fd.append("preco_base",    preco_base);

        try {
            const dados = await (await fetch("../../backend/api/me/servicos/update.php", { method: "POST", body: fd })).json();
            if (dados.sucesso) { modalEditar.hide(); carregarServicos(); }
            else alerta(containerAlertaEditar, dados.erro, "danger");
        } catch { alerta(containerAlertaEditar, "Erro ao conectar com o servidor.", "danger"); }
    });

    carregarServicos();
});
