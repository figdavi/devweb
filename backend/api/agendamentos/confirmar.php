<?php

header('Content-Type: application/json');
require_once '../conexao.php';

$id_agendamento = $_POST['id_agendamento'] ?? null;
$id_cliente     = $_POST['id_usuario'] ?? null;

$sql = "UPDATE agendamentos
        SET status = 'confirmado', cliente_confirmou = 1
        WHERE id_agendamento = ? AND id_cliente = ? AND status = 'orcamento_enviado'";
$stmt = $con->prepare($sql);
$stmt->bind_param("ii", $id_agendamento, $id_cliente);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(["sucesso" => true, "mensagem" => "Orçamento aceito. Agendamento confirmado!"]);
    } else {
        echo json_encode(["sucesso" => false, "erro" => "Agendamento não encontrado, status inválido ou sem permissão."]);
    }
} else {
    echo json_encode(["sucesso" => false, "erro" => "Erro ao confirmar agendamento: " . $stmt->error]);
}

$stmt->close();
$con->close();
