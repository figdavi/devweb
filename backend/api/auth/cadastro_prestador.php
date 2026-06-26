<?php

header('Content-Type: application/json');
require_once '../conexao.php';

$email                  = $_POST['email'] ?? '';
$senha                  = password_hash($_POST['senha'] ?? '', PASSWORD_BCRYPT);
$nome                   = $_POST['nome'] ?? '';
$telefone               = $_POST['telefone'] ?? '';
$id_categoria           = $_POST['id_categoria'] ?? null;
$descricao_profissional = $_POST['descricao_profissional'] ?? null;
$cep                    = $_POST['cep'] ?? '';
$logradouro             = $_POST['logradouro'] ?? '';
$bairro                 = $_POST['bairro'] ?? '';
$cidade                 = $_POST['cidade'] ?? '';
$estado                 = $_POST['estado'] ?? '';

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

$sql2 = "INSERT INTO prestadores (id_usuario, id_categoria, descricao_profissional, cep, logradouro, bairro, cidade, estado)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
$stmt2 = $con->prepare($sql2);
$stmt2->bind_param("iissssss", $id_usuario, $id_categoria, $descricao_profissional, $cep, $logradouro, $bairro, $cidade, $estado);

if ($stmt2->execute()) {
    $con->commit();
    echo json_encode(["sucesso" => true, "mensagem" => "Prestador cadastrado com sucesso!", "id_usuario" => $id_usuario]);
} else {
    $con->rollback();
    echo json_encode(["sucesso" => false, "erro" => "Erro ao cadastrar prestador: " . $stmt2->error]);
}

$stmt2->close();
$con->close();
