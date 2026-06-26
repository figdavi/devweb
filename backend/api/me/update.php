<?php

header('Content-Type: application/json');
require_once '../conexao.php';

$id_usuario = $_POST['id_usuario'] ?? null;
$nome       = $_POST['nome'] ?? null;
$telefone   = $_POST['telefone'] ?? null;
$senha      = isset($_POST['senha']) ? password_hash($_POST['senha'], PASSWORD_BCRYPT) : null;

$campos = [];
$tipos  = "";
$params = [];

if ($nome !== null)     { $campos[] = "nome = ?";     $tipos .= "s"; $params[] = $nome; }
if ($telefone !== null) { $campos[] = "telefone = ?"; $tipos .= "s"; $params[] = $telefone; }
if ($senha !== null)    { $campos[] = "senha = ?";    $tipos .= "s"; $params[] = $senha; }

if (empty($campos)) {
    echo json_encode(["sucesso" => false, "erro" => "Nenhum campo para atualizar."]);
    $con->close();
    exit;
}

$sql = "UPDATE usuarios SET " . implode(", ", $campos) . " WHERE id_usuario = ?";
$tipos .= "i";
$params[] = $id_usuario;

$stmt = $con->prepare($sql);
$stmt->bind_param($tipos, ...$params);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(["sucesso" => true, "mensagem" => "Dados atualizados com sucesso!"]);
    } else {
        echo json_encode(["sucesso" => false, "erro" => "Usuário não encontrado."]);
    }
} else {
    echo json_encode(["sucesso" => false, "erro" => "Erro ao atualizar: " . $stmt->error]);
}

$stmt->close();
$con->close();
