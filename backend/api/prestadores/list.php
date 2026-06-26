<?php

header('Content-Type: application/json');
require_once '../conexao.php';

$id_categoria = $_GET['id_categoria'] ?? null;
$preco_min    = $_GET['preco_min'] ?? null;
$preco_max    = $_GET['preco_max'] ?? null;

$sql = "SELECT p.id_usuario, u.nome, p.descricao_profissional, p.cidade, p.estado,
               c.nome AS categoria,
               MIN(ps.preco_base) AS preco_minimo,
               ROUND(AVG(a.cliente_nota), 1) AS media_avaliacao
        FROM prestadores p
        JOIN usuarios u ON u.id_usuario = p.id_usuario
        JOIN categorias c ON c.id_categoria = p.id_categoria
        LEFT JOIN prestador_servicos ps ON ps.id_prestador = p.id_usuario
        LEFT JOIN agendamentos ag ON ag.id_prestador = p.id_usuario
        LEFT JOIN avaliacoes a ON a.id_agendamento = ag.id_agendamento
        WHERE 1=1";

$tipos  = "";
$params = [];

if ($id_categoria !== null) {
    $sql .= " AND p.id_categoria = ?";
    $tipos .= "i";
    $params[] = (int) $id_categoria;
}
if ($preco_min !== null) {
    $sql .= " AND ps.preco_base >= ?";
    $tipos .= "d";
    $params[] = (float) $preco_min;
}
if ($preco_max !== null) {
    $sql .= " AND ps.preco_base <= ?";
    $tipos .= "d";
    $params[] = (float) $preco_max;
}

$sql .= " GROUP BY p.id_usuario ORDER BY media_avaliacao DESC";

$stmt = $con->prepare($sql);
if (!empty($params)) {
    $stmt->bind_param($tipos, ...$params);
}
$stmt->execute();
$result = $stmt->get_result();

$dados = [];
while ($linha = $result->fetch_assoc()) {
    $dados[] = $linha;
}

echo json_encode(count($dados) > 0 ? $dados : ["erro" => "Nenhum prestador encontrado."]);

$stmt->close();
$con->close();
