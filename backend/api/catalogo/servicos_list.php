<?php

header('Content-Type: application/json');
require_once '../conexao.php';

$sql = "SELECT s.id_servico, s.titulo, s.descricao, c.id_categoria, c.nome AS categoria
        FROM servicos s
        JOIN categorias c ON c.id_categoria = s.id_categoria
        ORDER BY c.nome, s.titulo";
$stmt = $con->prepare($sql);
$stmt->execute();
$result = $stmt->get_result();

$dados = [];
while ($linha = $result->fetch_assoc()) {
    $dados[] = $linha;
}

echo json_encode(count($dados) > 0 ? $dados : ["erro" => "Nenhum serviço encontrado."]);

$stmt->close();
$con->close();
