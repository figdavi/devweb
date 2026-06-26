<?php

header('Content-Type: application/json');
require_once '../../conexao.php';

$id_local = $_POST['id_local'] ?? null;

$sql = "DELETE FROM locais WHERE id_local = ?";
$stmt = $con->prepare($sql);
$stmt->bind_param("i", $id_local);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(["sucesso" => true, "mensagem" => "Local removido com sucesso."]);
    } else {
        echo json_encode(["sucesso" => false, "erro" => "Local não encontrado."]);
    }
} else {
    echo json_encode(["sucesso" => false, "erro" => "Erro ao remover local: " . $stmt->error]);
}

$stmt->close();
$con->close();
