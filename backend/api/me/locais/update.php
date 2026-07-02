<?php

header('Content-Type: application/json');
require_once '../../conexao.php';

$id_local    = $_POST['id_local'] ?? null;
$nome        = $_POST['nome'] ?? null;
$cep         = $_POST['cep'] ?? null;
$logradouro  = $_POST['logradouro'] ?? null;
$numero      = $_POST['numero'] ?? null;
$bairro      = $_POST['bairro'] ?? null;
$complemento = $_POST['complemento'] ?? null;
$cidade      = $_POST['cidade'] ?? null;
$estado      = $_POST['estado'] ?? null;

$campos = [];
$tipos  = "";
$params = [];

if ($nome !== null)        { $campos[] = "nome = ?";        $tipos .= "s"; $params[] = $nome; }
if ($cep !== null)         { $campos[] = "cep = ?";         $tipos .= "s"; $params[] = $cep; }
if ($logradouro !== null)  { $campos[] = "logradouro = ?";  $tipos .= "s"; $params[] = $logradouro; }
if ($numero !== null)      { $campos[] = "numero = ?";      $tipos .= "s"; $params[] = $numero; }
if ($bairro !== null)      { $campos[] = "bairro = ?";      $tipos .= "s"; $params[] = $bairro; }
if ($complemento !== null) { $campos[] = "complemento = ?"; $tipos .= "s"; $params[] = $complemento; }
if ($cidade !== null)      { $campos[] = "cidade = ?";      $tipos .= "s"; $params[] = $cidade; }
if ($estado !== null)      { $campos[] = "estado = ?";      $tipos .= "s"; $params[] = $estado; }

if (empty($campos)) {
    echo json_encode(["sucesso" => false, "erro" => "Nenhum campo para atualizar."]);
    $con->close();
    exit;
}

$sql = "UPDATE locais SET " . implode(", ", $campos) . " WHERE id_local = ?";
$tipos .= "i";
$params[] = $id_local;

$stmt = $con->prepare($sql);
$stmt->bind_param($tipos, ...$params);

if ($stmt->execute()) {
    echo json_encode(["sucesso" => true, "mensagem" => "Local atualizado com sucesso!"]);
} else {
    echo json_encode(["sucesso" => false, "erro" => "Erro ao atualizar local: " . $stmt->error]);
}

$stmt->close();
$con->close();
