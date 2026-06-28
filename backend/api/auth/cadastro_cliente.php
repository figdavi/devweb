<?php

header('Content-Type: application/json');
require_once '../conexao.php';
require_once '../viacep.php';

$email      = $_POST['email'] ?? '';
$senha      = password_hash($_POST['senha'] ?? '', PASSWORD_BCRYPT);
$nome       = $_POST['nome'] ?? '';
$telefone   = $_POST['telefone'] ?? '';
$cep        = $_POST['cep'] ?? '';
$numero     = $_POST['numero'] ?? '';
$complemento = $_POST['complemento'] ?? null;
$nome_local = $_POST['nome_local'] ?? 'Casa';

$endereco = buscar_cep($cep);
if ($endereco === null) {
    echo json_encode(["sucesso" => false, "erro" => "CEP inválido ou não encontrado."]);
    exit;
}

$logradouro = $endereco['logradouro'];
$bairro     = $endereco['bairro'];
$cidade     = $endereco['localidade'];
$estado     = $endereco['uf'];

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

if (!$stmt2->execute()) {
    $con->rollback();
    echo json_encode(["sucesso" => false, "erro" => "Erro ao cadastrar cliente: " . $stmt2->error]);
    $stmt2->close();
    $con->close();
    exit;
}

$stmt2->close();

$sql3 = "INSERT INTO locais (id_cliente, nome, cep, logradouro, numero, bairro, complemento, cidade, estado)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
$stmt3 = $con->prepare($sql3);
$stmt3->bind_param("issssssss", $id_usuario, $nome_local, $cep, $logradouro, $numero, $bairro, $complemento, $cidade, $estado);

if ($stmt3->execute()) {
    $con->commit();
    echo json_encode(["sucesso" => true, "mensagem" => "Cliente cadastrado com sucesso!", "id_usuario" => $id_usuario]);
} else {
    $con->rollback();
    echo json_encode(["sucesso" => false, "erro" => "Erro ao salvar endereço: " . $stmt3->error]);
}

$stmt3->close();
$con->close();
