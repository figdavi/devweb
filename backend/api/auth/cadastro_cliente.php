<?php

header('Content-Type: application/json');
require_once '../conexao.php';

$email    = $_POST['email'] ?? '';
$senha    = password_hash($_POST['senha'] ?? '', PASSWORD_BCRYPT);
$nome     = $_POST['nome'] ?? '';
$telefone = $_POST['telefone'] ?? '';

$con->begin_transaction();

$sql = "INSERT INTO usuarios (email, senha, nome, telefone) VALUES (?, ?, ?, ?)";
$stmt = $con->prepare($sql);
$stmt->bind_param("ssss", $email, $senha, $nome, $telefone);

if (!$stmt->execute()) {
    $con->rollback();
    echo json_encode(["sucesso" => false, "erro" => "E-mail já cadastrado."]);
    $stmt->close();
    $con->close();
    exit;
}

$id_usuario = $con->insert_id;
$stmt->close();

$sql2 = "INSERT INTO clientes (id_usuario) VALUES (?)";
$stmt2 = $con->prepare($sql2);
$stmt2->bind_param("i", $id_usuario);

if ($stmt2->execute()) {
    $con->commit();
    echo json_encode(["sucesso" => true, "mensagem" => "Cliente cadastrado com sucesso!", "id_usuario" => $id_usuario]);
} else {
    $con->rollback();
    echo json_encode(["sucesso" => false, "erro" => "Erro ao cadastrar cliente: " . $stmt2->error]);
}

$stmt2->close();
$con->close();
