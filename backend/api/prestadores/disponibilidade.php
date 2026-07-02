<?php
ob_start();

header('Content-Type: application/json');
require_once '../conexao.php';

$id_prestador = $_GET['id_prestador'] ?? null;
$data         = $_GET['data'] ?? null; // "YYYY-MM-DD"

if (!$id_prestador || !$data || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $data)) {
    ob_clean(); echo json_encode(["erro" => "Parâmetros inválidos."]);
    $con->close();
    exit;
}

// dia_semana: 0=Dom, 1=Seg, ..., 6=Sab  (date('w') já usa esta convenção)
$dia_semana = (int) date('w', strtotime($data));

// Busca janela de disponibilidade do prestador para este dia
$stmtD = $con->prepare("SELECT hora_inicio, hora_fim FROM disponibilidade WHERE id_prestador = ? AND dia_semana = ?");
$stmtD->bind_param("ii", $id_prestador, $dia_semana);
$stmtD->execute();
$resD = $stmtD->get_result();
$disp = $resD->fetch_assoc();
$resD->free();
$stmtD->close();

if (!$disp) {
    ob_clean(); echo json_encode(["slots" => [], "mensagem" => "Prestador não atende neste dia."]);
    $con->close();
    exit;
}

// Busca agendamentos não cancelados que cruzam este dia (inclui reservas que começaram
// em dia anterior e ainda não terminaram, já que um serviço pode se estender por vários dias)
$inicio_dia = $data . ' 00:00:00';
$fim_dia    = $data . ' 23:59:59';
$stmtAg = $con->prepare(
    "SELECT data_hora_inicio, data_hora_fim FROM agendamentos
     WHERE id_prestador = ? AND status != 'cancelado'
       AND data_hora_inicio <= ? AND data_hora_fim >= ?"
);
$stmtAg->bind_param("iss", $id_prestador, $fim_dia, $inicio_dia);
$stmtAg->execute();
$resAg    = $stmtAg->get_result();
$bookings = [];
while ($row = $resAg->fetch_assoc()) {
    $bookings[] = [
        "inicio" => strtotime($row['data_hora_inicio']),
        "fim"    => strtotime($row['data_hora_fim']),
    ];
}
$resAg->free();
$stmtAg->close();
$con->close();

// Gera slots de 1h dentro da janela de disponibilidade
$slots       = [];
$slot_dur    = 3600; // 1 hora
$janela_ini  = strtotime($data . ' ' . $disp['hora_inicio']);
$janela_fim  = strtotime($data . ' ' . $disp['hora_fim']);
$current     = $janela_ini;

while ($current + $slot_dur <= $janela_fim) {
    $slot_fim = $current + $slot_dur;

    // Verifica sobreposição com bookings existentes
    $ocupado = false;
    foreach ($bookings as $ag) {
        // Ignora bookings de duração zero (placeholder antigo)
        if ($ag['inicio'] === $ag['fim']) continue;
        if ($current < $ag['fim'] && $slot_fim > $ag['inicio']) {
            $ocupado = true;
            break;
        }
    }

    if (!$ocupado) {
        $slots[] = [
            "inicio" => date('H:i', $current),
            "fim"    => date('H:i', $slot_fim),
        ];
    }

    $current += $slot_dur;
}

// Ocupados: intervalos já reservados neste dia, recortados para os limites do dia
// (informativo para o cliente saber quais horários evitar ao montar o agendamento)
$dia_ini_ts = strtotime($inicio_dia);
$dia_fim_ts = strtotime($fim_dia);
$ocupados = [];
foreach ($bookings as $ag) {
    if ($ag['inicio'] === $ag['fim']) continue; // placeholder antigo
    $ocupados[] = [
        "inicio" => date('H:i', max($ag['inicio'], $dia_ini_ts)),
        "fim"    => date('H:i', min($ag['fim'], $dia_fim_ts)),
    ];
}
usort($ocupados, fn($a, $b) => strcmp($a['inicio'], $b['inicio']));

ob_clean(); echo json_encode([
    "slots"    => $slots,
    "janela"   => ["inicio" => substr($disp['hora_inicio'], 0, 5), "fim" => substr($disp['hora_fim'], 0, 5)],
    "ocupados" => $ocupados,
]);
