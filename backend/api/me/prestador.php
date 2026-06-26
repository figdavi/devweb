<?php

header('Content-Type: application/json');
require_once '../conexao.php';

$id_usuario             = $_POST['id_usuario'] ?? null;
$descricao_profissional = $_POST['descricao_profissional'] ?? null;
$cep                    = $_POST['cep'] ?? null;
$logradouro             = $_POST['logradouro'] ?? null;
$bairro                 = $_POST['bairro'] ?? null;
$cidade                 = $_POST['cidade'] ?? null;
$estado                 = $_POST['estado'] ?? null;
$id_categoria           = $_POST['id_categoria'] ?? null;

$campos = [];
$tipos  = "";
$params = [];

if ($descricao_profissional !== null) { $campos[] = "descricao_profissional = ?"; $tipos .= "s"; $params[] = $descricao_profissional; }
if ($cep !== null)                    { $campos[] = "cep = ?";                    $tipos .= "s"; $params[] = $cep; }
if ($logradouro !== null)             { $campos[] = "logradouro = ?";             $tipos .= "s"; $params[] = $logradouro; }
if ($bairro !== null)                 { $campos[] = "bairro = ?";                 $tipos .= "s"; $params[] = $bairro; }
if ($cidade !== null)                 { $campos[] = "cidade = ?";                 $tipos .= "s"; $params[] = $cidade; }
if ($estado !== null)                 { $campos[] = "estado = ?";                 $tipos .= "s"; $params[] = $estado; }
if ($id_categoria !== null)           { $campos[] = "id_categoria = ?";           $tipos .= "i"; $params[] = $id_categoria; }

if (empty($campos)) {
    echo json_encode(["sucesso" => false, "erro" => "Nenhum campo para atualizar."]);
    $con->close();
    exit;
}

$sql = "UPDATE prestadores SET " . implode(", ", $campos) . " WHERE id_usuario = ?";
$tipos .= "i";
$params[] = $id_usuario;

$stmt = $con->prepare($sql);
$stmt->bind_param($tipos, ...$params);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(["sucesso" => true, "mensagem" => "Perfil atualizado com sucesso!"]);
    } else {
        echo json_encode(["sucesso" => false, "erro" => "Prestador não encontrado."]);
    }
} else {
    echo json_encode(["sucesso" => false, "erro" => "Erro ao atualizar perfil: " . $stmt->error]);
}

$stmt->close();
$con->close();
