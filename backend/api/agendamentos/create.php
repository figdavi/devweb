<?php

header('Content-Type: application/json');
require_once '../conexao.php';

$id_cliente       = $_POST['id_usuario'] ?? null;
$id_prestador     = $_POST['id_prestador'] ?? null;
$id_servico       = $_POST['id_servico'] ?? null;
$id_local         = $_POST['id_local'] ?? null;
$descricao        = $_POST['descricao'] ?? null;
$data_hora_inicio = $_POST['data_hora_inicio'] ?? '';
$data_hora_fim    = $_POST['data_hora_fim'] ?? '';
$data_hora_criacao = date('Y-m-d H:i:s');

// Busca tipo_cobranca do catálogo como placeholder (RN11: valor final definido pelo prestador no orçamento)
$sqlPS = "SELECT tipo_cobranca FROM prestador_servicos WHERE id_prestador = ? AND id_servico = ?";
$stmtPS = $con->prepare($sqlPS);
$stmtPS->bind_param("ii", $id_prestador, $id_servico);
$stmtPS->execute();
$ps = $stmtPS->get_result()->fetch_assoc();
$stmtPS->close();

if (!$ps) {
    echo json_encode(["sucesso" => false, "erro" => "Prestador não oferece este serviço."]);
    $con->close();
    exit;
}

$tipo_cobranca = $ps['tipo_cobranca'];
$valor         = 0.00;

$sql = "INSERT INTO agendamentos
            (id_cliente, id_prestador, id_servico, id_local, descricao, tipo_cobranca, valor,
             data_hora_criacao, data_hora_inicio, data_hora_fim)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
$stmt = $con->prepare($sql);
$stmt->bind_param("iiiissdsss",
    $id_cliente, $id_prestador, $id_servico, $id_local,
    $descricao, $tipo_cobranca, $valor,
    $data_hora_criacao, $data_hora_inicio, $data_hora_fim
);

if ($stmt->execute()) {
    echo json_encode(["sucesso" => true, "mensagem" => "Solicitação enviada com sucesso!", "id_agendamento" => $con->insert_id]);
} else {
    echo json_encode(["sucesso" => false, "erro" => "Erro ao criar agendamento: " . $stmt->error]);
}

$stmt->close();
$con->close();
