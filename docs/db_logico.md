# Modelo Lógico

## Usuário
```
usuarios (
    id_usuario     PK  INT AUTO_INCREMENT,
    email              VARCHAR(255)  UNIQUE,
    senha              VARCHAR(255),          -- hash BCrypt
    nome               VARCHAR(150),
    telefone           VARCHAR(20)
)
```



## Prestador
Especialização de Usuário (1:1)
```
prestadores (
    id_prestador   PK  INT AUTO_INCREMENT,
    id_usuario     FK  INT  UNIQUE  -> usuarios(id_usuario)  ON DELETE CASCADE,
    id_categoria   FK  INT          -> categorias(id_categoria),
    descricao_profissional  TEXT,
    cep                     VARCHAR(9)
)
```



## Cliente
Especialização de Usuário (1:1)
```
clientes (
    id_cliente     PK  INT AUTO_INCREMENT,
    id_usuario     FK  INT  UNIQUE  -> usuarios(id_usuario)  ON DELETE CASCADE
)
```



## Local
Entidade própria, pertence a um Cliente (1 cliente : N locais).
```
locais (
    id_local       PK  INT AUTO_INCREMENT,
    id_cliente     FK  INT  -> clientes(id_cliente)  ON DELETE CASCADE,
    nome               VARCHAR(100),
    cep                VARCHAR(9),
    logradouro         VARCHAR(255),
    numero             VARCHAR(20),
    bairro             VARCHAR(100),
    complemento        VARCHAR(255),
    cidade             VARCHAR(100),
    estado             VARCHAR(50),
    pais               VARCHAR(50)
)
```



## Disponibilidade
Entidade fraca de Prestador. PK composta garante 1 bloco por dia por prestador.
```
disponibilidade (
    id_prestador   FK  INT  -> prestadores(id_prestador)  ON DELETE CASCADE,
    dia_semana         TINYINT,   -- 1=Dom ... 7=Sáb (DAYOFWEEK padrão MySQL)
    hora_inicio        TIME,
    hora_fim           TIME,
    PRIMARY KEY (id_prestador, dia_semana)
)
```



## Categoria
Catálogo global controlado pelo sistema.
```
categorias (
    id_categoria   PK  INT AUTO_INCREMENT,
    nome               VARCHAR(100)  UNIQUE
)
```


## Serviços
Catálogo global de tipos de serviço, vinculado a uma Categoria.
```
servicos (
    id_servico     PK  INT AUTO_INCREMENT,
    id_categoria   FK  INT  -> categorias(id_categoria),
    titulo             VARCHAR(150),
    descricao  TEXT
)
```



## Prestador Serviço
Entidade associativa N:M entre Prestador e Serviços.
Representa o catálogo pessoal do prestador com preço e tipo de cobrança.
```
prestador_servicos (
    id_prestador   FK  INT  -> prestadores(id_prestador)  ON DELETE CASCADE,
    id_servico     FK  INT  -> servicos(id_servico)        ON DELETE CASCADE,
    tipo_cobranca      ENUM('hora', 'diaria', 'projeto'),
    preco_base         DECIMAL(10,2),
    PRIMARY KEY (id_prestador, id_servico)
)
```



## Agendamento
Entidade associativa central. Liga Cliente + Prestador Serviço + Local.
```
agendamentos (
    id_agendamento    PK  INT AUTO_INCREMENT,
    id_cliente        FK  INT  -> clientes(id_cliente),
    id_prestador      FK  INT  -> prestadores(id_prestador),   -- parte da FK composta de prestador_servicos
    id_servico        FK  INT  -> servicos(id_servico),        -- parte da FK composta de prestador_servicos
    id_local          FK  INT  -> locais(id_local),
    descricao    TEXT,
    valor                 DECIMAL(10,2)  ?,                   -- preenchido pelo prestador no orçamento
    data_hora_criacao          DATETIME       DEFAULT CURRENT_TIMESTAMP,
    data_hora_inicio       DATETIME,
    data_hora_fim          DATETIME,
    status                ENUM(
                              'Pendente',
                              'Orcamento Enviado',
                              'Aguardando Confirmacao',
                              'Confirmado',
                              'Em Andamento',
                              'Concluido',
                              'Cancelado'
                          )  DEFAULT 'Pendente',
    FOREIGN KEY (id_prestador, id_servico) -> prestador_servicos(id_prestador, id_servico)
)
```



## Avaliação
Entidade fraca de Agendamento (0..1 por agendamento).
As duas avaliações mútuas ficam na mesma linha — nullable até serem preenchidas.
```
avaliacoes (
    id_agendamento       PK FK  INT  -> agendamentos(id_agendamento)  ON DELETE CASCADE,
    cliente_nota                TINYINT  ?,   -- 1 a 5, NULL até o cliente avaliar
    cliente_comentario          TEXT     ?,
    prestador_nota              TINYINT  ?,   -- 1 a 5, NULL até o prestador avaliar
    prestador_comentario        TEXT     ?
)
```

## Restrições e Índices Relevantes

```sql
-- Garantir que prestador não tem locais (pois pertence a cliente) e cliente não tem disponibilidade (pois pertence a prestador)
    -- Enforçado na aplicação (RN02)

-- Busca por categoria (RF11)
INDEX idx_servico_categoria ON servicos(id_categoria);
INDEX idx_prestador_categoria ON prestadores(id_categoria);

-- Busca de agendamentos por status (RF12)
INDEX idx_agend_status ON agendamentos(status);

-- Verificação de sobreposição de datas (disponibilidade)
INDEX idx_agend_prestador_datas ON agendamentos(id_prestador, datetime_inicio, datetime_fim);
```