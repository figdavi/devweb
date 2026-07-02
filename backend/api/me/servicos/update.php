<?php

header('Content-Type: application/json');
require_once '../../conexao.php';

$id_prestador  = $_POST['id_usuario'] ?? null;
$id_servico    = $_POST['id_servico'] ?? null;
$tipo_cobranca = $_POST['tipo_cobranca'] ?? '';
$preco_base    = $_POST['preco_base'] ?? 0;

$sql = "UPDATE prestador_servicos SET tipo_cobranca = ?, preco_base = ? WHERE id_prestador = ? AND id_servico = ?";
$stmt = $con->prepare($sql);
$stmt->bind_param("sdii", $tipo_cobranca, $preco_base, $id_prestador, $id_servico);

if ($stmt->execute()) {
    echo json_encode(["sucesso" => true, "mensagem" => "Serviço atualizado com sucesso!"]);
} else {
    echo json_encode(["sucesso" => false, "erro" => "Erro ao atualizar serviço: " . $stmt->error]);
}

$stmt->close();
$con->close();
