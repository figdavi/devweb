<?php

header('Content-Type: application/json');
require_once '../conexao.php';

$id_agendamento = $_POST['id_agendamento'] ?? null;
$id_prestador   = $_POST['id_usuario'] ?? null;

$sql = "UPDATE agendamentos
        SET status = 'em_andamento'
        WHERE id_agendamento = ? AND id_prestador = ? AND status = 'confirmado'";
$stmt = $con->prepare($sql);
$stmt->bind_param("ii", $id_agendamento, $id_prestador);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(["sucesso" => true, "mensagem" => "Serviço iniciado!"]);
    } else {
        echo json_encode(["sucesso" => false, "erro" => "Agendamento não encontrado, status inválido ou sem permissão."]);
    }
} else {
    echo json_encode(["sucesso" => false, "erro" => "Erro ao iniciar agendamento: " . $stmt->error]);
}

$stmt->close();
$con->close();
