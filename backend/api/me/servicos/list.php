<?php

header('Content-Type: application/json');
require_once '../../conexao.php';

$id_usuario = $_GET['id_usuario'] ?? null;

$sql = "SELECT ps.id_servico, s.titulo, s.descricao, ps.tipo_cobranca, ps.preco_base
        FROM prestador_servicos ps
        JOIN servicos s ON s.id_servico = ps.id_servico
        WHERE ps.id_prestador = ?";
$stmt = $con->prepare($sql);
$stmt->bind_param("i", $id_usuario);
$stmt->execute();
$result = $stmt->get_result();

$dados = [];
while ($linha = $result->fetch_assoc()) {
    $dados[] = $linha;
}

echo json_encode(count($dados) > 0 ? $dados : ["erro" => "Nenhum serviço cadastrado."]);

$stmt->close();
$con->close();
