<?php

header('Content-Type: application/json');
require_once '../../conexao.php';

$id_prestador  = $_POST['id_usuario'] ?? null;
$id_servico    = $_POST['id_servico'] ?? null;
$tipo_cobranca = $_POST['tipo_cobranca'] ?? '';
$preco_base    = $_POST['preco_base'] ?? 0;

$sql = "INSERT INTO prestador_servicos (id_prestador, id_servico, tipo_cobranca, preco_base) VALUES (?, ?, ?, ?)";
$stmt = $con->prepare($sql);
$stmt->bind_param("iisd", $id_prestador, $id_servico, $tipo_cobranca, $preco_base);

if ($stmt->execute()) {
    echo json_encode(["sucesso" => true, "mensagem" => "Serviço adicionado com sucesso!"]);
} else {
    echo json_encode(["sucesso" => false, "erro" => "Erro ao adicionar serviço: " . $stmt->error]);
}

$stmt->close();
$con->close();
