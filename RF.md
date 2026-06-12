# Requisitos Funcionais

| ID | Descrição | Prioridade |
|----|-----------|------------|
| RF01 | Permitir cadastro de **Cliente** com nome, e-mail, senha, telefone e CEP. | Alta |
| RF02 | Permitir cadastro de **Prestador** com nome, e-mail, senha, telefone, CEP, categoria de serviço, descrição profissional, serviços oferecidos (título, descrição e preço estimado) e upload opcional de documentos de verificação. | Alta |
| RF03 | Autenticar usuários via e-mail e senha, com suporte a logout. | Alta |
| RF04 | Exibir perfil público do Prestador (foto, descrição, serviços, portfólio e avaliações) e permitir que ambos os perfis editem seus dados de contato, foto, descrição, portfólio e senha. | Alta |
| RF05 | Permitir que o Prestador configure sua agenda: dias da semana e horários disponíveis para novos atendimentos. | Alta |
| RF06 | Permitir que o Cliente acesse a agenda pública do Prestador, selecione um horário livre, descreva o serviço e submeta a solicitação de agendamento. | Alta |
| RF07 | Notificar o Prestador sobre novas solicitações e permitir que ele **aceite** ou **recuse** o agendamento dentro de um prazo estipulado. | Alta |
| RF08 | Manter histórico completo de agendamentos com os estados: *Pendente*, *Confirmado*, *Em Andamento*, *Concluído* e *Cancelado*. | Alta |
| RF09 | Permitir busca de Prestadores com filtros por categoria, raio de distância (baseado em CEP), disponibilidade e faixa de preço — exibindo distância aproximada (ex.: ~3 km) sem expor o endereço exato. | Alta |
| RF10 | Permitir que o **Cliente** avalie o Prestador após serviço concluído, com nota (1–5) e comentário público no perfil. | Alta |
| RF11 | Permitir que o **Prestador** avalie o Cliente após serviço concluído, com nota (1–5) visível apenas internamente. | Baixa |
| RF12 | Calcular e exibir ranking de Prestadores por média ponderada de avaliações, quantidade de reviews e proximidade ao Cliente. | Média |
| RF13 | Disparar notificações na plataforma e por e-mail ao alterar o estado de um agendamento. | Baixa |
| RF14 | Permitir que o usuário exclua sua conta, com remoção ou anonimização dos seus dados no banco. | Média |

---

## Roadmap — Funcionalidades Futuras

| ID | Descrição |
|----|-----------|
| RF-F01 | **Gateway de Pagamento:** retenção do valor pago e liberação automática ao Prestador após confirmação de conclusão. |
| RF-F02 | **Chat Interno em Tempo Real:** canal de comunicação direto na plataforma, sem exposição de contatos pessoais. |
| RF-F03 | **Visibilidade restrita do perfil do Cliente:** exibir perfil do Cliente apenas para Prestadores com agendamento ativo ou histórico em comum. |