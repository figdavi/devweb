<?php

header('Content-Type: application/json');
require_once '../conexao.php';

$id_usuario = $_POST['id_usuario'] ?? null;

$sql = "DELETE FROM usuarios WHERE id_usuario = ?";
$stmt = $con->prepare($sql);
$stmt->bind_param("i", $id_usuario);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(["sucesso" => true, "mensagem" => "Conta excluída com sucesso."]);
    } else {
        echo json_encode(["sucesso" => false, "erro" => "Usuário não encontrado."]);
    }
} else {
    echo json_encode(["sucesso" => false, "erro" => "Erro ao excluir conta: " . $stmt->error]);
}

$stmt->close();
$con->close();
