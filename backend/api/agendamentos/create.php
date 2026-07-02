<?php
ob_start();

header('Content-Type: application/json');
require_once '../conexao.php';

$id_cliente   = $_POST['id_usuario']   ?? null;
$id_prestador = $_POST['id_prestador'] ?? null;
$id_servico   = $_POST['id_servico']   ?? null;
$id_local     = $_POST['id_local']     ?? null;
$descricao    = $_POST['descricao']    ?? null;

// datetime-local sends "2026-07-14T05:51" — convert to MySQL "Y-m-d H:i:s"
function normalizar_datetime(?string $v): ?string {
    if (empty($v)) return null;
    $v = str_replace('T', ' ', $v);
    if (strlen($v) === 16) $v .= ':00';
    return $v;
}

$data_hora_inicio  = normalizar_datetime($_POST['data_hora_inicio'] ?? '');
$data_hora_fim     = normalizar_datetime($_POST['data_hora_fim'] ?? '');
$data_hora_criacao = date('Y-m-d H:i:s');

if (!$data_hora_inicio || !$data_hora_fim) {
    ob_clean(); echo json_encode(["sucesso" => false, "erro" => "Data e hora de início e término são obrigatórias."]);
    $con->close();
    exit;
}
if (strtotime($data_hora_fim) <= strtotime($data_hora_inicio)) {
    ob_clean(); echo json_encode(["sucesso" => false, "erro" => "A data e hora de término devem ser posteriores ao início."]);
    $con->close();
    exit;
}

// ── Verificar que o início cai dentro do horário de trabalho do prestador ──
// dia_semana: 0=Dom, 1=Seg, ..., 6=Sab  (DAYOFWEEK retorna 1=Dom, logo -1)
$sqlDisp = "SELECT 1 FROM disponibilidade
            WHERE id_prestador = ?
              AND dia_semana   = (DAYOFWEEK(?) - 1)
              AND hora_inicio  <= TIME(?)
              AND hora_fim     >  TIME(?)";
$stmtDisp = $con->prepare($sqlDisp);
$stmtDisp->bind_param("isss", $id_prestador, $data_hora_inicio, $data_hora_inicio, $data_hora_inicio);
$stmtDisp->execute();
$resDisp  = $stmtDisp->get_result();
$disponivel = $resDisp->num_rows > 0;
$resDisp->free();
$stmtDisp->close();

if (!$disponivel) {
    ob_clean(); echo json_encode(["sucesso" => false, "erro" => "O prestador não está disponível neste dia ou horário."]);
    $con->close();
    exit;
}

// ── Verificar conflito com outros agendamentos do prestador (o serviço pode
//    se estender por vários dias, então comparamos os intervalos completos) ──
$sqlConflito = "SELECT 1 FROM agendamentos
                WHERE id_prestador = ? AND status != 'cancelado'
                  AND data_hora_inicio < ? AND data_hora_fim > ?";
$stmtConflito = $con->prepare($sqlConflito);
$stmtConflito->bind_param("iss", $id_prestador, $data_hora_fim, $data_hora_inicio);
$stmtConflito->execute();
$resConflito = $stmtConflito->get_result();
$temConflito = $resConflito->num_rows > 0;
$resConflito->free();
$stmtConflito->close();

if ($temConflito) {
    ob_clean(); echo json_encode(["sucesso" => false, "erro" => "Este horário conflita com outro agendamento do prestador."]);
    $con->close();
    exit;
}

// ── Verificar que o prestador oferece o serviço ────────────────────────────
// tipo_cobranca é apenas um placeholder aqui: o valor real do agendamento
// (valor e tipo_cobranca definitivos) é definido pelo prestador no orçamento
// (agendamentos/orcamento.php), não pelo cliente na criação da solicitação.
$sqlPS = "SELECT tipo_cobranca FROM prestador_servicos WHERE id_prestador = ? AND id_servico = ?";
$stmtPS = $con->prepare($sqlPS);
$stmtPS->bind_param("ii", $id_prestador, $id_servico);
$stmtPS->execute();
$resPS = $stmtPS->get_result();
$ps    = $resPS->fetch_assoc();
$resPS->free();
$stmtPS->close();

if (!$ps) {
    ob_clean(); echo json_encode(["sucesso" => false, "erro" => "Prestador não oferece este serviço."]);
    $con->close();
    exit;
}

$tipo_cobranca = $ps['tipo_cobranca'];
$valor         = 0.00;

$sql = "INSERT INTO agendamentos
            (id_cliente, id_prestador, id_servico, id_local, descricao, tipo_cobranca, valor,
             data_hora_criacao, data_hora_inicio, data_hora_fim)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
$stmt = $con->prepare($sql);
$stmt->bind_param("iiiissdsss",
    $id_cliente, $id_prestador, $id_servico, $id_local,
    $descricao, $tipo_cobranca, $valor,
    $data_hora_criacao, $data_hora_inicio, $data_hora_fim
);

if ($stmt->execute()) {
    ob_clean(); echo json_encode(["sucesso" => true, "mensagem" => "Solicitação enviada com sucesso!", "id_agendamento" => $con->insert_id]);
} else {
    ob_clean(); echo json_encode(["sucesso" => false, "erro" => "Erro ao criar agendamento: " . $stmt->error]);
}

$stmt->close();
$con->close();
