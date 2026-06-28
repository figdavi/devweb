<?php

header('Content-Type: application/json');
require_once '../conexao.php';

$id_usuario = $_GET['id_usuario'] ?? null;

$sql = "SELECT p.id_categoria, p.descricao_profissional, p.cep, p.logradouro, p.bairro, p.cidade, p.estado,
               c.nome AS categoria
        FROM prestadores p
        JOIN categorias c ON c.id_categoria = p.id_categoria
        WHERE p.id_usuario = ?";
$stmt = $con->prepare($sql);
$stmt->bind_param("i", $id_usuario);
$stmt->execute();
$dados = $stmt->get_result()->fetch_assoc();
$stmt->close();
$con->close();

if (!$dados) {
    echo json_encode(["erro" => "Prestador não encontrado."]);
    exit;
}

echo json_encode($dados);
