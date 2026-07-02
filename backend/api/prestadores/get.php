<?php
ob_start();

header('Content-Type: application/json');
require_once '../conexao.php';

$id_usuario = $_GET['id_usuario'] ?? null;

// Perfil básico sem CEP exato (RNF06)
$sqlPerfil = "SELECT p.id_usuario, u.nome, p.descricao_profissional, p.cidade, p.estado,
                     c.nome AS categoria
              FROM prestadores p
              JOIN usuarios u ON u.id_usuario = p.id_usuario
              JOIN categorias c ON c.id_categoria = p.id_categoria
              WHERE p.id_usuario = ?";
$stmt = $con->prepare($sqlPerfil);
$stmt->bind_param("i", $id_usuario);
$stmt->execute();
$res1  = $stmt->get_result();
$perfil = $res1->fetch_assoc();
$res1->free();
$stmt->close();

if (!$perfil) {
    ob_clean(); echo json_encode(["erro" => "Prestador não encontrado."]);
    $con->close();
    exit;
}

$sqlServicos = "SELECT s.id_servico, s.titulo, s.descricao, ps.tipo_cobranca, ps.preco_base
                FROM prestador_servicos ps
                JOIN servicos s ON s.id_servico = ps.id_servico
                WHERE ps.id_prestador = ?";
$stmt2 = $con->prepare($sqlServicos);
$stmt2->bind_param("i", $id_usuario);
$stmt2->execute();
$servicos = [];
$res2 = $stmt2->get_result();
while ($s = $res2->fetch_assoc()) {
    $servicos[] = $s;
}
$res2->free();
$stmt2->close();

$sqlAval = "SELECT a.cliente_nota, a.cliente_comentario, u.nome AS nome_cliente
            FROM avaliacoes a
            JOIN agendamentos ag ON ag.id_agendamento = a.id_agendamento
            JOIN usuarios u ON u.id_usuario = ag.id_cliente
            WHERE ag.id_prestador = ? AND a.cliente_nota IS NOT NULL";
$stmt3 = $con->prepare($sqlAval);
$stmt3->bind_param("i", $id_usuario);
$stmt3->execute();
$avaliacoes = [];
$res3 = $stmt3->get_result();
while ($av = $res3->fetch_assoc()) {
    $avaliacoes[] = $av;
}
$res3->free();
$stmt3->close();
$con->close();

$perfil['servicos']   = $servicos;
$perfil['avaliacoes'] = $avaliacoes;
ob_clean(); echo json_encode($perfil);
