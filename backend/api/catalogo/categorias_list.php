<?php

header('Content-Type: application/json');
require_once '../conexao.php';

$sql = "SELECT * FROM categorias ORDER BY nome";
$stmt = $con->prepare($sql);
$stmt->execute();
$result = $stmt->get_result();

$dados = [];
while ($linha = $result->fetch_assoc()) {
    $dados[] = $linha;
}

echo json_encode(count($dados) > 0 ? $dados : ["erro" => "Nenhuma categoria encontrada."]);

$stmt->close();
$con->close();
