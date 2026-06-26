<?php

header('Content-Type: application/json');
require_once '../conexao.php';

$id_usuario = $_GET['id_usuario'] ?? null;

$sql = "SELECT u.id_usuario, u.email, u.nome, u.telefone,
               CASE WHEN c.id_usuario IS NOT NULL THEN 'cliente' ELSE 'prestador' END AS tipo
        FROM usuarios u
        LEFT JOIN clientes c ON c.id_usuario = u.id_usuario
        WHERE u.id_usuario = ?";
$stmt = $con->prepare($sql);
$stmt->bind_param("i", $id_usuario);
$stmt->execute();
$result = $stmt->get_result();

if ($dados = $result->fetch_assoc()) {
    echo json_encode($dados);
} else {
    echo json_encode(["erro" => "Usuário não encontrado."]);
}

$stmt->close();
$con->close();
