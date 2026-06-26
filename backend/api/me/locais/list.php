<?php

header('Content-Type: application/json');
require_once '../../conexao.php';

$id_usuario = $_GET['id_usuario'] ?? null;

$sql = "SELECT * FROM locais WHERE id_cliente = ?";
$stmt = $con->prepare($sql);
$stmt->bind_param("i", $id_usuario);
$stmt->execute();
$result = $stmt->get_result();

$dados = [];
while ($linha = $result->fetch_assoc()) {
    $dados[] = $linha;
}

echo json_encode(count($dados) > 0 ? $dados : ["erro" => "Nenhum local encontrado."]);

$stmt->close();
$con->close();
