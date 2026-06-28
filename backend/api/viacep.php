<?php

function buscar_cep(string $cep): ?array {
    $cep_limpo = preg_replace('/\D/', '', $cep);
    if (strlen($cep_limpo) !== 8) return null;

    $ctx = stream_context_create(['http' => ['timeout' => 5]]);
    $json = @file_get_contents("https://viacep.com.br/ws/{$cep_limpo}/json/", false, $ctx);
    if ($json === false) return null;

    $dados = json_decode($json, true);
    if (!is_array($dados) || isset($dados['erro'])) return null;

    return $dados;
}
