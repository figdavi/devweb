<?php

header('Content-Type: application/json');
require_once '../../conexao.php';

$id_local = $_GET['id_local'] ?? null;

$sql = "SELECT * FROM locais WHERE id_local = ?";
$stmt = $con->prepare($sql);
$stmt->bind_param("i", $id_local);
$stmt->execute();
$result = $stmt->get_result();

if ($dados = $result->fetch_assoc()) {
    echo json_encode($dados);
} else {
    echo json_encode(["erro" => "Local não encontrado."]);
}

$stmt->close();
$con->close();
