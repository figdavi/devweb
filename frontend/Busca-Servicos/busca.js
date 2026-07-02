document.addEventListener("DOMContentLoaded", async function () {
    const id_usuario = localStorage.getItem("id_usuario");

    function alerta(mensagem, tipo = "warning") {
        document.getElementById("containerAlerta").innerHTML =
            `<div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
                <strong>${tipo === "success" ? "Sucesso!" : "Atenção!"}</strong> ${mensagem}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
    }

    // ── Carregar filtros ───────────────────────────────────────────────────
    const [respLocais, respCats] = await Promise.all([
        fetch(`../../backend/api/me/locais/list.php?id_usuario=${id_usuario}`),
        fetch("../../backend/api/catalogo/categorias_list.php")
    ]);

    const locais = await respLocais.json();
    const selectLocal = document.getElementById("filtroLocal");
    if (Array.isArray(locais)) {
        locais.forEach(l => {
            const opt = document.createElement("option");
            opt.value = l.id_local;
            opt.textContent = `${l.nome} – ${l.cidade}`;
            selectLocal.appendChild(opt);
        });
    }

    const categorias = await respCats.json();
    const selectCat = document.getElementById("filtroCategoria");
    if (Array.isArray(categorias)) {
        categorias.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.id_categoria;
            opt.textContent = c.nome;
            selectCat.appendChild(opt);
        });
    }

    // ── Buscar prestadores ─────────────────────────────────────────────────
    async function buscar() {
        const id_categoria = document.getElementById("filtroCategoria").value;
        const preco_min    = document.getElementById("filtroPrecoMin").value;
        const preco_max    = document.getElementById("filtroPrecoMax").value;

        const params = new URLSearchParams();
        if (id_categoria) params.append("id_categoria", id_categoria);
        if (preco_min)    params.append("preco_min", preco_min);
        if (preco_max)    params.append("preco_max", preco_max);

        const lista = document.getElementById("listaPrestadores");
        lista.innerHTML = '<p class="text-secondary">Buscando...</p>';

        try {
            const resp  = await fetch(`../../backend/api/prestadores/list.php?${params}`);
            const dados = await resp.json();

            if (dados.erro || !Array.isArray(dados) || dados.length === 0) {
                lista.innerHTML = '<p class="text-secondary">Nenhum prestador encontrado para os filtros selecionados.</p>';
                return;
            }

            lista.innerHTML = dados.map(p => `
                <div class="col-12 col-sm-6 col-lg-4">
                  <div class="card h-100 shadow-sm">
                    <div class="card-body d-flex flex-column justify-content-between">
                      <div>
                        <div class="d-flex justify-content-between align-items-start mb-1">
                          <h5 class="card-title mb-0">${p.nome}</h5>
                          ${p.media_avaliacao ? `<span class="badge bg-warning text-dark">★ ${p.media_avaliacao}</span>` : ''}
                        </div>
                        <h6 class="card-subtitle mb-2 text-body-secondary">${p.categoria}</h6>
                        <p class="card-text small text-secondary">${p.cidade}/${p.estado}</p>
                        <p class="card-text small">${p.descricao_profissional ?? ""}</p>
                        ${p.preco_minimo ? `<p class="fw-bold mb-0">A partir de R$ ${parseFloat(p.preco_minimo).toFixed(2).replace(".", ",")}</p>` : ""}
                      </div>
                      <a href="../Perfil - Prestador/perfilprestador.html?id=${p.id_usuario}"
                         class="btn btn-outline-primary btn-sm mt-3">Ver perfil</a>
                    </div>
                  </div>
                </div>`).join("");
        } catch {
            alerta("Erro ao buscar prestadores.", "danger");
        }
    }

    document.getElementById("btnBuscar").addEventListener("click", buscar);
    buscar();
});
