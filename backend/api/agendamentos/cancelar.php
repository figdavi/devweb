<?php

header('Content-Type: application/json');
require_once '../conexao.php';

$id_agendamento = $_POST['id_agendamento'] ?? null;
$id_usuario     = $_POST['id_usuario'] ?? null;

$sql = "UPDATE agendamentos
        SET status = 'cancelado'
        WHERE id_agendamento = ?
          AND (id_cliente = ? OR id_prestador = ?)
          AND status IN ('aguardando_orcamento', 'orcamento_enviado', 'confirmado')";
$stmt = $con->prepare($sql);
$stmt->bind_param("iii", $id_agendamento, $id_usuario, $id_usuario);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(["sucesso" => true, "mensagem" => "Agendamento cancelado."]);
    } else {
        echo json_encode(["sucesso" => false, "erro" => "Agendamento não encontrado, status inválido ou sem permissão."]);
    }
} else {
    echo json_encode(["sucesso" => false, "erro" => "Erro ao cancelar agendamento: " . $stmt->error]);
}

$stmt->close();
$con->close();
