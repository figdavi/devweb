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

    // ── Carregar perfil ────────────────────────────────────────────────────
    let dados;
    try {
        const resp = await fetch(`../../backend/api/prestadores/get.php?id_usuario=${id_prestador}`);
        dados = await resp.json();
        if (dados.erro) {
            alerta(containerAlerta, "Prestador não encontrado.");
            return;
        }
    } catch {
        alerta(containerAlerta, "Erro ao carregar perfil.");
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
                  ${a.cliente_comentario ? `<p class="text-secondary small mb-0">"${a.cliente_comentario}"</p>` : ""}
                </div>`).join("");
    }

    // ── Agendamento (somente clientes) ─────────────────────────────────────
    if (tipo_usuario !== "cliente") return;

    document.getElementById("btnAgendar").classList.remove("d-none");

    // Populate service select
    const selectServico = document.getElementById("agendarServico");
    selectServico.innerHTML = '<option value="" disabled selected>Selecione um serviço</option>' +
        (dados.servicos || []).map(s =>
            `<option value="${s.id_servico}">${s.titulo} – R$ ${parseFloat(s.preco_base).toFixed(2).replace(".", ",")}${LABELS[s.tipo_cobranca] ?? ""}</option>`
        ).join("");

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

    // Submit booking
    document.getElementById("btnConfirmarAgendamento").addEventListener("click", async function () {
        const id_servico       = document.getElementById("agendarServico").value;
        const id_local         = document.getElementById("agendarLocal").value;
        const descricao        = document.getElementById("agendarDescricao").value.trim();
        const data_hora_inicio = document.getElementById("agendarDataInicio").value;
        const containerModal   = document.getElementById("containerAlertaModal");

        if (!id_servico || !id_local) {
            alerta(containerModal, "Selecione um serviço e um local.", "warning");
            return;
        }

        const fd = new FormData();
        fd.append("id_usuario",       id_usuario);
        fd.append("id_prestador",     id_prestador);
        fd.append("id_servico",       id_servico);
        fd.append("id_local",         id_local);
        fd.append("descricao",        descricao);
        fd.append("data_hora_inicio", data_hora_inicio);
        fd.append("data_hora_fim",    "");

        try {
            const resp   = await fetch("../../backend/api/agendamentos/create.php", { method: "POST", body: fd });
            const result = await resp.json();
            if (result.sucesso) {
                bootstrap.Modal.getInstance(document.getElementById("modalAgendar")).hide();
                alerta(containerAlerta, "Solicitação enviada! Aguarde o orçamento do prestador.", "success");
            } else {
                alerta(containerModal, result.erro || "Erro ao criar agendamento.", "danger");
            }
        } catch {
            alerta(containerModal, "Erro ao conectar com o servidor.", "danger");
        }
    });
});
