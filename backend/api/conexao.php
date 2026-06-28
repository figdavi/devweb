<?php

$host   = "localhost";
$user   = "root";
$pass   = "devweb123";
$dbname = "servixus";

$con = mysqli_connect($host, $user, $pass, $dbname);
if (!$con) {
    header('Content-Type: application/json');
    echo json_encode(["sucesso" => false, "erro" => "Falha na conexão com o banco de dados."]);
    exit;
}
