<?php

header('Content-Type: application/json');
require_once '../conexao.php';

$id_agendamento = $_POST['id_agendamento'] ?? null;
$id_prestador   = $_POST['id_usuario'] ?? null;
$valor          = $_POST['valor'] ?? null;
$tipo_cobranca  = $_POST['tipo_cobranca'] ?? '';

$sql = "UPDATE agendamentos
        SET valor = ?, tipo_cobranca = ?, status = 'orcamento_enviado'
        WHERE id_agendamento = ? AND id_prestador = ? AND status = 'aguardando_orcamento'";
$stmt = $con->prepare($sql);
$stmt->bind_param("dsii", $valor, $tipo_cobranca, $id_agendamento, $id_prestador);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(["sucesso" => true, "mensagem" => "Orçamento enviado com sucesso!"]);
    } else {
        echo json_encode(["sucesso" => false, "erro" => "Agendamento não encontrado, status inválido ou sem permissão."]);
    }
} else {
    echo json_encode(["sucesso" => false, "erro" => "Erro ao enviar orçamento: " . $stmt->error]);
}

$stmt->close();
$con->close();
