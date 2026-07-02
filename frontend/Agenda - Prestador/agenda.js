document.addEventListener("DOMContentLoaded", async function () {
    const id_usuario = localStorage.getItem("id_usuario");

    function alerta(container, mensagem, tipo = "warning") {
        container.innerHTML =
            `<div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
                <strong>${tipo === "success" ? "Sucesso!" : "Atenção!"}</strong> ${mensagem}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
    }

    const containerAlerta    = document.getElementById("containerAlerta");
    const containerAlertaDisp = document.getElementById("containerAlertaDisp");

    const STATUS_LABEL = {
        aguardando_orcamento: "Aguardando Orçamento",
        orcamento_enviado:    "Orçamento Enviado",
        confirmado:           "Confirmado",
        em_andamento:         "Em Andamento",
        concluido:            "Concluído",
        cancelado:            "Cancelado"
    };
    const STATUS_COR = {
        aguardando_orcamento: "secondary",
        orcamento_enviado:    "info text-dark",
        confirmado:           "success-subtle text-success-emphasis border border-success-subtle",
        em_andamento:         "warning text-dark",
        concluido:            "success",
        cancelado:            "danger"
    };

    function formatarData(dt) {
        if (!dt) return "—";
        return new Date(dt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
    }

    // ── Carregar agendamentos ──────────────────────────────────────────────
    async function carregar() {
        const status = document.getElementById("filtroStatus").value;
        const lista  = document.getElementById("listaAgendamentos");
        lista.innerHTML = '<p class="text-secondary">Carregando...</p>';

        const params = new URLSearchParams({ id_usuario, tipo: "prestador" });
        if (status) params.append("status", status);

        try {
            const resp  = await fetch(`../../backend/api/agendamentos/list.php?${params}`);
            const dados = await resp.json();

            if (dados.erro || !Array.isArray(dados) || dados.length === 0) {
                lista.innerHTML = '<p class="text-secondary">Nenhum agendamento encontrado.</p>';
                return;
            }

            lista.innerHTML = dados.map(ag => {
                const acoes = botoesPrestador(ag);
                return `
                <div class="col-12 col-sm-6 col-lg-4">
                  <div class="card h-100 shadow-sm${ag.status === "cancelado" ? " opacity-75" : ""}">
                    <div class="card-body d-flex flex-column justify-content-between">
                      <div>
                        <div class="d-flex justify-content-between align-items-start mb-2">
                          <h5 class="card-title mb-0">${ag.nome_cliente}</h5>
                          <span class="badge bg-${STATUS_COR[ag.status] ?? "secondary"}">${STATUS_LABEL[ag.status] ?? ag.status}</span>
                        </div>
                        <h6 class="card-subtitle mb-2 text-body-secondary">${ag.servico}</h6>
                        <p class="card-text small text-secondary mb-1">Local: ${ag.local_nome}</p>
                        ${ag.data_hora_inicio ? `<p class="card-text small text-secondary mb-1">Início: ${formatarData(ag.data_hora_inicio)}</p>` : ""}
                        ${ag.valor ? `<p class="card-text small fw-bold mb-0">Valor: R$ ${parseFloat(ag.valor).toFixed(2).replace(".", ",")}</p>` : ""}
                      </div>
                      <div class="d-flex flex-wrap gap-2 mt-3">${acoes}</div>
                    </div>
                  </div>
                </div>`;
            }).join("");

            lista.querySelectorAll(".btn-orcamento").forEach(btn =>
                btn.addEventListener("click", () => abrirOrcamento(btn.dataset.id)));
            lista.querySelectorAll(".btn-iniciar").forEach(btn =>
                btn.addEventListener("click", () => acao("iniciar", btn.dataset.id)));
            lista.querySelectorAll(".btn-concluir").forEach(btn =>
                btn.addEventListener("click", () => acao("concluir", btn.dataset.id)));
            lista.querySelectorAll(".btn-cancelar").forEach(btn =>
                btn.addEventListener("click", () => acao("cancelar", btn.dataset.id)));
        } catch {
            alerta(containerAlerta, "Erro ao carregar agendamentos.", "danger");
        }
    }

    function botoesPrestador(ag) {
        const id = ag.id_agendamento;
        switch (ag.status) {
            case "aguardando_orcamento":
                return `<button class="btn btn-primary btn-sm w-100 btn-orcamento" data-id="${id}">Enviar Orçamento</button>
                        <button class="btn btn-danger btn-sm btn-cancelar" data-id="${id}">Cancelar</button>`;
            case "orcamento_enviado":
                return `<button class="btn btn-danger btn-sm w-100 btn-cancelar" data-id="${id}">Cancelar</button>`;
            case "confirmado":
                return `<button class="btn btn-success btn-sm w-100 btn-iniciar" data-id="${id}">Iniciar Serviço</button>
                        <button class="btn btn-danger btn-sm btn-cancelar" data-id="${id}">Cancelar</button>`;
            case "em_andamento":
                return `<button class="btn btn-primary btn-sm w-100 btn-concluir" data-id="${id}">Concluir Serviço</button>`;
            default:
                return "";
        }
    }

    async function acao(tipo, id_agendamento) {
        const fd = new FormData();
        fd.append("id_agendamento", id_agendamento);
        fd.append("id_usuario", id_usuario);
        try {
            const dados = await (await fetch(`../../backend/api/agendamentos/${tipo}.php`, { method: "POST", body: fd })).json();
            if (dados.sucesso) carregar();
            else alerta(containerAlerta, dados.erro, "danger");
        } catch { alerta(containerAlerta, "Erro ao conectar com o servidor.", "danger"); }
    }

    // ── Modal Orçamento ────────────────────────────────────────────────────
    const modalOrcamento = new bootstrap.Modal(document.getElementById("modalOrcamento"));
    const containerAlertaModal = document.getElementById("containerAlertaModal");

    function abrirOrcamento(id_agendamento) {
        document.getElementById("orcamentoIdAgendamento").value = id_agendamento;
        document.getElementById("orcamentoValor").value = "";
        containerAlertaModal.innerHTML = "";
        modalOrcamento.show();
    }

    document.getElementById("btnEnviarOrcamento").addEventListener("click", async function () {
        const id_agendamento = document.getElementById("orcamentoIdAgendamento").value;
        const valor          = document.getElementById("orcamentoValor").value;
        const tipo_cobranca  = document.getElementById("orcamentoTipo").value;

        if (!valor) {
            alerta(containerAlertaModal, "Informe o valor do orçamento.", "warning");
            return;
        }

        const fd = new FormData();
        fd.append("id_agendamento", id_agendamento);
        fd.append("id_usuario",     id_usuario);
        fd.append("valor",          valor);
        fd.append("tipo_cobranca",  tipo_cobranca);

        try {
            const dados = await (await fetch("../../backend/api/agendamentos/orcamento.php", { method: "POST", body: fd })).json();
            if (dados.sucesso) { modalOrcamento.hide(); carregar(); }
            else alerta(containerAlertaModal, dados.erro, "danger");
        } catch { alerta(containerAlertaModal, "Erro ao conectar com o servidor.", "danger"); }
    });

    document.getElementById("filtroStatus").addEventListener("change", carregar);

    // ── Disponibilidade ────────────────────────────────────────────────────
    const DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

    async function carregarDisponibilidade() {
        const tabela = document.getElementById("tabelaDisponibilidade");
        let dispAtual = {};

        try {
            const resp  = await fetch(`../../backend/api/me/disponibilidade/get.php?id_usuario=${id_usuario}`);
            const dados = await resp.json();
            if (Array.isArray(dados)) {
                dados.forEach(d => { dispAtual[d.dia_semana] = d; });
            }
        } catch {}

        tabela.innerHTML = DIAS.map((dia, i) => {
            const d = dispAtual[i] ?? {};
            return `
            <div class="d-flex align-items-center gap-3 mb-2 flex-wrap">
              <div style="width:90px">
                <div class="form-check">
                  <input class="form-check-input dia-check" type="checkbox" id="dia${i}"
                         data-dia="${i}" ${d.hora_inicio ? "checked" : ""}>
                  <label class="form-check-label" for="dia${i}">${dia}</label>
                </div>
              </div>
              <div class="d-flex align-items-center gap-2 dia-horario" id="horario${i}" ${d.hora_inicio ? "" : "style='display:none!important'"}>
                <input type="time" class="form-control form-control-sm hora-inicio" data-dia="${i}"
                       style="width:110px" value="${d.hora_inicio ?? "08:00"}">
                <span>até</span>
                <input type="time" class="form-control form-control-sm hora-fim" data-dia="${i}"
                       style="width:110px" value="${d.hora_fim ?? "18:00"}">
              </div>
            </div>`;
        }).join("");

        tabela.querySelectorAll(".dia-check").forEach(chk => {
            chk.addEventListener("change", function () {
                const horario = document.getElementById(`horario${this.dataset.dia}`);
                horario.style.display = this.checked ? "" : "none";
            });
        });
    }

    document.getElementById("btnSalvarDisp").addEventListener("click", async function () {
        const disponibilidades = [];
        document.querySelectorAll(".dia-check:checked").forEach(chk => {
            const dia = chk.dataset.dia;
            const ini = document.querySelector(`.hora-inicio[data-dia="${dia}"]`).value;
            const fim = document.querySelector(`.hora-fim[data-dia="${dia}"]`).value;
            if (ini && fim) disponibilidades.push({ dia_semana: parseInt(dia), hora_inicio: ini, hora_fim: fim });
        });

        const fd = new FormData();
        fd.append("id_usuario",        id_usuario);
        fd.append("disponibilidades",  JSON.stringify(disponibilidades));

        try {
            const dados = await (await fetch("../../backend/api/me/disponibilidade/update.php", { method: "POST", body: fd })).json();
            if (dados.sucesso) alerta(containerAlertaDisp, dados.mensagem, "success");
            else alerta(containerAlertaDisp, dados.erro, "danger");
        } catch { alerta(containerAlertaDisp, "Erro ao conectar com o servidor.", "danger"); }
    });

    carregar();
    carregarDisponibilidade();
});
