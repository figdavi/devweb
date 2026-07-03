document.addEventListener("DOMContentLoaded", async function () {
    const id_usuario   = localStorage.getItem("id_usuario");
    const tipo_usuario = localStorage.getItem("tipo_usuario");

    const id_prestador = new URLSearchParams(window.location.search).get("id");
    if (!id_prestador) {
        window.location.href = tipo_usuario === "prestador"
            ? "../Agenda - Prestador/agenda.html"
            : "../Busca-Servicos/servicos.html";
        return;
    }

    document.getElementById("navMenu").innerHTML = tipo_usuario === "prestador"
        ? `<a href="../Agenda - Prestador/agenda.html" class="info">Minha Agenda</a>
           <a href="../MeusServicos - Prestador/MeusServiços.html" class="info">Meus Serviços</a>
           <a href="../Perfil-Prestador/perfil.html" class="info">Perfil</a>`
        : `<a href="../Busca-Servicos/servicos.html" class="info">Buscar Serviços</a>
           <a href="../Agendamentos-Cliente/agendamentos.html" class="info">Meus Agendamentos</a>
           <a href="../Perfil-Cliente/perfil.html" class="info">Perfil</a>`;

    const containerAlerta = document.getElementById("containerAlerta");

    function alerta(container, mensagem, tipo = "danger") {
        container.innerHTML =
            `<div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
                ${mensagem}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
             </div>`;
    }

    const LABELS = { hora: "/h", diaria: "/dia", servico: "" };

    // Comentários de avaliação são texto livre enviado pelo usuário — sempre
    // escapar antes de inserir via innerHTML para evitar XSS armazenado.
    function escapeHtml(texto) {
        const div = document.createElement("div");
        div.textContent = texto ?? "";
        return div.innerHTML;
    }

    // ── Carregar perfil ────────────────────────────────────────────────────
    let dados;
    try {
        const resp  = await fetch(`../../backend/api/prestadores/get.php?id_usuario=${id_prestador}`);
        const texto = await resp.text();
        try { dados = JSON.parse(texto); } catch {
            console.error("Resposta não-JSON do servidor:", texto);
            alerta(containerAlerta, "Erro inesperado no servidor. Tente novamente.");
            return;
        }
        if (dados.erro) {
            alerta(containerAlerta, "Prestador não encontrado.");
            return;
        }
    } catch {
        alerta(containerAlerta, "Não foi possível conectar ao servidor.");
        return;
    }

    document.getElementById("perfilNome").textContent        = dados.nome;
    document.getElementById("perfilCategoria").textContent   = dados.categoria;
    document.getElementById("perfilLocalizacao").textContent = `${dados.cidade}, ${dados.estado}`;
    document.getElementById("perfilDescricao").textContent   = dados.descricao_profissional || "Nenhuma descrição fornecida.";

    // ── Serviços ───────────────────────────────────────────────────────────
    const listaServicos = document.getElementById("listaServicos");
    if (!dados.servicos?.length) {
        listaServicos.innerHTML = '<p class="text-secondary small mb-0">Nenhum serviço cadastrado.</p>';
    } else {
        listaServicos.innerHTML = dados.servicos.map(s => `
            <div class="border rounded p-3 mb-2">
              <div class="d-flex justify-content-between align-items-start">
                <strong>${s.titulo}</strong>
                <span class="badge bg-success ms-2 flex-shrink-0">
                  R$ ${parseFloat(s.preco_base).toFixed(2).replace(".", ",")}${LABELS[s.tipo_cobranca] ?? ""}
                </span>
              </div>
              ${s.descricao ? `<p class="text-secondary small mb-0 mt-1">${s.descricao}</p>` : ""}
            </div>`).join("");
    }

    // ── Avaliações ─────────────────────────────────────────────────────────
    const listaAvaliacoes = document.getElementById("listaAvaliacoes");
    if (!dados.avaliacoes?.length) {
        listaAvaliacoes.innerHTML = '<p class="text-secondary small mb-0">Nenhuma avaliação ainda.</p>';
    } else {
        const media = (dados.avaliacoes.reduce((s, a) => s + Number(a.cliente_nota), 0) / dados.avaliacoes.length).toFixed(1);
        listaAvaliacoes.innerHTML =
            `<p class="fw-bold mb-3">★ ${media} · ${dados.avaliacoes.length} avaliação(ões)</p>` +
            dados.avaliacoes.map(a => `
                <div class="border-bottom pb-3 mb-3">
                  <div class="d-flex justify-content-between">
                    <strong class="small">${a.nome_cliente}</strong>
                    <span class="text-warning small">${"★".repeat(Number(a.cliente_nota))}${"☆".repeat(5 - Number(a.cliente_nota))}</span>
                  </div>
                  ${a.cliente_comentario ? `<p class="text-secondary small mb-0">"${escapeHtml(a.cliente_comentario)}"</p>` : ""}
                </div>`).join("");
    }

    // ── Agendamento (somente clientes) ─────────────────────────────────────
    if (tipo_usuario !== "cliente") return;

    document.getElementById("btnAgendar").classList.remove("d-none");

    // Populate service select; show base price as reference only (final price is
    // set by the prestador later, via the orçamento step)
    const selectServico  = document.getElementById("agendarServico");
    const precoBaseRow   = document.getElementById("agendarPrecoBase");
    const precoBaseTexto = document.getElementById("agendarPrecoBaseTexto");
    const servicosMap    = Object.fromEntries((dados.servicos || []).map(s => [s.id_servico, s]));

    selectServico.innerHTML = '<option value="" disabled selected>Selecione um serviço</option>' +
        (dados.servicos || []).map(s =>
            `<option value="${s.id_servico}">${s.titulo}</option>`
        ).join("");

    selectServico.addEventListener("change", function () {
        const s = servicosMap[this.value];
        if (!s) return;
        precoBaseTexto.textContent = `R$ ${parseFloat(s.preco_base).toFixed(2).replace(".", ",")}${LABELS[s.tipo_cobranca] ?? ""}`;
        precoBaseRow.style.display = "";
    });

    // Fetch and populate client locais
    try {
        const respLocais = await fetch(`../../backend/api/me/locais/list.php?id_usuario=${id_usuario}`);
        const locais = await respLocais.json();
        const selectLocal = document.getElementById("agendarLocal");
        if (Array.isArray(locais)) {
            selectLocal.innerHTML = '<option value="" disabled selected>Selecione seu local</option>' +
                locais.map(l =>
                    `<option value="${l.id_local}">${l.nome} – ${l.logradouro}, ${l.cidade}</option>`
                ).join("");
        } else {
            selectLocal.innerHTML = '<option value="" disabled selected>Nenhum local cadastrado</option>';
        }
    } catch {}

    // ── Seleção de dia + horário (início e término) ──────────────────────────
    const selectDiaInicio  = document.getElementById("agendarDiaInicio");
    const selectHoraInicio = document.getElementById("agendarHoraInicio");
    const avisoInicio      = document.getElementById("agendarInicioAviso");
    const selectDiaFim     = document.getElementById("agendarDiaFim");
    const selectHoraFim    = document.getElementById("agendarHoraFim");
    const avisoFim         = document.getElementById("agendarFimAviso");
    const ocupadosInicioEl = document.getElementById("agendarInicioOcupados");
    const ocupadosFimEl    = document.getElementById("agendarFimOcupados");

    const DIAS_SEMANA_LABEL = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const janelaCache = {}; // cache de disponibilidade.php por data, evita refetch

    const COR_INDISPONIVEL = 'color:#adb5bd;background-color:#f1f3f5;';   // fora do expediente / dia sem atendimento
    const COR_FRAGMENTARIA = 'color:#842029;background-color:#f8d7da;';  // fragmentaria: pularia outro agendamento

    // Meia em meia hora, das 00:00 às 23:30
    const TODOS_HORARIOS = Array.from({ length: 48 }, (_, i) =>
        `${String(Math.floor(i / 2)).padStart(2, "0")}:${i % 2 === 0 ? "00" : "30"}`);

    let diasDisponiveis = new Set();
    try {
        const respDias = await fetch(`../../backend/api/prestadores/dias_disponiveis.php?id_prestador=${id_prestador}`);
        const diasJson = await respDias.json();
        diasDisponiveis = new Set(diasJson.dias || []);
    } catch {}

    function toISODate(d) {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }

    function formatarDiaLabel(d) {
        return `${DIAS_SEMANA_LABEL[d.getDay()]}, ${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}`;
    }

    // Gera os próximos `quantidade` dias corridos a partir de `desde`, marcando como
    // desabilitados os dias em que o prestador não atende (permanecem visíveis e cinzas)
    function gerarProximosDias(desde, quantidade = 60) {
        const dias = [];
        const cursor = new Date(desde);
        cursor.setHours(0, 0, 0, 0);
        for (let i = 0; i < quantidade; i++) {
            dias.push({
                iso: toISODate(cursor),
                label: formatarDiaLabel(cursor),
                desabilitado: !diasDisponiveis.has(cursor.getDay()),
            });
            cursor.setDate(cursor.getDate() + 1);
        }
        return dias;
    }

    function renderizarOpcoesDias(select, dias, placeholder) {
        select.innerHTML = `<option value="" disabled selected>${placeholder}</option>` +
            dias.map(d => `<option value="${d.iso}"${d.desabilitado ? ` disabled style="${COR_INDISPONIVEL}"` : ""}>${d.label}</option>`).join("");
        select.disabled = dias.every(d => d.desabilitado);
    }

    async function buscarJanela(iso) {
        if (janelaCache[iso]) return janelaCache[iso];
        const resp = await fetch(`../../backend/api/prestadores/disponibilidade.php?id_prestador=${id_prestador}&data=${iso}`);
        const dadosDisp = await resp.json();
        janelaCache[iso] = dadosDisp;
        return dadosDisp;
    }

    function exibirOcupados(el, ocupados) {
        if (!ocupados?.length) {
            el.style.display = "none";
            return;
        }
        el.textContent = "Já reservado neste dia: " + ocupados.map(o => `${o.inicio}–${o.fim}`).join(", ");
        el.style.display = "";
    }

    // Um agendamento que se estende por vários dias ocupa o dia inteiro do "meio",
    // então qualquer reserva existente nesse dia com início após `apartirDe` (ou
    // qualquer reserva, se apartirDe for nulo) limita o horário de término máximo.
    function calcularCorteOcupados(ocupados, apartirDe) {
        let corte = null;
        for (const o of ocupados || []) {
            if (apartirDe && o.inicio <= apartirDe) continue;
            if (corte === null || o.inicio < corte) corte = o.inicio;
        }
        return corte;
    }

    // Gera as 48 opções de horário do dia; horários fora do expediente ou já
    // ocupados por outro agendamento aparecem desabilitados e acinzentados.
    function renderizarOpcoesHoraInicio(select, janela, ocupados) {
        let algumHabilitado = false;
        select.innerHTML = '<option value="" disabled selected>Selecione um horário</option>' +
            TODOS_HORARIOS.map(hora => {
                const foraExpediente = hora < janela.inicio || hora >= janela.fim;
                const ocupado = !foraExpediente && (ocupados || []).some(o => hora >= o.inicio && hora < o.fim);
                const desabilitado = foraExpediente || ocupado;
                if (!desabilitado) algumHabilitado = true;
                return `<option value="${hora}"${desabilitado ? ` disabled style="${COR_INDISPONIVEL}"` : ""}>${hora}</option>`;
            }).join("");
        select.disabled = false;
        return algumHabilitado;
    }

    // Mesma lógica, mas horários que fragmentariam um agendamento existente (i.e.
    // pulariam por cima de outra reserva) recebem uma cor diferente da de "fora do
    // expediente", já que o motivo de bloqueio é outro.
    function renderizarOpcoesHoraFim(select, janela, apartirDe, ocupados) {
        const corte = calcularCorteOcupados(ocupados, apartirDe);
        let algumHabilitado = false;
        select.innerHTML = '<option value="" disabled selected>Selecione um horário</option>' +
            TODOS_HORARIOS.map(hora => {
                const foraExpediente = hora < janela.inicio || hora > janela.fim;
                const antesOuNoInicio = apartirDe && hora <= apartirDe;
                const fragmentaria = !foraExpediente && !antesOuNoInicio && corte && hora > corte;
                const desabilitado = foraExpediente || antesOuNoInicio || fragmentaria;
                if (!desabilitado) algumHabilitado = true;
                const estilo = fragmentaria ? COR_FRAGMENTARIA : (desabilitado ? COR_INDISPONIVEL : "");
                return `<option value="${hora}"${desabilitado ? ` disabled` : ""}${estilo ? ` style="${estilo}"` : ""}>${hora}</option>`;
            }).join("");
        select.disabled = false;
        return algumHabilitado;
    }

    // ── Dia de início ─────────────────────────────────────────────────────────
    const diasInicio = gerarProximosDias(new Date());
    renderizarOpcoesDias(selectDiaInicio, diasInicio, "Selecione um dia");
    if (selectDiaInicio.disabled) {
        avisoInicio.textContent = "O prestador não possui horários de atendimento cadastrados.";
        avisoInicio.style.display = "";
    }

    selectDiaInicio.addEventListener("change", async function () {
        const iso = this.value;
        selectHoraInicio.innerHTML = '<option value="" selected>Carregando...</option>';
        selectHoraInicio.disabled = true;
        avisoInicio.style.display = "none";
        ocupadosInicioEl.style.display = "none";
        resetarTermino();

        const dadosDisp = await buscarJanela(iso);
        exibirOcupados(ocupadosInicioEl, dadosDisp.ocupados);

        if (!dadosDisp.janela) {
            selectHoraInicio.innerHTML = '<option value="" selected>Indisponível</option>';
            selectHoraInicio.disabled = true;
            avisoInicio.textContent = dadosDisp.mensagem ?? "Prestador não atende neste dia.";
            avisoInicio.style.display = "";
            return;
        }

        const algumHabilitado = renderizarOpcoesHoraInicio(selectHoraInicio, dadosDisp.janela, dadosDisp.ocupados);
        if (!algumHabilitado) {
            avisoInicio.textContent = "Todos os horários deste dia já estão ocupados.";
            avisoInicio.style.display = "";
        }
    });

    selectHoraInicio.addEventListener("change", function () {
        if (!this.value) return;
        popularDiaFim();
    });

    // ── Dia de término ────────────────────────────────────────────────────────
    function resetarTermino() {
        selectDiaFim.innerHTML  = '<option value="" selected>Selecione o início primeiro</option>';
        selectDiaFim.disabled   = true;
        selectHoraFim.innerHTML = '<option value="" selected>Horário</option>';
        selectHoraFim.disabled  = true;
        avisoFim.style.display  = "none";
        ocupadosFimEl.style.display = "none";
    }

    function popularDiaFim() {
        const diaInicioIso = selectDiaInicio.value;
        const diasFim = gerarProximosDias(new Date(diaInicioIso + "T00:00:00"));
        renderizarOpcoesDias(selectDiaFim, diasFim, "Selecione um dia");
        selectHoraFim.innerHTML = '<option value="" selected>Horário</option>';
        selectHoraFim.disabled = true;
        avisoFim.style.display = "none";
        ocupadosFimEl.style.display = "none";
    }

    selectDiaFim.addEventListener("change", async function () {
        const iso = this.value;
        selectHoraFim.innerHTML = '<option value="" selected>Carregando...</option>';
        selectHoraFim.disabled = true;
        avisoFim.style.display = "none";
        ocupadosFimEl.style.display = "none";

        const dadosDisp = await buscarJanela(iso);
        exibirOcupados(ocupadosFimEl, dadosDisp.ocupados);

        if (!dadosDisp.janela) {
            selectHoraFim.innerHTML = '<option value="" selected>Indisponível</option>';
            avisoFim.textContent = dadosDisp.mensagem ?? "Prestador não atende neste dia.";
            avisoFim.style.display = "";
            return;
        }

        const mesmoDia = iso === selectDiaInicio.value;
        const algumHabilitado = renderizarOpcoesHoraFim(
            selectHoraFim, dadosDisp.janela, mesmoDia ? selectHoraInicio.value : null, dadosDisp.ocupados);

        if (!algumHabilitado) {
            avisoFim.textContent = "Nenhum horário de término disponível neste dia.";
            avisoFim.style.display = "";
        }
    });

    resetarTermino();

    // Submit booking
    document.getElementById("btnConfirmarAgendamento").addEventListener("click", async function () {
        const id_servico    = document.getElementById("agendarServico").value;
        const id_local      = document.getElementById("agendarLocal").value;
        const descricao     = document.getElementById("agendarDescricao").value.trim();
        const containerModal = document.getElementById("containerAlertaModal");

        const diaInicio  = selectDiaInicio.value;
        const horaInicio = selectHoraInicio.value;
        const diaFim     = selectDiaFim.value;
        const horaFim    = selectHoraFim.value;

        if (!id_servico || !id_local) {
            alerta(containerModal, "Selecione um serviço e um local.", "warning");
            return;
        }
        if (!diaInicio || !horaInicio) {
            alerta(containerModal, "Selecione o dia e horário de início.", "warning");
            return;
        }
        if (!diaFim || !horaFim) {
            alerta(containerModal, "Selecione o dia e horário de término.", "warning");
            return;
        }

        const dataHoraInicio = `${diaInicio}T${horaInicio}`;
        const dataHoraFim    = `${diaFim}T${horaFim}`;

        if (new Date(dataHoraFim) <= new Date(dataHoraInicio)) {
            alerta(containerModal, "A data e hora de término devem ser posteriores ao início.", "warning");
            return;
        }

        const fd = new FormData();
        fd.append("id_usuario",       id_usuario);
        fd.append("id_prestador",     id_prestador);
        fd.append("id_servico",       id_servico);
        fd.append("id_local",         id_local);
        fd.append("descricao",        descricao);
        fd.append("data_hora_inicio", dataHoraInicio);
        fd.append("data_hora_fim",    dataHoraFim);

        try {
            const resp   = await fetch("../../backend/api/agendamentos/create.php", { method: "POST", body: fd });
            const texto  = await resp.text();
            let result;
            try { result = JSON.parse(texto); } catch {
                console.error("Resposta não-JSON:", texto);
                alerta(containerModal, "Erro inesperado no servidor. Tente novamente.", "danger");
                return;
            }
            if (result.sucesso) {
                bootstrap.Modal.getInstance(document.getElementById("modalAgendar")).hide();
                alerta(containerAlerta, "Solicitação enviada! Aguarde o orçamento do prestador.", "success");
            } else {
                alerta(containerModal, result.erro || "Erro ao criar agendamento.", "danger");
            }
        } catch {
            alerta(containerModal, "Não foi possível conectar ao servidor.", "danger");
        }
    });
});
