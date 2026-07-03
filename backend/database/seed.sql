-- =============================================================================
-- SEED DE DADOS PARA TESTE — servixus
-- =============================================================================
--
-- A senha de todos os usuários de teste abaixo é 'senha123' (hash bcrypt já
-- embutido nos INSERTs). Para gerar um novo hash, caso necessário:
--   php -r "echo password_hash('senha123', PASSWORD_BCRYPT);"
--
-- =============================================================================
-- USUÁRIOS DE TESTE
-- =============================================================================
--   id | email                | senha    | tipo
--   ---+----------------------+----------+----------------------------
--    1 | joao@email.com       | senha123 | CLIENTE
--    2 | maria@email.com      | senha123 | CLIENTE
--    3 | carlos@email.com     | senha123 | PRESTADOR (Elétrica)
--    4 | ana@email.com        | senha123 | PRESTADOR (Hidráulica)
--
-- =============================================================================
-- AGENDAMENTOS DE TESTE (um por status)
-- =============================================================================
--   id | status                | quem              | endpoint para testar
--   ---+-----------------------+-------------------+-------------------------
--    1 | aguardando_orcamento  | João → Carlos     | agendamentos/orcamento.php
--    2 | orcamento_realizado   | Maria → Carlos    | agendamentos/confirmar.php
--                                                  | agendamentos/cancelar.php
--    3 | confirmado            | João → Ana        | agendamentos/iniciar.php
--                                                  | agendamentos/cancelar.php
--    4 | em_andamento          | Maria → Ana       | agendamentos/concluir.php
--    5 | concluido             | João → Carlos     | avaliacoes/create.php
--                                                  | (nota do prestador em aberto)
--    6 | cancelado             | Maria → Carlos    | histórico
--
-- =============================================================================

USE servixus;

-- Limpa na ordem correta (FKs)
DELETE FROM avaliacoes;
DELETE FROM agendamentos;
DELETE FROM disponibilidade;
DELETE FROM prestador_servicos;
DELETE FROM locais;
DELETE FROM servicos;
DELETE FROM prestadores;
DELETE FROM clientes;
DELETE FROM usuarios;
DELETE FROM categorias;

-- Reseta auto_increment
ALTER TABLE usuarios       AUTO_INCREMENT = 1;
ALTER TABLE categorias     AUTO_INCREMENT = 1;
ALTER TABLE servicos       AUTO_INCREMENT = 1;
ALTER TABLE locais         AUTO_INCREMENT = 1;
ALTER TABLE agendamentos   AUTO_INCREMENT = 1;

-- -----------------------------------------------------------------------------
-- Categorias
-- -----------------------------------------------------------------------------
INSERT INTO categorias (id_categoria, nome) VALUES
(1, 'Elétrica'),
(2, 'Hidráulica'),
(3, 'Limpeza');

-- -----------------------------------------------------------------------------
-- Usuários (senha para todos: senha123)
-- -----------------------------------------------------------------------------
INSERT INTO usuarios (id_usuario, email, senha, nome, telefone) VALUES
(1, 'joao@email.com',   '$2y$10$GYb.Vyx9Vizxzjepyiy3T.P0j3KM.oYpANK/Nun9rYOFPtPiI6iom', 'João Silva',         '(21) 91111-1111'),
(2, 'maria@email.com',  '$2y$10$GYb.Vyx9Vizxzjepyiy3T.P0j3KM.oYpANK/Nun9rYOFPtPiI6iom', 'Maria Souza',        '(22) 92222-2222'),
(3, 'carlos@email.com', '$2y$10$GYb.Vyx9Vizxzjepyiy3T.P0j3KM.oYpANK/Nun9rYOFPtPiI6iom', 'Carlos Eletricista', '(22) 93333-3333'),
(4, 'ana@email.com',    '$2y$10$GYb.Vyx9Vizxzjepyiy3T.P0j3KM.oYpANK/Nun9rYOFPtPiI6iom', 'Ana Encanadora',     '(22) 94444-4444');

-- -----------------------------------------------------------------------------
-- Clientes (João e Maria)
-- -----------------------------------------------------------------------------
INSERT INTO clientes (id_usuario) VALUES (1), (2);

-- -----------------------------------------------------------------------------
-- Prestadores
-- (CEP não é exposto publicamente — RNF06)
-- -----------------------------------------------------------------------------
INSERT INTO prestadores (id_usuario, id_categoria, descricao_profissional, cep, logradouro, bairro, cidade, estado) VALUES
(3, 1, '10 anos de experiência com instalações elétricas residenciais e comerciais.',
    '01310-100', 'Av. Paulista', 'Bela Vista', 'São Paulo', 'SP'),
(4, 2, 'Especialista em desentupimento e reparos hidráulicos com 8 anos de mercado.',
    '01310-200', 'Rua Augusta', 'Consolação', 'São Paulo', 'SP');

-- -----------------------------------------------------------------------------
-- Serviços do catálogo
-- (id_categoria é UNIQUE em servicos — um serviço por categoria)
-- -----------------------------------------------------------------------------
INSERT INTO servicos (id_servico, id_categoria, titulo, descricao) VALUES
(1, 1, 'Instalação e Reparos Elétricos',
    'Instalação de tomadas, interruptores, disjuntores e fiações.'),
