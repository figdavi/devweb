<?php

header('Content-Type: application/json');
require_once '../conexao.php';

$id_agendamento = $_POST['id_agendamento'] ?? null;
$id_prestador   = $_POST['id_usuario'] ?? null;

$con->begin_transaction();

$sqlUpd = "UPDATE agendamentos
           SET status = 'concluido'
           WHERE id_agendamento = ? AND id_prestador = ? AND status = 'em_andamento'";
$stmt = $con->prepare($sqlUpd);
$stmt->bind_param("ii", $id_agendamento, $id_prestador);

if (!$stmt->execute() || $stmt->affected_rows === 0) {
    $con->rollback();
    echo json_encode(["sucesso" => false, "erro" => "Agendamento não encontrado, status inválido ou sem permissão."]);
    $stmt->close();
    $con->close();
    exit;
}
$stmt->close();

// Cria registro vazio de avaliação para preenchimento posterior por cliente e prestador
$sqlAval = "INSERT INTO avaliacoes (id_agendamento) VALUES (?)";
$stmtAval = $con->prepare($sqlAval);
$stmtAval->bind_param("i", $id_agendamento);

if ($stmtAval->execute()) {
    $con->commit();
    echo json_encode(["sucesso" => true, "mensagem" => "Serviço concluído!"]);
} else {
    $con->rollback();
    echo json_encode(["sucesso" => false, "erro" => "Erro ao registrar conclusão: " . $stmtAval->error]);
}

$stmtAval->close();
$con->close();
