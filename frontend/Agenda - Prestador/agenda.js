document.addEventListener("DOMContentLoaded", async function () {
    const id_usuario = localStorage.getItem("id_usuario");

    function alerta(container, mensagem, tipo = "warning") {
        container.innerHTML =
            `<div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
                <strong>${tipo === "success" ? "Sucesso!" : "Atenção!"}</strong> ${mensagem}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
    }

    // Comentários de avaliação são texto livre enviado pelo usuário — sempre
    // escapar antes de inserir via innerHTML para evitar XSS armazenado.
    function escapeHtml(texto) {
        const div = document.createElement("div");
        div.textContent = texto ?? "";
        return div.innerHTML;
    }

    const containerAlerta    = document.getElementById("containerAlerta");
    const containerAlertaDisp = document.getElementById("containerAlertaDisp");

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

    function formatarEstrelas(nota) {
        return "★".repeat(Number(nota)) + "☆".repeat(5 - Number(nota));
    }

    let agendamentosMap = {}; // id_agendamento -> objeto completo, evita reencodar texto livre em atributos HTML

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

            agendamentosMap = Object.fromEntries(dados.map(ag => [ag.id_agendamento, ag]));

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
                        ${ag.data_hora_fim ? `<p class="card-text small text-secondary mb-1">Término: ${formatarData(ag.data_hora_fim)}</p>` : ""}
                        ${parseFloat(ag.valor) > 0 ? `<p class="card-text small fw-bold mb-0">Valor: R$ ${parseFloat(ag.valor).toFixed(2).replace(".", ",")}</p>` : ""}
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
            lista.querySelectorAll(".btn-avaliar").forEach(btn =>
                btn.addEventListener("click", () => abrirAvaliar(btn.dataset.id)));
            lista.querySelectorAll(".btn-ver-avaliacao").forEach(btn =>
                btn.addEventListener("click", () => abrirVerAvaliacao(agendamentosMap[btn.dataset.id], btn.dataset.quem)));
        } catch {
            alerta(containerAlerta, "Erro ao carregar agendamentos.", "danger");
        }
    }

    function botoesPrestador(ag) {
        const id = ag.id_agendamento;
        switch (ag.status) {
            case "aguardando_orcamento":
                return `<button class="btn btn-primary btn-sm w-100 btn-orcamento" data-id="${id}">Enviar Orçamento</button>
                        <button class="btn btn-danger btn-sm w-100 btn-cancelar" data-id="${id}">Cancelar</button>`;
            case "orcamento_realizado":
                return `<button class="btn btn-danger btn-sm w-100 btn-cancelar" data-id="${id}">Cancelar</button>`;
            case "confirmado":
                return `<button class="btn btn-success btn-sm w-100 btn-iniciar" data-id="${id}">Iniciar Serviço</button>
                        <button class="btn btn-danger btn-sm w-100 btn-cancelar" data-id="${id}">Cancelar</button>`;
            case "em_andamento":
                return `<button class="btn btn-primary btn-sm w-100 btn-concluir" data-id="${id}">Concluir Serviço</button>`;
            case "concluido": {
                // "Minha avaliação" = a que EU (prestador) dei ao cliente.
                // "Avaliação do cliente" = a que o CLIENTE me deu. São independentes.
                const minha = ag.prestador_nota
                    ? `<button class="btn btn-outline-secondary btn-sm w-100 btn-ver-avaliacao" data-id="${id}" data-quem="prestador">Ver minha avaliação</button>`
                    : `<button class="btn btn-outline-warning btn-sm w-100 btn-avaliar" data-id="${id}">Avaliar Cliente</button>`;
                const doCliente = ag.cliente_nota
                    ? `<button class="btn btn-outline-secondary btn-sm w-100 btn-ver-avaliacao" data-id="${id}" data-quem="cliente">Ver avaliação do cliente</button>`
                    : "";
                return minha + doCliente;
            }
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

    // ── Modal Avaliar Cliente ──────────────────────────────────────────────
    const modalAvaliar = new bootstrap.Modal(document.getElementById("modalAvaliar"));

    function abrirAvaliar(id_agendamento) {
        document.getElementById("avaliarIdAgendamento").value = id_agendamento;
        document.getElementById("avaliarNota").value = "";
        document.getElementById("avaliarComentario").value = "";
        document.getElementById("containerAlertaAvaliar").innerHTML = "";
        document.querySelectorAll("#modalAvaliar .estrela").forEach(b => b.classList.remove("active", "btn-warning"));
        modalAvaliar.show();
    }

    document.querySelectorAll("#modalAvaliar .estrela").forEach(btn => {
        btn.addEventListener("click", function () {
            const nota = this.dataset.nota;
            document.getElementById("avaliarNota").value = nota;
            document.querySelectorAll("#modalAvaliar .estrela").forEach(b => {
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
            alerta(containerAlertaAvaliar, "Selecione uma nota.", "warning");
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
            else alerta(containerAlertaAvaliar, dados.erro, "danger");
        } catch { alerta(containerAlertaAvaliar, "Erro ao conectar com o servidor.", "danger"); }
    });

    // ── Modal Ver Avaliação (somente leitura) ───────────────────────────────
    const modalVerAvaliacao = new bootstrap.Modal(document.getElementById("modalVerAvaliacao"));

    function abrirVerAvaliacao(ag, quem) {
        const nota       = quem === "cliente" ? ag.cliente_nota       : ag.prestador_nota;
        const comentario = quem === "cliente" ? ag.cliente_comentario : ag.prestador_comentario;
        document.getElementById("modalVerAvaliacaoTitulo").textContent =
            quem === "cliente" ? "Avaliação do cliente" : "Sua avaliação";
        document.getElementById("modalVerAvaliacaoBody").innerHTML = `
            <p class="text-warning fs-5 mb-2">${formatarEstrelas(nota)}</p>
            ${comentario ? `<p class="mb-0">"${escapeHtml(comentario)}"</p>` : '<p class="text-secondary mb-0">Sem comentário.</p>'}`;
        modalVerAvaliacao.show();
    }

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
