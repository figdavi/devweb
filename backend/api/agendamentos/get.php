<?php

header('Content-Type: application/json');
require_once '../conexao.php';

$id_agendamento = $_GET['id_agendamento'] ?? null;

$sql = "SELECT ag.*,
               s.titulo AS servico, s.descricao AS servico_descricao,
               l.nome AS local_nome, l.logradouro, l.numero, l.bairro, l.cidade, l.estado,
               uc.nome AS nome_cliente,
               up.nome AS nome_prestador
        FROM agendamentos ag
        JOIN servicos s ON s.id_servico = ag.id_servico
        JOIN locais l ON l.id_local = ag.id_local
        JOIN usuarios uc ON uc.id_usuario = ag.id_cliente
        JOIN usuarios up ON up.id_usuario = ag.id_prestador
        WHERE ag.id_agendamento = ?";
$stmt = $con->prepare($sql);
$stmt->bind_param("i", $id_agendamento);
$stmt->execute();
$result = $stmt->get_result();

if ($dados = $result->fetch_assoc()) {
    echo json_encode($dados);
} else {
    echo json_encode(["erro" => "Agendamento não encontrado."]);
}

$stmt->close();
$con->close();
