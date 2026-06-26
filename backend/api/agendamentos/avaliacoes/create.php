<?php

header('Content-Type: application/json');
require_once '../../conexao.php';

$id_agendamento = $_POST['id_agendamento'] ?? null;
$id_usuario     = $_POST['id_usuario'] ?? null;
$nota           = $_POST['nota'] ?? null;
$comentario     = $_POST['comentario'] ?? null;

$sqlAg = "SELECT id_cliente, id_prestador, status FROM agendamentos WHERE id_agendamento = ?";
$stmtAg = $con->prepare($sqlAg);
$stmtAg->bind_param("i", $id_agendamento);
$stmtAg->execute();
$ag = $stmtAg->get_result()->fetch_assoc();
$stmtAg->close();

if (!$ag) {
    echo json_encode(["sucesso" => false, "erro" => "Agendamento não encontrado."]);
    $con->close();
    exit;
}

if ($ag['status'] !== 'concluido') {
    echo json_encode(["sucesso" => false, "erro" => "Só é possível avaliar agendamentos concluídos."]);
    $con->close();
    exit;
}

// Determina se o usuário é cliente ou prestador neste agendamento
// $campo_nota/$campo_coment são derivados de comparação de IDs, nunca de input direto
if ($ag['id_cliente'] == $id_usuario) {
    $campo_nota   = "cliente_nota";
    $campo_coment = "cliente_comentario";
} elseif ($ag['id_prestador'] == $id_usuario) {
    $campo_nota   = "prestador_nota";
    $campo_coment = "prestador_comentario";
} else {
    echo json_encode(["sucesso" => false, "erro" => "Sem permissão para avaliar este agendamento."]);
    $con->close();
    exit;
}

$sql = "UPDATE avaliacoes SET $campo_nota = ?, $campo_coment = ? WHERE id_agendamento = ? AND $campo_nota IS NULL";
$stmt = $con->prepare($sql);
$stmt->bind_param("isi", $nota, $comentario, $id_agendamento);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(["sucesso" => true, "mensagem" => "Avaliação registrada com sucesso!"]);
    } else {
        echo json_encode(["sucesso" => false, "erro" => "Avaliação já registrada para este agendamento."]);
    }
} else {
    echo json_encode(["sucesso" => false, "erro" => "Erro ao registrar avaliação: " . $stmt->error]);
}

$stmt->close();
$con->close();
