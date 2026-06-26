<?php

header('Content-Type: application/json');
require_once '../../conexao.php';

$id_agendamento = $_GET['id_agendamento'] ?? null;

$sql = "SELECT * FROM avaliacoes WHERE id_agendamento = ?";
$stmt = $con->prepare($sql);
$stmt->bind_param("i", $id_agendamento);
$stmt->execute();
$result = $stmt->get_result();

if ($dados = $result->fetch_assoc()) {
    echo json_encode($dados);
} else {
    echo json_encode(["erro" => "Avaliação não encontrada."]);
}

$stmt->close();
$con->close();
