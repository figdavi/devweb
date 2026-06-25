# API Endpoints

## Autenticação

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/auth/cadastro/cliente` | ✗ | Cria conta de Cliente |
| POST | `/auth/cadastro/prestador` | ✗ | Cria conta de Prestador |
| POST | `/auth/login` | ✗ | Inicia sessão — retorna tipo: `cliente` ou `prestador` |
| POST | `/auth/logout` | ✓ | Encerra sessão |

## Perfil Próprio

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/me` | ✓ | Retorna dados do usuário logado |
| PATCH | `/me` | ✓ | Atualiza dados pessoais: nome, telefone, senha, foto |
| DELETE | `/me` | ✓ | Exclui conta e anonimiza dados (RF17, RN01) |

## Locais — exclusivo Cliente

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/me/locais` | ✓ | Lista todos os locais do Cliente |
| POST | `/me/locais` | ✓ | Cria novo local — body: nome, CEP, logradouro, número, bairro, cidade, estado |
| GET | `/me/locais/{id_local}` | ✓ | Retorna um local específico |
| PUT | `/me/locais/{id_local}` | ✓ | Atualiza local completo |
| DELETE | `/me/locais/{id_local}` | ✓ | Remove local |

## Prestadores — Busca Pública

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/prestadores` | ✗ | Busca prestadores — query params: `id_local` (CEP de referência, RN07/RN08), `id_categoria`, `id_servico`, `preco_min`, `preco_max`, `raio_km`, `disponivel_em` |
| GET | `/prestadores/{id_prestador}` | ✗ | Perfil público: descrição, serviços, portfólio e avaliações (RF04) |

## Perfil do Prestador — exclusivo Prestador

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| PATCH | `/me/prestador` | ✓ | Atualiza descrição profissional, CEP e categoria |

### Disponibilidade

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/me/disponibilidade` | ✓ | Retorna agenda semanal configurada |
| PUT | `/me/disponibilidade` | ✓ | Substitui agenda semanal completa — body: array de `{dia_semana, hora_inicio, hora_fim}` |

### Serviços do Prestador

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/me/servicos` | ✓ | Lista serviços cadastrados pelo Prestador |
| POST | `/me/servicos` | ✓ | Adiciona serviço do catálogo — body: `id_servico`, `tipo_cobranca`, `preco_base` |
| PUT | `/me/servicos/{id_servico}` | ✓ | Atualiza `tipo_cobranca` e `preco_base` de um serviço |
| DELETE | `/me/servicos/{id_servico}` | ✓ | Remove serviço do catálogo pessoal |

## Catálogo Global

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/categorias` | ✗ | Lista todas as categorias disponíveis |
| GET | `/categorias/{id_categoria}/servicos` | ✗ | Lista serviços de uma categoria |
| GET | `/servicos` | ✗ | Lista todos os serviços do catálogo |
| GET | `/servicos/{id_servico}` | ✗ | Retorna detalhe de um serviço |

## Agendamentos

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/agendamentos` | ✓ | Lista agendamentos do usuário logado — filtrados automaticamente por sessão (cliente ou prestador). Query param: `status` |
| POST | `/agendamentos` | ✓ | Cliente cria solicitação — body: `id_prestador`, `id_servico`, `id_local`, `descricao_problema`, `data_hora_inicio`, `data_hora_fim` |
| GET | `/agendamentos/{id_agendamento}` | ✓ | Retorna detalhe de um agendamento |

### Transições de Estado

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/agendamentos/{id_agendamento}/orcamento` | ✓ | Prestador envia orçamento — body: `preco_final`, `tipo_cobranca`. Requer: status = `aguardando_orcamento` |
| POST | `/agendamentos/{id_agendamento}/confirmar` | ✓ | Cliente aceita orçamento. Requer: status = `orcamento_enviado` |
| POST | `/agendamentos/{id_agendamento}/cancelar` | ✓ | Cliente ou Prestador cancela (RN06). Requer: status ∈ `{aguardando_orcamento, orcamento_enviado, confirmado}` |
| POST | `/agendamentos/{id_agendamento}/iniciar` | ✓ | Prestador marca como em andamento. Requer: status = `confirmado` |
| POST | `/agendamentos/{id_agendamento}/concluir` | ✓ | Prestador marca como concluído. Requer: status = `em_andamento` |

### Avaliações

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/agendamentos/{id_agendamento}/avaliacao` | ✓ | Cliente ou Prestador submete avaliação (RF12, RF13) — body: `nota` (1–5), `comentario`. Requer: status = `concluido`. Cada parte avalia no máximo uma vez (RN04) |
| GET | `/agendamentos/{id_agendamento}/avaliacao` | ✓ | Retorna avaliações do agendamento |

## Fluxo de Status

| De | Ação | Para | Quem |
|----|------|------|------|
| `aguardando_orcamento` | `/orcamento` | `orcamento_enviado` | Prestador |
| `orcamento_enviado` | `/confirmar` | `confirmado` | Cliente |
| `orcamento_enviado` | `/cancelar` | `cancelado` | Cliente ou Prestador |
| `aguardando_orcamento` | `/cancelar` | `cancelado` | Cliente ou Prestador |
| `confirmado` | `/cancelar` | `cancelado` | Cliente ou Prestador |
| `confirmado` | `/iniciar` | `em_andamento` | Prestador |
| `em_andamento` | `/concluir` | `concluido` | Prestador |