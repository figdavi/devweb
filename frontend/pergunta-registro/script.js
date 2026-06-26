let selected = null;

function selectType(type) {
    selected = type;
    ['cliente', 'prestador'].forEach(t => {
        const card = document.getElementById('card-' + t);
        card.classList.toggle('selected', t === type);
        card.setAttribute('aria-pressed', t === type ? 'true' : 'false');
    });
    document.getElementById('btn-continue').classList.remove('invisible');
}

const rotas = {
    cliente: '../login-form/RegistrarCliente.html',    // ← troque pela URL do cliente
    prestador: '../login-form/RegistrarPrestador.html'   // ← troque pela URL do prestador
};

function continuar() {
    if (!selected) return;
    window.location.href = rotas[selected];
}