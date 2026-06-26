# API Endpoints

> Implementação: PHP flat-file em `backend/api/`. Dados recebidos via `$_POST` (mutações) ou `$_GET` (leituras). Respostas em JSON.
> Auth: sessões PHP (`$_SESSION`) a implementar conforme RNF05. Enquanto não implementadas, endpoints com `✓` recebem `id_usuario` como parâmetro explícito.

## Autenticação

| Método | Rota | Auth | Arquivo | Descrição |
|--------|------|------|---------|-----------|
| POST | `/auth/cadastro/cliente` | ✗ | `auth/cadastro_cliente.php` | Cria conta de Cliente — body: `email`, `senha`, `nome`, `telefone` |
| POST | `/auth/cadastro/prestador` | ✗ | `auth/cadastro_prestador.php` | Cria conta de Prestador — body: `email`, `senha`, `nome`, `telefone`, `id_categoria`, `descricao_profissional`, `cep`, `logradouro`, `bairro`, `cidade`, `estado` |
| POST | `/auth/login` | ✗ | `auth/login.php` | Autentica — body: `email`, `senha`. Retorna `id_usuario`, `nome`, `tipo` (`cliente`\|`prestador`) |
| POST | `/auth/logout` | ✓ | `auth/logout.php` | Encerra sessão (stub até RNF05 ser implementado) |

## Perfil Próprio (RF04, RF17)

| Método | Rota | Auth | Arquivo | Descrição |
|--------|------|------|---------|-----------|
| GET | `/me` | ✓ | `me/get.php` | Dados do usuário logado — param: `id_usuario` |
| PATCH | `/me` | ✓ | `me/update.php` | Atualiza dados pessoais — body: `id_usuario`, opcionais: `nome`, `telefone`, `senha` |
| DELETE | `/me` | ✓ | `me/delete.php` | Exclui conta (RF17, RN01) — body: `id_usuario` |

## Locais — exclusivo Cliente (RF05, RF07, RF08)

| Método | Rota | Auth | Arquivo | Descrição |
|--------|------|------|---------|-----------|
| GET | `/me/locais` | ✓ | `me/locais/list.php` | Lista todos os locais do Cliente — param: `id_usuario` |
| POST | `/me/locais` | ✓ | `me/locais/create.php` | Cria local — body: `id_usuario`, `nome`, `cep`, `logradouro`, `numero`, `bairro`, `cidade`, `estado`, opcional: `complemento` |
| GET | `/me/locais/{id_local}` | ✓ | `me/locais/get.php` | Detalhe do local — param: `id_local` |
| PUT | `/me/locais/{id_local}` | ✓ | `me/locais/update.php` | Atualiza local — body: `id_local` + campos opcionais |
| DELETE | `/me/locais/{id_local}` | ✓ | `me/locais/delete.php` | Remove local — body: `id_local` |

## Prestadores — Busca Pública (RF07, RF08, RNF06)

| Método | Rota | Auth | Arquivo | Descrição |
|--------|------|------|---------|-----------|
| GET | `/prestadores` | ✗ | `prestadores/list.php` | Busca prestadores — params opcionais: `id_categoria`, `preco_min`, `preco_max`. CEP exato nunca exposto (RNF06) |
| GET | `/prestadores/{id_prestador}` | ✗ | `prestadores/get.php` | Perfil público: descrição, serviços, avaliações — param: `id_usuario` (RF04) |

## Perfil do Prestador — exclusivo Prestador

| Método | Rota | Auth | Arquivo | Descrição |
|--------|------|------|---------|-----------|
| PATCH | `/me/prestador` | ✓ | `me/prestador.php` | Atualiza perfil profissional — body: `id_usuario`, opcionais: `descricao_profissional`, `cep`, `logradouro`, `bairro`, `cidade`, `estado`, `id_categoria` |

### Disponibilidade (RF06)

| Método | Rota | Auth | Arquivo | Descrição |
|--------|------|------|---------|-----------|
| GET | `/me/disponibilidade` | ✓ | `me/disponibilidade/get.php` | Agenda semanal configurada — param: `id_usuario` |
| PUT | `/me/disponibilidade` | ✓ | `me/disponibilidade/update.php` | Substitui agenda semanal completa — body: `id_usuario`, `disponibilidades` (JSON: `[{dia_semana, hora_inicio, hora_fim}]`) |

### Serviços do Prestador

| Método | Rota | Auth | Arquivo | Descrição |
|--------|------|------|---------|-----------|
| GET | `/me/servicos` | ✓ | `me/servicos/list.php` | Lista serviços cadastrados — param: `id_usuario` |
| POST | `/me/servicos` | ✓ | `me/servicos/create.php` | Adiciona serviço ao catálogo pessoal — body: `id_usuario`, `id_servico`, `tipo_cobranca`, `preco_base` |
| PUT | `/me/servicos/{id_servico}` | ✓ | `me/servicos/update.php` | Atualiza `tipo_cobranca` e `preco_base` — body: `id_usuario`, `id_servico`, `tipo_cobranca`, `preco_base` |
| DELETE | `/me/servicos/{id_servico}` | ✓ | `me/servicos/delete.php` | Remove serviço do catálogo pessoal — body: `id_usuario`, `id_servico` |

