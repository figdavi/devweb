<?php

header('Content-Type: application/json');
require_once '../../conexao.php';

$id_cliente  = $_POST['id_usuario'] ?? null;
$nome        = $_POST['nome'] ?? '';
$cep         = $_POST['cep'] ?? '';
$logradouro  = $_POST['logradouro'] ?? '';
$numero      = $_POST['numero'] ?? '';
$bairro      = $_POST['bairro'] ?? '';
$complemento = $_POST['complemento'] ?? null;
$cidade      = $_POST['cidade'] ?? '';
$estado      = $_POST['estado'] ?? '';

$sql = "INSERT INTO locais (id_cliente, nome, cep, logradouro, numero, bairro, complemento, cidade, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
$stmt = $con->prepare($sql);
$stmt->bind_param("issssssss", $id_cliente, $nome, $cep, $logradouro, $numero, $bairro, $complemento, $cidade, $estado);

if ($stmt->execute()) {
    echo json_encode(["sucesso" => true, "mensagem" => "Local criado com sucesso!", "id_local" => $con->insert_id]);
} else {
    echo json_encode(["sucesso" => false, "erro" => "Erro ao criar local: " . $stmt->error]);
}

$stmt->close();
$con->close();