(2, 2, 'Serviços Hidráulicos',
    'Desentupimento, troca de encanamentos e reparos de vazamentos.'),
(3, 3, 'Limpeza Residencial',
    'Limpeza completa de residências e apartamentos.');

-- -----------------------------------------------------------------------------
-- Serviços oferecidos por prestador
-- -----------------------------------------------------------------------------
INSERT INTO prestador_servicos (id_prestador, id_servico, tipo_cobranca, preco_base) VALUES
(3, 1, 'hora',    80.00),
(4, 2, 'servico', 150.00);

-- -----------------------------------------------------------------------------
-- Locais dos clientes
-- -----------------------------------------------------------------------------
INSERT INTO locais (id_local, id_cliente, nome, cep, logradouro, numero, bairro, complemento, cidade, estado) VALUES
(1, 1, 'Casa',         '05407-002', 'Rua Oscar Freire',           '123',  'Jardins',   NULL,      'São Paulo', 'SP'),
(2, 2, 'Apartamento',  '04538-133', 'Av. Brigadeiro Faria Lima',  '456',  'Itaim Bibi','Apto 42', 'São Paulo', 'SP');

-- -----------------------------------------------------------------------------
-- Disponibilidade dos prestadores (seg–sex)
-- dia_semana: 0=Dom 1=Seg 2=Ter 3=Qua 4=Qui 5=Sex 6=Sáb
-- -----------------------------------------------------------------------------
INSERT INTO disponibilidade (id_prestador, dia_semana, hora_inicio, hora_fim) VALUES
(3, 1, '08:00:00', '18:00:00'),
(3, 2, '08:00:00', '18:00:00'),
(3, 3, '08:00:00', '18:00:00'),
(3, 4, '08:00:00', '18:00:00'),
(3, 5, '08:00:00', '18:00:00'),
(4, 1, '08:00:00', '17:00:00'),
(4, 2, '08:00:00', '17:00:00'),
(4, 3, '08:00:00', '17:00:00'),
(4, 4, '08:00:00', '17:00:00'),
(4, 5, '08:00:00', '17:00:00');

-- -----------------------------------------------------------------------------
-- Agendamentos (um por status para cobrir todos os fluxos)
-- -----------------------------------------------------------------------------
INSERT INTO agendamentos
    (id_agendamento, id_cliente, id_prestador, id_servico, id_local,
     descricao, tipo_cobranca, valor,
     data_hora_criacao,    data_hora_inicio,      data_hora_fim,
     cliente_confirmou, status)
VALUES
-- 1: aguardando_orcamento — testar POST agendamentos/orcamento.php
(1, 1, 3, 1, 1,
 'Tomada da sala com curto, preciso de ajuda urgente.',
 'hora', 0.00,
 '2026-06-20 10:00:00', '2026-06-28 09:00:00', '2026-06-28 11:00:00',
 FALSE, 'aguardando_orcamento'),

-- 2: orcamento_realizado — testar POST agendamentos/confirmar.php ou cancelar.php
(2, 2, 3, 1, 2,
 'Instalação de 3 tomadas novas na cozinha.',
 'hora', 120.00,
 '2026-06-21 14:00:00', '2026-06-29 10:00:00', '2026-06-29 12:00:00',
 FALSE, 'orcamento_realizado'),

-- 3: confirmado — testar POST agendamentos/iniciar.php ou cancelar.php
(3, 1, 4, 2, 1,
 'Pia do banheiro entupida há 2 dias.',
 'servico', 150.00,
 '2026-06-22 09:00:00', '2026-06-30 14:00:00', '2026-06-30 16:00:00',
 TRUE, 'confirmado'),

-- 4: em_andamento — testar POST agendamentos/concluir.php
(4, 2, 4, 2, 2,
 'Vazamento embaixo da pia da cozinha.',
 'servico', 180.00,
 '2026-06-24 11:00:00', '2026-06-26 09:00:00', '2026-06-26 11:00:00',
 TRUE, 'em_andamento'),

-- 5: concluido — testar POST avaliacoes/create.php (nota do prestador em aberto)
(5, 1, 3, 1, 1,
 'Chuveiro elétrico sem funcionar.',
 'hora', 160.00,
 '2026-06-10 10:00:00', '2026-06-15 09:00:00', '2026-06-15 11:00:00',
 TRUE, 'concluido'),

-- 6: cancelado — histórico
(6, 2, 3, 1, 2,
 'Troca de disjuntor.',
 'hora', 0.00,
 '2026-06-19 16:00:00', '2026-06-25 10:00:00', '2026-06-25 12:00:00',
 FALSE, 'cancelado');

-- -----------------------------------------------------------------------------
-- Avaliações
-- Agendamento 5 concluído: cliente avaliou, prestador ainda não
-- (permite testar POST avaliacoes/create.php com id_usuario=3)
-- -----------------------------------------------------------------------------
INSERT INTO avaliacoes (id_agendamento, cliente_nota, cliente_comentario, prestador_nota, prestador_comentario) VALUES
(5, 5, 'Excelente serviço, muito pontual e eficiente!', NULL, NULL);
