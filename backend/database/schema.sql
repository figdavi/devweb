CREATE DATABASE IF NOT EXISTS servixus;

USE servixus;

-- Drop na ordem inversa das FKs para evitar constraint errors
DROP TABLE IF EXISTS avaliacoes;
DROP TABLE IF EXISTS agendamentos;
DROP TABLE IF EXISTS disponibilidade;
DROP TABLE IF EXISTS prestador_servicos;
DROP TABLE IF EXISTS locais;
DROP TABLE IF EXISTS servicos;
DROP TABLE IF EXISTS prestadores;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS categorias;

CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario INT AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  nome VARCHAR(150) NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  PRIMARY KEY (id_usuario)
);

CREATE TABLE IF NOT EXISTS categorias (
  id_categoria INT AUTO_INCREMENT,
  nome VARCHAR(100) UNIQUE NOT NULL,
  PRIMARY KEY (id_categoria)
);

CREATE TABLE IF NOT EXISTS prestadores (
  id_usuario INT,
  id_categoria INT NOT NULL,
  descricao_profissional TEXT,
  cep VARCHAR(9) NOT NULL,
  logradouro VARCHAR(255) NOT NULL,
  bairro VARCHAR(100) NOT NULL,
  cidade VARCHAR(100) NOT NULL,
  estado VARCHAR(50) NOT NULL,
  PRIMARY KEY (id_usuario),
  FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario),
  FOREIGN KEY (id_categoria) REFERENCES categorias (id_categoria)
);

CREATE TABLE IF NOT EXISTS clientes (
  id_usuario INT,
  PRIMARY KEY (id_usuario),
  FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
);

CREATE TABLE IF NOT EXISTS locais (
  id_local INT AUTO_INCREMENT,
  id_cliente INT NOT NULL,
  nome VARCHAR(100) NOT NULL,
  cep VARCHAR(9) NOT NULL,
  logradouro VARCHAR(255) NOT NULL,
  numero VARCHAR(20) NOT NULL,
  bairro VARCHAR(100) NOT NULL,
  complemento VARCHAR(255),
  cidade VARCHAR(100) NOT NULL,
  estado VARCHAR(50) NOT NULL,
  PRIMARY KEY (id_local),
  FOREIGN KEY (id_cliente) REFERENCES clientes (id_usuario) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS disponibilidade (
  id_prestador INT NOT NULL,
  dia_semana TINYINT NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  PRIMARY KEY (id_prestador, dia_semana),
  FOREIGN KEY (id_prestador) REFERENCES prestadores (id_usuario) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS servicos (
  id_servico INT AUTO_INCREMENT,
  id_categoria INT NOT NULL UNIQUE,
  titulo VARCHAR(150) NOT NULL UNIQUE,
  descricao TEXT,
  PRIMARY KEY (id_servico),
  FOREIGN KEY (id_categoria) REFERENCES categorias (id_categoria)
);

CREATE TABLE IF NOT EXISTS prestador_servicos (
  id_prestador INT NOT NULL,
  id_servico INT NOT NULL,
  tipo_cobranca ENUM('hora', 'diaria', 'servico') NOT NULL,
  preco_base DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (id_prestador, id_servico),
  FOREIGN KEY (id_prestador) REFERENCES prestadores (id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_servico) REFERENCES servicos (id_servico) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS agendamentos (
  id_agendamento INT AUTO_INCREMENT,
  id_cliente INT NOT NULL,
  id_prestador INT NOT NULL,
  id_servico INT NOT NULL,
  id_local INT NOT NULL,
  descricao TEXT,
  tipo_cobranca ENUM('hora', 'diaria', 'servico') NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  data_hora_criacao DATETIME NOT NULL,
  data_hora_inicio DATETIME NOT NULL,
  data_hora_fim DATETIME NOT NULL,
  cliente_confirmou BOOLEAN DEFAULT FALSE,
  status ENUM('aguardando_orcamento', 'orcamento_realizado', 'confirmado', 'em_andamento', 'concluido', 'cancelado') DEFAULT 'aguardando_orcamento',
  PRIMARY KEY (id_agendamento),
  FOREIGN KEY (id_cliente) REFERENCES clientes (id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_prestador) REFERENCES prestadores (id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_servico) REFERENCES servicos (id_servico) ON DELETE CASCADE,
  FOREIGN KEY (id_local) REFERENCES locais (id_local) ON DELETE CASCADE
);

-- cliente_nota e prestador_nota podem ser NULL, visto que a avaliação é criada na hora da conclusão do agendamento, sendo necesário a espera que o cliente ou prestador avaliem (ou não).
CREATE TABLE IF NOT EXISTS avaliacoes (
  id_agendamento INT NOT NULL,
  cliente_nota TINYINT CHECK (cliente_nota BETWEEN 1 AND 5),
  cliente_comentario TEXT,
  prestador_nota TINYINT CHECK (prestador_nota BETWEEN 1 AND 5),
  prestador_comentario TEXT,
  PRIMARY KEY (id_agendamento),
  FOREIGN KEY (id_agendamento) REFERENCES agendamentos (id_agendamento) ON DELETE CASCADE
);


