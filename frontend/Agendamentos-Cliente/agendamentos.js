document.addEventListener("DOMContentLoaded", async function () {
    const id_usuario = localStorage.getItem("id_usuario");

    function alerta(mensagem, tipo = "warning") {
        document.getElementById("containerAlerta").innerHTML =
            `<div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
                <strong>${tipo === "success" ? "Sucesso!" : "Atenção!"}</strong> ${mensagem}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
    }

    const STATUS_LABEL = {
        aguardando_orcamento: "Aguardando Orçamento",
        orcamento_realizado: "Orçamento Realizado",
        confirmado:           "Confirmado",
        em_andamento:         "Em Andamento",
        concluido:            "Concluído",
        cancelado:            "Cancelado"
    };
    const STATUS_COR = {
        aguardando_orcamento: "secondary",
        orcamento_realizado: "info text-dark",
        confirmado:           "success-subtle text-success-emphasis border border-success-subtle",
        em_andamento:         "warning text-dark",
        concluido:            "success",
        cancelado:            "danger"
    };

    function formatarData(dt) {
        if (!dt) return "—";
        return new Date(dt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
    }

    function formatarValor(valor, tipo) {
        if (!valor) return "";
        const labels = { hora: "/h", diaria: "/dia", servico: "" };
        return `R$ ${parseFloat(valor).toFixed(2).replace(".", ",")}${labels[tipo] ?? ""}`;
    }

    // ── Carregar agendamentos ──────────────────────────────────────────────
    async function carregar() {
        const status = document.getElementById("filtroStatus").value;
        const lista  = document.getElementById("listaAgendamentos");
        lista.innerHTML = '<p class="text-secondary">Carregando...</p>';

        const params = new URLSearchParams({ id_usuario, tipo: "cliente" });
        if (status) params.append("status", status);

        try {
            const resp  = await fetch(`../../backend/api/agendamentos/list.php?${params}`);
            const dados = await resp.json();

            if (dados.erro || !Array.isArray(dados) || dados.length === 0) {
                lista.innerHTML = '<p class="text-secondary">Nenhum agendamento encontrado.</p>';
                return;
            }

            lista.innerHTML = dados.map(ag => {
                const acoes = botoesCliente(ag);
                return `
                <div class="col-12 col-sm-6 col-lg-4">
                  <div class="card h-100 shadow-sm${ag.status === "cancelado" ? " opacity-75" : ""}">
                    <div class="card-body d-flex flex-column justify-content-between">
                      <div>
                        <div class="d-flex justify-content-between align-items-start mb-2">
                          <h5 class="card-title mb-0">${ag.nome_prestador}</h5>
                          <span class="badge bg-${STATUS_COR[ag.status] ?? "secondary"}">${STATUS_LABEL[ag.status] ?? ag.status}</span>
                        </div>
                        <h6 class="card-subtitle mb-2 text-body-secondary">${ag.servico}</h6>
                        <p class="card-text small text-secondary mb-1">Local: ${ag.local_nome}</p>
                        ${ag.data_hora_inicio ? `<p class="card-text small text-secondary mb-1">Início: ${formatarData(ag.data_hora_inicio)}</p>` : ""}
                        ${ag.valor ? `<p class="card-text small fw-bold mb-0">Valor: ${formatarValor(ag.valor, ag.tipo_cobranca)}</p>` : ""}
                      </div>
                      <div class="d-flex flex-wrap gap-2 mt-3">${acoes}</div>
                    </div>
                  </div>
                </div>`;
            }).join("");

            // Botões cancelar
            lista.querySelectorAll(".btn-cancelar").forEach(btn =>
                btn.addEventListener("click", () => cancelar(btn.dataset.id)));

            // Botões orçamento
            lista.querySelectorAll(".btn-orcamento").forEach(btn =>
                btn.addEventListener("click", () => abrirOrcamento(
                    btn.dataset.id, btn.dataset.valor, btn.dataset.tipo, btn.dataset.prestador)));

            // Botões avaliar
            lista.querySelectorAll(".btn-avaliar").forEach(btn =>
                btn.addEventListener("click", () => abrirAvaliar(btn.dataset.id)));
        } catch {
            alerta("Erro ao carregar agendamentos.", "danger");
        }
    }

    function botoesCliente(ag) {
        const { id_agendamento, status, valor, tipo_cobranca, nome_prestador } = ag;
        switch (status) {
            case "aguardando_orcamento":
                return `<button class="btn btn-danger btn-sm w-100 btn-cancelar" data-id="${id_agendamento}">Cancelar</button>`;
            case "orcamento_realizado":
                return `<button class="btn btn-outline-primary btn-sm w-100 btn-orcamento"
                            data-id="${id_agendamento}" data-valor="${valor}" data-tipo="${tipo_cobranca}"
                            data-prestador="${nome_prestador}">Ver Orçamento</button>`;
            case "confirmado":
                return `<button class="btn btn-danger btn-sm w-100 btn-cancelar" data-id="${id_agendamento}">Cancelar</button>`;
            case "concluido":
                return `<button class="btn btn-outline-warning btn-sm w-100 btn-avaliar" data-id="${id_agendamento}">Avaliar Serviço</button>`;
            default:
                return "";
        }
    }

    // ── Cancelar ───────────────────────────────────────────────────────────
    async function cancelar(id_agendamento) {
        const fd = new FormData();
        fd.append("id_agendamento", id_agendamento);
        fd.append("id_usuario", id_usuario);
        try {
            const dados = await (await fetch("../../backend/api/agendamentos/cancelar.php", { method: "POST", body: fd })).json();
            if (dados.sucesso) carregar();
            else alerta(dados.erro, "danger");
        } catch { alerta("Erro ao conectar com o servidor.", "danger"); }
    }

    // ── Modal Orçamento ────────────────────────────────────────────────────
    const modalOrcamento = new bootstrap.Modal(document.getElementById("modalOrcamento"));
    let idAgendamentoAtivo = null;

    function abrirOrcamento(id, valor, tipo, prestador) {
        idAgendamentoAtivo = id;
        const labels = { hora: "por hora", diaria: "por diária", servico: "por serviço" };
        document.getElementById("modalOrcamentoBody").innerHTML = `
            <p><strong>Prestador:</strong> ${prestador}</p>
            <p><strong>Valor proposto:</strong> ${formatarValor(valor, tipo)} (${labels[tipo] ?? tipo})</p>
            <p>Deseja aceitar este orçamento?</p>`;
        modalOrcamento.show();
    }

    document.getElementById("btnAceitarOrcamento").addEventListener("click", async function () {
        const fd = new FormData();
        fd.append("id_agendamento", idAgendamentoAtivo);
        fd.append("id_usuario", id_usuario);
        try {
            const dados = await (await fetch("../../backend/api/agendamentos/confirmar.php", { method: "POST", body: fd })).json();
            modalOrcamento.hide();
            if (dados.sucesso) carregar();
            else alerta(dados.erro, "danger");
        } catch { modalOrcamento.hide(); alerta("Erro ao conectar com o servidor.", "danger"); }
    });

    document.getElementById("btnRecusarOrcamento").addEventListener("click", async function () {
        const fd = new FormData();
        fd.append("id_agendamento", idAgendamentoAtivo);
        fd.append("id_usuario", id_usuario);
        try {
            const dados = await (await fetch("../../backend/api/agendamentos/cancelar.php", { method: "POST", body: fd })).json();
            modalOrcamento.hide();
            if (dados.sucesso) carregar();
            else alerta(dados.erro, "danger");
        } catch { modalOrcamento.hide(); alerta("Erro ao conectar com o servidor.", "danger"); }
    });

    // ── Modal Avaliar ──────────────────────────────────────────────────────
    const modalAvaliar = new bootstrap.Modal(document.getElementById("modalAvaliar"));

    function abrirAvaliar(id_agendamento) {
        document.getElementById("avaliarIdAgendamento").value = id_agendamento;
        document.getElementById("avaliarNota").value = "";
        document.getElementById("avaliarComentario").value = "";
        document.getElementById("containerAlertaAvaliar").innerHTML = "";
        document.querySelectorAll(".estrela").forEach(b => b.classList.remove("active", "btn-warning"));
        modalAvaliar.show();
    }

    document.querySelectorAll(".estrela").forEach(btn => {
        btn.addEventListener("click", function () {
            const nota = this.dataset.nota;
            document.getElementById("avaliarNota").value = nota;
            document.querySelectorAll(".estrela").forEach(b => {
                b.classList.toggle("btn-warning", parseInt(b.dataset.nota) <= parseInt(nota));
                b.classList.toggle("btn-outline-warning", parseInt(b.dataset.nota) > parseInt(nota));
            });
        });
    });

    document.getElementById("btnEnviarAvaliacao").addEventListener("click", async function () {
        const id_agendamento = document.getElementById("avaliarIdAgendamento").value;
        const nota           = document.getElementById("avaliarNota").value;
        const comentario     = document.getElementById("avaliarComentario").value.trim();
        const containerAlertaAvaliar = document.getElementById("containerAlertaAvaliar");

        if (!nota) {
            containerAlertaAvaliar.innerHTML = `<div class="alert alert-warning">Selecione uma nota.</div>`;
            return;
        }

        const fd = new FormData();
        fd.append("id_agendamento", id_agendamento);
        fd.append("id_usuario",     id_usuario);
        fd.append("nota",           nota);
        fd.append("comentario",     comentario);

        try {
            const dados = await (await fetch("../../backend/api/agendamentos/avaliacoes/create.php", { method: "POST", body: fd })).json();
            if (dados.sucesso) { modalAvaliar.hide(); carregar(); }
            else containerAlertaAvaliar.innerHTML = `<div class="alert alert-danger">${dados.erro}</div>`;
        } catch { containerAlertaAvaliar.innerHTML = `<div class="alert alert-danger">Erro ao conectar com o servidor.</div>`; }
    });

    document.getElementById("filtroStatus").addEventListener("change", carregar);
    carregar();
});
