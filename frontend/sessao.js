document.addEventListener("DOMContentLoaded", function () {
    // 1. Verifica se o usuário está logado
    const idUsuario = localStorage.getItem("id_usuario");
    const nomeUsuario = localStorage.getItem("nome_usuario");
    const tipoUsuario = localStorage.getItem("tipo_usuario");

    if (!idUsuario) {
        window.location.href = "../login-form/login.html";
        return;
    }

    // Verifica tipo de usuário exigido pela página (atributo data-tipo-required no <body>)
    const tipoExigido = document.body.dataset.tipoRequired;
    if (tipoExigido && tipoUsuario !== tipoExigido) {
        window.location.href = "../login-form/login.html";
        return;
    }

    // 2. Lógica do botão Sair
    const btnSair = document.getElementById("btnSair");
    if (btnSair) {
        btnSair.addEventListener("click", function () {
            // Limpa todos os dados da sessão (esvazia o cofre)
            localStorage.clear();
            
            // Redireciona para o login
            window.location.href = "../login-form/login.html";
        });
    }

    // 3. (Opcional) Dica extra: você pode usar os dados para personalizar a tela
    // Exemplo: se houver um elemento com id="nomeDoUsuarioHeader", ele coloca o nome lá
    const elementoNome = document.getElementById("nomeDoUsuarioHeader");
    if (elementoNome) {
        elementoNome.innerText = `Olá, ${nomeUsuario}`;
    }

    // ==========================================
    // RENDERIZAR MENU DINÂMICO
    // ==========================================
    const menuDinamico = document.getElementById("menuDinamico");

    if (menuDinamico) {
        if (tipoUsuario === 'cliente') {
            menuDinamico.innerHTML = `
                <a href="../Agendamentos-Cliente/index.html" class="info">Meus Agendamentos</a>
                <a href="../Perfil-Cliente/index.html" class="info">Perfil</a>
                <a href="../Busca-Servicos/servicos.html" class="info">Buscar Serviços</a>
            `;
        } else if (tipoUsuario === 'prestador') {
            menuDinamico.innerHTML = `
                <a href="../Agenda - Prestador/index.html" class="info">Meus Agendamentos</a>
                <a href="../Perfil - Prestador/index.html" class="info">Perfil</a>
                <a href="../Agenda - Prestador/index.html" class="info">Agenda</a>
            `;
        }
    }
});