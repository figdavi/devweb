<?php

header('Content-Type: application/json');
require_once '../conexao.php';

$id_categoria = $_GET['id_categoria'] ?? null;

$sql = "SELECT id_servico, titulo, descricao FROM servicos WHERE id_categoria = ?";
$stmt = $con->prepare($sql);
$stmt->bind_param("i", $id_categoria);
$stmt->execute();
$result = $stmt->get_result();

$dados = [];
while ($linha = $result->fetch_assoc()) {
    $dados[] = $linha;
}

echo json_encode(count($dados) > 0 ? $dados : ["erro" => "Nenhum serviço encontrado para esta categoria."]);

$stmt->close();
$con->close();
