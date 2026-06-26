<?php

header('Content-Type: application/json');
// Sessões PHP a implementar (RNF05)
echo json_encode(["sucesso" => true, "mensagem" => "Logout realizado."]);
