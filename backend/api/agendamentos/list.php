<?php

header('Content-Type: application/json');
require_once '../conexao.php';

$id_usuario = $_GET['id_usuario'] ?? null;
// Garante que $coluna nunca recebe valor diretamente do usuário
$coluna = ($_GET['tipo'] ?? '') === 'prestador' ? 'id_prestador' : 'id_cliente';
$status = $_GET['status'] ?? null;

$sql = "SELECT ag.id_agendamento, ag.status, ag.data_hora_inicio, ag.data_hora_fim,
               ag.valor, ag.tipo_cobranca, ag.data_hora_criacao,
               s.titulo AS servico,
               l.nome AS local_nome,
               uc.nome AS nome_cliente,
               up.nome AS nome_prestador,
               av.cliente_nota, av.cliente_comentario,
               av.prestador_nota, av.prestador_comentario
        FROM agendamentos ag
        JOIN servicos s ON s.id_servico = ag.id_servico
        JOIN locais l ON l.id_local = ag.id_local
        JOIN usuarios uc ON uc.id_usuario = ag.id_cliente
        JOIN usuarios up ON up.id_usuario = ag.id_prestador
        LEFT JOIN avaliacoes av ON av.id_agendamento = ag.id_agendamento
        WHERE ag.$coluna = ?";

$tipos  = "i";
$params = [(int) $id_usuario];

if ($status !== null) {
    $sql .= " AND ag.status = ?";
    $tipos .= "s";
    $params[] = $status;
}

$sql .= " ORDER BY ag.data_hora_criacao DESC";

$stmt = $con->prepare($sql);
$stmt->bind_param($tipos, ...$params);
$stmt->execute();
$result = $stmt->get_result();

$dados = [];
while ($linha = $result->fetch_assoc()) {
    $dados[] = $linha;
}

echo json_encode(count($dados) > 0 ? $dados : ["erro" => "Nenhum agendamento encontrado."]);

$stmt->close();
$con->close();
