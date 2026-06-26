<?php

header('Content-Type: application/json');
require_once '../../conexao.php';

$id_prestador = $_POST['id_usuario'] ?? null;
$id_servico   = $_POST['id_servico'] ?? null;

$sql = "DELETE FROM prestador_servicos WHERE id_prestador = ? AND id_servico = ?";
$stmt = $con->prepare($sql);
$stmt->bind_param("ii", $id_prestador, $id_servico);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(["sucesso" => true, "mensagem" => "Serviço removido com sucesso."]);
    } else {
        echo json_encode(["sucesso" => false, "erro" => "Serviço não encontrado."]);
    }
} else {
    echo json_encode(["sucesso" => false, "erro" => "Erro ao remover serviço: " . $stmt->error]);
}

$stmt->close();
$con->close();
