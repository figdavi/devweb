<?php

header('Content-Type: application/json');
require_once '../../conexao.php';

$id_usuario       = $_POST['id_usuario'] ?? null;
$disponibilidades = json_decode($_POST['disponibilidades'] ?? '[]', true);

if (!is_array($disponibilidades) || empty($disponibilidades)) {
    echo json_encode(["sucesso" => false, "erro" => "Lista de disponibilidades inválida."]);
    $con->close();
    exit;
}

$con->begin_transaction();

$sqlDel = "DELETE FROM disponibilidade WHERE id_prestador = ?";
$stmtDel = $con->prepare($sqlDel);
$stmtDel->bind_param("i", $id_usuario);

if (!$stmtDel->execute()) {
    $con->rollback();
    echo json_encode(["sucesso" => false, "erro" => "Erro ao limpar disponibilidade."]);
    $stmtDel->close();
    $con->close();
    exit;
}
$stmtDel->close();

$sqlIns  = "INSERT INTO disponibilidade (id_prestador, dia_semana, hora_inicio, hora_fim) VALUES (?, ?, ?, ?)";
$stmtIns = $con->prepare($sqlIns);

foreach ($disponibilidades as $d) {
    $dia = $d['dia_semana'];
    $ini = $d['hora_inicio'];
    $fim = $d['hora_fim'];
    $stmtIns->bind_param("iiss", $id_usuario, $dia, $ini, $fim);
    if (!$stmtIns->execute()) {
        $con->rollback();
        echo json_encode(["sucesso" => false, "erro" => "Erro ao inserir disponibilidade: " . $stmtIns->error]);
        $stmtIns->close();
        $con->close();
        exit;
    }
}

$stmtIns->close();
$con->commit();
echo json_encode(["sucesso" => true, "mensagem" => "Disponibilidade atualizada com sucesso!"]);
$con->close();
