# Requisitos Funcionais

| ID | Descrição | Prioridade |
|----|-----------|------------|
| RF01 | Permitir cadastro de **Cliente** com nome, e-mail, senha, telefone e CEP. | Alta |
| RF02 | Permitir cadastro de **Prestador** com nome, e-mail, senha, telefone, CEP, categoria de serviço, descrição profissional, serviços oferecidos (título, descrição e preço base) e upload opcional de documentos de verificação. | Alta |
| RF03 | Autenticar usuários via e-mail e senha, com suporte a logout. | Alta |
| RF04 | Exibir perfil público do Prestador (foto, descrição, catálogo de serviços, portfólio e avaliações de clientes) e permitir que ambos os perfis editem seus dados de contato, foto, descrição, portfólio e senha. | Alta |
| RF05 | Permitir que o Prestador configure sua disponibilidade semanal: dias da semana com horário de início e fim de atendimento. | Alta |
| RF06 | Permitir que o Cliente acesse o perfil do Prestador, escolha um serviço do catálogo, selecione um horário disponível e submeta uma solicitação com descrição do problema. | Alta |
| RF07 | Ao receber uma solicitação, permitir que o Prestador analise os detalhes, defina o valor do serviço e envie um orçamento ao Cliente. | Alta |
| RF08 | Permitir que o Cliente aceite ou recuse o orçamento enviado pelo Prestador. | Alta |
| RF09 | Manter histórico completo de agendamentos com os estados: *Pendente*, *Orçamento Enviado*, *Aguardando Confirmação*, *Confirmado*, *Em Andamento*, *Concluído* e *Cancelado*. | Alta |
| RF10 | Permitir busca de Prestadores com filtros por categoria, raio de distância (baseado em CEP), disponibilidade e faixa de preço — exibindo distância aproximada (ex.: ~3 km) sem expor o endereço exato. | Alta |
| RF11 | Após serviço concluído, permitir que o **Cliente** avalie o Prestador com nota (1–5) e comentário, exibidos publicamente no perfil do Prestador. | Alta |
| RF12 | Após serviço concluído, permitir que o **Prestador** avalie o Cliente com nota (1–5), visível apenas internamente na plataforma. | Baixa |
| RF13 | Calcular e exibir ranking de Prestadores por média ponderada de avaliações recebidas, quantidade de reviews e proximidade ao Cliente. | Média |
| RF14 | Disparar notificações na plataforma e por e-mail ao alterar o estado de um agendamento. | Baixa |
| RF15 | Permitir que o usuário exclua sua conta, com remoção ou anonimização dos seus dados no banco. | Média |

---

## Roadmap — Funcionalidades Futuras

| ID | Descrição |
|----|-----------|
| RF-F01 | **Gateway de Pagamento:** retenção do valor pago e liberação automática ao Prestador após confirmação de conclusão. |
| RF-F02 | **Chat Interno em Tempo Real:** canal de comunicação direto na plataforma, sem exposição de contatos pessoais. |
| RF-F03 | **Visibilidade restrita do perfil do Cliente:** exibir perfil do Cliente apenas para Prestadores com agendamento ativo ou histórico em comum. |