<?php

header('Content-Type: application/json');
require_once '../conexao.php';

$email = $_POST['email'] ?? '';
$senha = $_POST['senha'] ?? '';

$sql = "SELECT id_usuario, nome, senha FROM usuarios WHERE email = ?";
$stmt = $con->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if (!($usuario = $result->fetch_assoc())) {
    echo json_encode(["sucesso" => false, "erro" => "Credenciais inválidas."]);
    $stmt->close();
    $con->close();
    exit;
}

if (!password_verify($senha, $usuario['senha'])) {
    echo json_encode(["sucesso" => false, "erro" => "Credenciais inválidas."]);
    $stmt->close();
    $con->close();
    exit;
}

$stmt->close();
$id = $usuario['id_usuario'];

$sqlTipo = "SELECT 'cliente' AS tipo FROM clientes WHERE id_usuario = ?
            UNION
            SELECT 'prestador' AS tipo FROM prestadores WHERE id_usuario = ?";
$stmt2 = $con->prepare($sqlTipo);
$stmt2->bind_param("ii", $id, $id);
$stmt2->execute();
$tipo = $stmt2->get_result()->fetch_assoc()['tipo'] ?? null;

$stmt2->close();
$con->close();

echo json_encode([
    "sucesso"    => true,
    "id_usuario" => $id,
    "nome"       => $usuario['nome'],
    "tipo"       => $tipo
]);
