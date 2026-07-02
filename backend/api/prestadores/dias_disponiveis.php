<?php
ob_start();

header('Content-Type: application/json');
require_once '../conexao.php';

$id_prestador = $_GET['id_prestador'] ?? null;

if (!$id_prestador) {
    ob_clean(); echo json_encode(["erro" => "Parâmetros inválidos."]);
    $con->close();
    exit;
}

$stmt = $con->prepare("SELECT DISTINCT dia_semana FROM disponibilidade WHERE id_prestador = ?");
$stmt->bind_param("i", $id_prestador);
$stmt->execute();
$res  = $stmt->get_result();
$dias = [];
while ($row = $res->fetch_assoc()) {
    $dias[] = (int) $row['dia_semana'];
}
$res->free();
$stmt->close();
$con->close();

ob_clean(); echo json_encode(["dias" => $dias]);
