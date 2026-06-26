<?php

header('Content-Type: application/json');
require_once '../conexao.php';

$id_servico = $_GET['id_servico'] ?? null;

$sql = "SELECT s.id_servico, s.titulo, s.descricao, c.id_categoria, c.nome AS categoria
        FROM servicos s
        JOIN categorias c ON c.id_categoria = s.id_categoria
        WHERE s.id_servico = ?";
$stmt = $con->prepare($sql);
$stmt->bind_param("i", $id_servico);
$stmt->execute();
$result = $stmt->get_result();

if ($dados = $result->fetch_assoc()) {
    echo json_encode($dados);
} else {
    echo json_encode(["erro" => "Serviço não encontrado."]);
}

$stmt->close();
$con->close();