## Catálogo Global

| Método | Rota | Auth | Arquivo | Descrição |
|--------|------|------|---------|-----------|
| GET | `/categorias` | ✗ | `catalogo/categorias_list.php` | Lista todas as categorias |
| GET | `/categorias/{id_categoria}/servicos` | ✗ | `catalogo/categorias_servicos.php` | Serviços de uma categoria — param: `id_categoria` |
| GET | `/servicos` | ✗ | `catalogo/servicos_list.php` | Todos os serviços do catálogo |
| GET | `/servicos/{id_servico}` | ✗ | `catalogo/servicos_get.php` | Detalhe de um serviço — param: `id_servico` |

## Agendamentos (RF09, RF10, RF11, RF12)

| Método | Rota | Auth | Arquivo | Descrição |
|--------|------|------|---------|-----------|
| GET | `/agendamentos` | ✓ | `agendamentos/list.php` | Lista agendamentos — params: `id_usuario`, `tipo` (`cliente`\|`prestador`), opcional: `status` |
| POST | `/agendamentos` | ✓ | `agendamentos/create.php` | Cliente cria solicitação (RF09, RN10) — body: `id_usuario`, `id_prestador`, `id_servico`, `id_local`, `descricao`, `data_hora_inicio`, `data_hora_fim` |
| GET | `/agendamentos/{id_agendamento}` | ✓ | `agendamentos/get.php` | Detalhe do agendamento — param: `id_agendamento` |

### Transições de Estado

| Método | Rota | Auth | Arquivo | Descrição |
|--------|------|------|---------|-----------|
| POST | `/agendamentos/{id_agendamento}/orcamento` | ✓ | `agendamentos/orcamento.php` | Prestador envia orçamento (RF10, RN11) — body: `id_agendamento`, `id_usuario` (prestador), `valor`, `tipo_cobranca`. Requer status = `aguardando_orcamento` |
| POST | `/agendamentos/{id_agendamento}/confirmar` | ✓ | `agendamentos/confirmar.php` | Cliente aceita orçamento (RF11, RN05) — body: `id_agendamento`, `id_usuario` (cliente). Requer status = `orcamento_enviado` |
| POST | `/agendamentos/{id_agendamento}/cancelar` | ✓ | `agendamentos/cancelar.php` | Cancela agendamento (RN06) — body: `id_agendamento`, `id_usuario`. Requer status ∈ `{aguardando_orcamento, orcamento_enviado, confirmado}` |
| POST | `/agendamentos/{id_agendamento}/iniciar` | ✓ | `agendamentos/iniciar.php` | Prestador inicia serviço — body: `id_agendamento`, `id_usuario` (prestador). Requer status = `confirmado` |
| POST | `/agendamentos/{id_agendamento}/concluir` | ✓ | `agendamentos/concluir.php` | Prestador conclui serviço — body: `id_agendamento`, `id_usuario` (prestador). Requer status = `em_andamento` |

### Avaliações (RF13, RF14, RN03, RN04)

| Método | Rota | Auth | Arquivo | Descrição |
|--------|------|------|---------|-----------|
| POST | `/agendamentos/{id_agendamento}/avaliacao` | ✓ | `agendamentos/avaliacoes/create.php` | Submete avaliação — body: `id_agendamento`, `id_usuario`, `nota` (1–5), `comentario`. Requer status = `concluido`. Cada parte avalia no máximo uma vez (RN04) |
| GET | `/agendamentos/{id_agendamento}/avaliacao` | ✓ | `agendamentos/avaliacoes/get.php` | Retorna avaliações do agendamento — param: `id_agendamento` |

## Fluxo de Status (RF12)

| De | Ação | Para | Quem |
|----|------|------|------|
| `aguardando_orcamento` | `/orcamento` | `orcamento_enviado` | Prestador |
| `orcamento_enviado` | `/confirmar` | `confirmado` | Cliente |
| `orcamento_enviado` | `/cancelar` | `cancelado` | Cliente ou Prestador |
| `aguardando_orcamento` | `/cancelar` | `cancelado` | Cliente ou Prestador |
| `confirmado` | `/cancelar` | `cancelado` | Cliente ou Prestador |
| `confirmado` | `/iniciar` | `em_andamento` | Prestador |
| `em_andamento` | `/concluir` | `concluido` | Prestador |

---

> **Schema:** FKs em `disponibilidade`, `prestador_servicos`, `locais` e `agendamentos` referenciam `(id_usuario)` nas tabelas-pai `prestadores` e `clientes`. Os nomes das colunas locais (`id_prestador`, `id_cliente`) foram mantidos para clareza.
